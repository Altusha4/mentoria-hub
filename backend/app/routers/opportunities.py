from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from ..database import get_db
from ..models import Opportunity, SavedOpportunity, StudentProfile
from ..schemas import Opportunity as OpportunitySchema, SavedOpportunityResponse
from ..ml_service import success_chance_analyzer

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])

class SuccessChanceResponse(BaseModel):
    success_probability: float  # 0-1
    percentage: float  # 0-100
    score_breakdown: Dict[str, float]
    matching_skills: List[str]
    missing_skills: List[str]
    academic_details: Dict[str, Any]
    recommendations: List[str]

@router.get("/", response_model=List[OpportunitySchema])
def list_opportunities(
    category: Optional[str] = None,
    direction: Optional[str] = None,
    format: Optional[str] = None,
    grade_level: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Opportunity)

    # Filters
    if category:
        query = query.filter(Opportunity.category == category)
    if direction:
        query = query.filter(Opportunity.direction == direction)
    if format:
        query = query.filter(Opportunity.format == format)
    if grade_level:
        query = query.filter(Opportunity.grade_level.contains(grade_level))

    # Search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(search_term),
                Opportunity.description.ilike(search_term),
                Opportunity.tags.ilike(search_term)
            )
        )

    # Pagination & Sort
    total = query.count()
    results = query.order_by(Opportunity.deadline).offset(skip).limit(limit).all()

    return results

@router.get("/{opportunity_id}", response_model=OpportunitySchema)
def get_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opportunity

@router.post("/{opportunity_id}/save/{student_id}")
def save_opportunity(opportunity_id: int, student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = db.query(SavedOpportunity).filter(
        and_(SavedOpportunity.student_id == student_id, SavedOpportunity.opportunity_id == opportunity_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already saved")

    saved = SavedOpportunity(student_id=student_id, opportunity_id=opportunity_id)
    db.add(saved)
    db.commit()
    return {"status": "saved"}

@router.get("/{student_id}/saved", response_model=List[SavedOpportunityResponse])
def get_saved_opportunities(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    saved = db.query(SavedOpportunity).filter(SavedOpportunity.student_id == student_id).all()
    return saved

@router.delete("/{opportunity_id}/unsave/{student_id}")
def unsave_opportunity(opportunity_id: int, student_id: int, db: Session = Depends(get_db)):
    saved = db.query(SavedOpportunity).filter(
        and_(SavedOpportunity.student_id == student_id, SavedOpportunity.opportunity_id == opportunity_id)
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Not saved")

    db.delete(saved)
    db.commit()
    return {"status": "unsaved"}

@router.get("/{student_id}/recommended", response_model=List[OpportunitySchema])
def get_recommended_opportunities(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get opportunities matching student's interests
    if not student.interests:
        return db.query(Opportunity).order_by(Opportunity.deadline).all()

    interests = student.interests.split(",")
    query = db.query(Opportunity)

    for interest in interests:
        query = query.filter(or_(
            Opportunity.tags.contains(interest.strip()),
            Opportunity.direction.contains(interest.strip())
        ))

    return query.order_by(Opportunity.deadline).all()

@router.get("/{opportunity_id}/success-chance/{student_id}", response_model=SuccessChanceResponse)
def analyze_success_chance(
    opportunity_id: int,
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    Анализирует вероятность получения оффера на программу

    Args:
        opportunity_id: ID программы/возможности
        student_id: ID студента

    Returns:
        {
            "success_probability": 0.75,  # 0-1
            "percentage": 75.0,
            "score_breakdown": {...},
            "matching_skills": [...],
            "missing_skills": [...],
            "academic_details": {...},
            "recommendations": [...]
        }
    """
    # Получаем студента
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Получаем программу
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Подготавливаем данные студента
    student_profile = {
        'interests': student.interests or '',
        'subjects': student.subjects or '',
        'goals': student.goals or '',
        'bio': student.bio or '',
        'cv_text': student.cv_text or '',
        'activities': student.activities or '',
        'certificates': student.certificates or '',
        'skills': student.skills or '',  # NEW! Explicit skills
        'motivation_letter': student.motivation_letter or '',
        'grade': student.grade,
        'gpa': student.gpa,
        'ielts_score': student.ielts_score,
        'toefl_score': student.toefl_score,
        'sat_score': student.sat_score
    }

    # Подготавливаем данные программы
    opportunity_data = {
        'title': opportunity.title,
        'direction': opportunity.direction,
        'requirements': opportunity.requirements or '',
        'grade_level': opportunity.grade_level
    }

    # Анализируем шансы
    analysis = success_chance_analyzer.analyze_success_chance(student_profile, opportunity_data)

    # Возвращаем результат
    return {
        'success_probability': analysis['success_probability'],
        'percentage': round(analysis['success_probability'] * 100, 1),
        'score_breakdown': analysis['score_breakdown'],
        'matching_skills': analysis['matching_skills'],
        'missing_skills': analysis['missing_skills'],
        'academic_details': analysis['academic_details'],
        'recommendations': analysis['recommendations']
    }

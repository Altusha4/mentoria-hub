from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date
from typing import Optional, List
from ..database import get_db
from ..models import Opportunity, SavedOpportunity, StudentProfile
from ..schemas import Opportunity as OpportunitySchema, SavedOpportunityResponse

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])

@router.get("/", response_model=List[OpportunitySchema])
def list_opportunities(
    category: Optional[str] = None,
    direction: Optional[str] = None,
    format: Optional[str] = None,
    grade_level: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Opportunity)

    if category:
        query = query.filter(Opportunity.category == category)
    if direction:
        query = query.filter(Opportunity.direction == direction)
    if format:
        query = query.filter(Opportunity.format == format)
    if grade_level:
        query = query.filter(Opportunity.grade_level.contains(grade_level))

    return query.order_by(Opportunity.deadline).all()

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

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import StudentProfile
from ..ml_service import recommendation_engine
from pydantic import BaseModel

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

class RecommendationRequest(BaseModel):
    interests: List[str]
    top_k: int = 10

class RecommendationResponse(BaseModel):
    post_id: int
    title: str
    category: str
    score: float

@router.post("/get", response_model=List[RecommendationResponse])
def get_recommendations(request: RecommendationRequest):
    """
    Получить рекомендации постов на основе интересов студента

    Args:
        request: { "interests": ["STEM", "Business"], "top_k": 10 }

    Returns:
        list: рекомендованные посты с scores
    """
    if not recommendation_engine.is_ready():
        raise HTTPException(
            status_code=503,
            detail="ML recommendation engine is not ready"
        )

    if not request.interests:
        raise HTTPException(
            status_code=400,
            detail="Interests list cannot be empty"
        )

    # Проверяем что интересы существуют
    available_interests = recommendation_engine.get_available_interests()
    invalid_interests = [i for i in request.interests if i not in available_interests]

    if invalid_interests:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid interests: {invalid_interests}. Available: {available_interests}"
        )

    # Получаем рекомендации
    recommendations = recommendation_engine.get_recommendations(
        interests_list=request.interests,
        top_k=request.top_k
    )

    return recommendations

@router.get("/interests")
def get_available_interests():
    """Получить список доступных интересов"""
    if not recommendation_engine.is_ready():
        return {"interests": []}

    return {
        "interests": recommendation_engine.get_available_interests(),
        "details": recommendation_engine.student_interests
    }

@router.get("/status")
def get_engine_status():
    """Получить статус ML движка"""
    return {
        "ready": recommendation_engine.is_ready(),
        "total_posts": len(recommendation_engine.posts_embeddings),
        "total_interests": len(recommendation_engine.interests_embeddings),
        "model_name": recommendation_engine.embeddings_data.get('model_name') if recommendation_engine.embeddings_data else None,
        "version": recommendation_engine.embeddings_data.get('version') if recommendation_engine.embeddings_data else None
    }

@router.post("/student/{student_id}", response_model=List[RecommendationResponse])
def get_student_recommendations(student_id: int, top_k: int = 10, db: Session = Depends(get_db)):
    """
    Получить рекомендации для конкретного студента на основе его интересов

    Args:
        student_id: ID студента
        top_k: количество рекомендаций

    Returns:
        list: рекомендованные посты
    """
    if not recommendation_engine.is_ready():
        raise HTTPException(
            status_code=503,
            detail="ML recommendation engine is not ready"
        )

    # Получаем данные студента
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Парсим интересы студента
    interests_str = student.interests or ""
    interests_list = [i.strip() for i in interests_str.split(",") if i.strip()]

    if not interests_list:
        return []

    # Получаем рекомендации с учетом bio студента
    recommendations = recommendation_engine.get_recommendations_with_bio(
        interests_list=interests_list,
        bio=student.bio,
        top_k=top_k
    )

    return recommendations

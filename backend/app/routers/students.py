from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import StudentProfile, Enrollment
from ..schemas import StudentProfile as StudentProfileSchema, StudentProfileCreate
from pydantic import BaseModel

router = APIRouter(prefix="/api/students", tags=["students"])

@router.post("/", response_model=StudentProfileSchema)
def create_student(student: StudentProfileCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(StudentProfile).filter(StudentProfile.email == student.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_student = StudentProfile(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.get("/{student_id}", response_model=StudentProfileSchema)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{student_id}", response_model=StudentProfileSchema)
def update_student(student_id: int, student: StudentProfileCreate, db: Session = Depends(get_db)):
    db_student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    for key, value in student.dict().items():
        setattr(db_student, key, value)

    db.commit()
    db.refresh(db_student)
    return db_student

@router.get("/email/{email}", response_model=StudentProfileSchema)
def get_student_by_email(email: str, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.email == email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

class LeaderboardEntry(BaseModel):
    rank: int
    student_id: int
    name: str
    enrolled_courses: int
    average_progress: float

@router.get("/leaderboard/top", response_model=List[LeaderboardEntry])
def get_leaderboard(limit: int = 100, db: Session = Depends(get_db)):
    """Get top students by enrolled courses count"""
    # Query students with their enrollment data
    students_with_enrollments = db.query(
        StudentProfile.id,
        StudentProfile.first_name,
        StudentProfile.last_name,
        func.count(Enrollment.id).label('enrolled_count'),
        func.avg(Enrollment.progress).label('avg_progress')
    ).outerjoin(Enrollment).group_by(StudentProfile.id).order_by(
        func.count(Enrollment.id).desc(),
        StudentProfile.id
    ).limit(limit).all()

    leaderboard = []
    for rank, entry in enumerate(students_with_enrollments, 1):
        leaderboard.append(LeaderboardEntry(
            rank=rank,
            student_id=entry.id,
            name=f"{entry.first_name} {entry.last_name}",
            enrolled_courses=entry.enrolled_count or 0,
            average_progress=round(entry.avg_progress or 0, 1)
        ))

    return leaderboard

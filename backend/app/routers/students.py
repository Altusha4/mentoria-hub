from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import StudentProfile, Enrollment
from ..schemas import StudentProfile as StudentProfileSchema, StudentProfileCreate, StudentProfileUpdate
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
def update_student(student_id: int, student: StudentProfileUpdate, db: Session = Depends(get_db)):
    db_student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Only update fields that were provided (not None)
    for key, value in student.dict(exclude_unset=True).items():
        if value is not None:
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


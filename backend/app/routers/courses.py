from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Course, Lesson, Enrollment, StudentProfile, LessonProgress
from ..schemas import Course as CourseSchema, Lesson as LessonSchema, EnrollmentResponse

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/", response_model=List[CourseSchema])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

@router.get("/{course_id}", response_model=CourseSchema)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/{course_id}/enroll/{student_id}")
def enroll_course(course_id: int, student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student_id and Enrollment.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = Enrollment(student_id=student_id, course_id=course_id, progress=0.0)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return {"status": "enrolled", "enrollment_id": enrollment.id}

@router.get("/{student_id}/enrolled", response_model=List[EnrollmentResponse])
def get_enrolled_courses(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
    return enrollments

@router.post("/lesson/{lesson_id}/complete/{student_id}")
def complete_lesson(lesson_id: int, student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    progress = db.query(LessonProgress).filter(
        LessonProgress.student_id == student_id and LessonProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        progress = LessonProgress(student_id=student_id, lesson_id=lesson_id, completed=True)
        db.add(progress)
    else:
        progress.completed = True

    from datetime import datetime
    progress.completed_at = datetime.utcnow()
    db.commit()

    # Update enrollment progress
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id and Enrollment.course_id == lesson.course_id
    ).first()
    if enrollment:
        total_lessons = db.query(Lesson).filter(Lesson.course_id == lesson.course_id).count()
        completed_lessons = db.query(LessonProgress).filter(
            LessonProgress.student_id == student_id and
            LessonProgress.lesson_id.in_(
                db.query(Lesson.id).filter(Lesson.course_id == lesson.course_id)
            ) and
            LessonProgress.completed == True
        ).count()
        enrollment.progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        db.commit()

    return {"status": "completed"}

@router.get("/lesson/{lesson_id}", response_model=LessonSchema)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List
from ..database import get_db
from ..models import Course, Lesson, Enrollment, StudentProfile, LessonProgress, Comment
from ..schemas import Course as CourseSchema, Lesson as LessonSchema, EnrollmentResponse, CommentCreate, CommentResponse
import io

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

    # FIX: Use commas instead of Python `and` for SQLAlchemy filter conditions
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id
    ).first()
    if existing:
        return {"status": "already_enrolled", "enrollment_id": existing.id}

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

    # FIX: Use commas instead of Python `and`
    progress = db.query(LessonProgress).filter(
        LessonProgress.student_id == student_id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        progress = LessonProgress(student_id=student_id, lesson_id=lesson_id, completed=True)
        db.add(progress)
    else:
        progress.completed = True

    from datetime import datetime
    progress.completed_at = datetime.utcnow()
    db.commit()

    # Update enrollment progress — FIX: Use commas instead of Python `and`
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == lesson.course_id
    ).first()

    if not enrollment:
        # Auto-enroll if not enrolled yet
        enrollment = Enrollment(student_id=student_id, course_id=lesson.course_id, progress=0.0)
        db.add(enrollment)
        db.commit()

    total_lessons = db.query(Lesson).filter(Lesson.course_id == lesson.course_id).count()
    
    # FIX: Get all lesson IDs for this course, then count completed ones
    course_lesson_ids = [lid[0] for lid in db.query(Lesson.id).filter(Lesson.course_id == lesson.course_id).all()]
    completed_lessons = db.query(LessonProgress).filter(
        LessonProgress.student_id == student_id,
        LessonProgress.lesson_id.in_(course_lesson_ids),
        LessonProgress.completed == True
    ).count()
    
    enrollment.progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
    
    # Mark as completed if all lessons done
    if enrollment.progress >= 100:
        enrollment.completed = True
    
    db.commit()

    return {
        "status": "completed",
        "progress": enrollment.progress,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons
    }

@router.get("/lesson/{lesson_id}", response_model=LessonSchema)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.get("/lesson/{lesson_id}/progress/{student_id}")
def get_lesson_progress(lesson_id: int, student_id: int, db: Session = Depends(get_db)):
    """Check if a specific lesson has been completed by the student."""
    progress = db.query(LessonProgress).filter(
        LessonProgress.student_id == student_id,
        LessonProgress.lesson_id == lesson_id
    ).first()
    
    return {
        "completed": progress.completed if progress else False,
        "completed_at": progress.completed_at.isoformat() if progress and progress.completed_at else None
    }

@router.get("/lesson/{lesson_id}/comments", response_model=List[CommentResponse])
def get_lesson_comments(lesson_id: int, db: Session = Depends(get_db)):
    """Get all comments for a specific lesson."""
    comments = db.query(Comment).filter(Comment.lesson_id == lesson_id).order_by(Comment.created_at.desc()).all()
    return comments

@router.post("/lesson/{lesson_id}/comments/{student_id}", response_model=CommentResponse)
def post_lesson_comment(lesson_id: int, student_id: int, comment_data: CommentCreate, db: Session = Depends(get_db)):
    """Post a new comment to a lesson."""
    # Verify lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    # Verify student exists
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_comment = Comment(
        lesson_id=lesson_id,
        student_id=student_id,
        text=comment_data.text
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.get("/{course_id}/progress/{student_id}")
def get_course_progress(course_id: int, student_id: int, db: Session = Depends(get_db)):
    """Get detailed progress for a student in a course."""
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        return {"enrolled": False, "progress": 0, "completed_lessons": []}
    
    course_lesson_ids = [lid[0] for lid in db.query(Lesson.id).filter(Lesson.course_id == course_id).all()]
    completed_progresses = db.query(LessonProgress).filter(
        LessonProgress.student_id == student_id,
        LessonProgress.lesson_id.in_(course_lesson_ids),
        LessonProgress.completed == True
    ).all()
    
    completed_lesson_ids = [p.lesson_id for p in completed_progresses]
    
    return {
        "enrolled": True,
        "progress": enrollment.progress,
        "completed": enrollment.completed,
        "completed_lessons": completed_lesson_ids
    }

@router.get("/{course_id}/certificate/{student_id}")
def generate_certificate(course_id: int, student_id: int, db: Session = Depends(get_db)):
    """Generate a professional PDF certificate for a completed course."""
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment or enrollment.progress < 100:
        raise HTTPException(status_code=400, detail="Course not completed yet")
    
    # Generate PDF
    pdf_buffer = _generate_certificate_pdf(student, course, enrollment)
    
    import urllib.parse
    filename = f"Mentoria_Certificate_{course.title.replace(' ', '_')}_{student.first_name or ''}_{student.last_name or ''}.pdf"
    encoded_filename = urllib.parse.quote(filename)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=\"certificate.pdf\"; filename*=UTF-8''{encoded_filename}"}
    )

@router.get("/{student_id}/recommended", response_model=List[CourseSchema])
def get_recommended_courses(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get courses matching student's interests
    if not student.interests:
        return db.query(Course).all()

    interests = student.interests.split(",")
    query = db.query(Course)

    for interest in interests:
        query = query.filter(or_(
            Course.tags.contains(interest.strip()),
            Course.title.contains(interest.strip())
        ))

    return query.all()

def _generate_certificate_pdf(student, course, enrollment):
    """Generate a highly professional PDF certificate with Cyrillic support."""
    from reportlab.lib.pagesizes import landscape, A4
    from reportlab.lib.units import inch, cm
    from reportlab.lib.colors import HexColor, white, black, Color
    from reportlab.pdfgen import canvas
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from datetime import datetime
    import os
    import io

    # Register Montserrat font (supports Cyrillic perfectly)
    base_dir = os.path.dirname(__file__)
    font_reg = os.path.join(base_dir, "..", "Montserrat-Regular.ttf")
    font_bold = os.path.join(base_dir, "..", "Montserrat-Bold.ttf")
    
    try:
        pdfmetrics.registerFont(TTFont('Montserrat', font_reg))
        pdfmetrics.registerFont(TTFont('Montserrat-Bold', font_bold))
        f_reg = 'Montserrat'
        f_bold = 'Montserrat-Bold'
    except Exception as e:
        print(f"Warning: Could not load Montserrat font, falling back to Helvetica: {e}")
        f_reg = 'Helvetica'
        f_bold = 'Helvetica-Bold'

    buffer = io.BytesIO()
    width, height = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    
    # --- Colors (Elegant & Professional) ---
    bg_color = HexColor('#fdfcf8')       # Warm off-white
    border_blue = HexColor('#1e3a5f')    # Deep professional navy
    accent_gold = HexColor('#d4af37')    # Muted elegant gold
    text_dark = HexColor('#1a1a1a')      # Soft black for text
    text_gray = HexColor('#555555')      # Subtle gray for secondary text
    
    # === BACKGROUND ===
    c.setFillColor(bg_color)
    c.rect(0, 0, width, height, fill=True, stroke=False)
    
    # === BORDERS ===
    # Outer thick navy border
    b_margin = 25
    c.setStrokeColor(border_blue)
    c.setLineWidth(10)
    c.rect(b_margin, b_margin, width - 2*b_margin, height - 2*b_margin)
    
    # Inner thin gold border
    i_margin = 35
    c.setStrokeColor(accent_gold)
    c.setLineWidth(1.5)
    c.rect(i_margin, i_margin, width - 2*i_margin, height - 2*i_margin)
    
    # Corner decorative squares
    c.setFillColor(border_blue)
    sq_size = 12
    # Top-left
    c.rect(i_margin - sq_size/2, height - i_margin - sq_size/2, sq_size, sq_size, fill=True, stroke=False)
    # Top-right
    c.rect(width - i_margin - sq_size/2, height - i_margin - sq_size/2, sq_size, sq_size, fill=True, stroke=False)
    # Bottom-left
    c.rect(i_margin - sq_size/2, i_margin - sq_size/2, sq_size, sq_size, fill=True, stroke=False)
    # Bottom-right
    c.rect(width - i_margin - sq_size/2, i_margin - sq_size/2, sq_size, sq_size, fill=True, stroke=False)
    
    # === HEADER ===
    c.setFillColor(border_blue)
    c.setFont(f_bold, 18)
    c.drawCentredString(width / 2, height - 90, "MENTORIA HUB")
    c.setFont(f_reg, 10)
    c.setFillColor(text_gray)
    c.drawCentredString(width / 2, height - 105, "EXCELLENCE IN EDUCATION")
    
    # Separator Line
    c.setStrokeColor(accent_gold)
    c.setLineWidth(1)
    c.line(width/2 - 50, height - 120, width/2 + 50, height - 120)

    # === MAIN TITLE ===
    c.setFillColor(border_blue)
    c.setFont(f_bold, 42)
    # Give it a bit more tracking/spacing visually
    c.drawCentredString(width / 2, height - 180, "CERTIFICATE")
    c.setFont(f_reg, 16)
    c.drawCentredString(width / 2, height - 205, "O F   A C H I E V E M E N T")
    
    # === TEXT: "This is to certify that" ===
    c.setFillColor(text_gray)
    c.setFont(f_reg, 14)
    c.drawCentredString(width / 2, height - 260, "This is proudly presented to")
    
    # === STUDENT NAME ===
    student_name = f"{student.first_name} {student.last_name}"
    c.setFillColor(border_blue)
    c.setFont(f_bold, 36)
    c.drawCentredString(width / 2, height - 315, student_name)
    
    # Gold underline for name
    c.setStrokeColor(accent_gold)
    c.setLineWidth(2)
    name_w = c.stringWidth(student_name, f_bold, 36)
    c.line(width/2 - name_w/2 - 20, height - 330, width/2 + name_w/2 + 20, height - 330)
    
    # === "For successful completion of" ===
    c.setFillColor(text_gray)
    c.setFont(f_reg, 14)
    c.drawCentredString(width / 2, height - 365, "for successfully completing the course")
    
    # === COURSE TITLE ===
    c.setFillColor(border_blue)
    c.setFont(f_bold, 22)
    # Ensure it fits
    c_title = course.title
    if len(c_title) > 50:
         c.setFont(f_bold, 16)
    c.drawCentredString(width / 2, height - 400, c_title)
    
    # === FOOTER DETAILS ===
    footer_y = 110
    c.setFillColor(text_dark)
    
    # Date
    c.setFont(f_bold, 12)
    completion_date = enrollment.enrolled_at.strftime("%B %d, %Y") if enrollment.enrolled_at else datetime.now().strftime("%B %d, %Y")
    c.drawCentredString(width / 4, footer_y, completion_date)
    c.setStrokeColor(border_blue)
    c.setLineWidth(0.5)
    c.line(width / 4 - 60, footer_y - 10, width / 4 + 60, footer_y - 10)
    c.setFont(f_reg, 10)
    c.setFillColor(text_gray)
    c.drawCentredString(width / 4, footer_y - 25, "Date of Completion")
    
    # Certificate ID (Center)
    cert_id = f"ID: CERT-{course.id:04d}-{student.id:04d}"
    c.setFillColor(text_gray)
    c.setFont(f_reg, 9)
    c.drawCentredString(width / 2, 70, cert_id)
    
    # Signature
    c.setFillColor(text_dark)
    c.setFont(f_bold, 12)
    c.drawCentredString(3 * width / 4, footer_y, "Mentoria Director")
    # Draw a stylized signature line
    c.setStrokeColor(border_blue)
    c.line(3 * width / 4 - 60, footer_y - 10, 3 * width / 4 + 60, footer_y - 10)
    c.setFont(f_reg, 10)
    c.setFillColor(text_gray)
    c.drawCentredString(3 * width / 4, footer_y - 25, "Authorized Signature")
    
    c.save()
    buffer.seek(0)
    return buffer

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

class OpportunityBase(BaseModel):
    title: str
    category: str
    direction: str
    format: str
    deadline: date
    description: str
    requirements: str
    apply_url: Optional[str] = None
    grade_level: str
    tags: Optional[str] = None

class OpportunityCreate(OpportunityBase):
    pass

class Opportunity(OpportunityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: str
    difficulty_level: str
    tags: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class LessonBase(BaseModel):
    title: str
    content: str
    video_url: Optional[str] = None
    order: int

class Lesson(LessonBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True

class Course(CourseBase):
    id: int
    created_at: datetime
    lessons: List[Lesson] = []

    class Config:
        from_attributes = True

class StudentProfileBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    grade: int
    interests: Optional[str] = None
    subjects: Optional[str] = None
    goals: Optional[str] = None
    bio: Optional[str] = None
    # Academic Stats
    gpa: Optional[float] = None
    ielts_score: Optional[float] = None
    toefl_score: Optional[int] = None
    sat_score: Optional[int] = None
    # Activities & Achievements
    activities: Optional[str] = None
    certificates: Optional[str] = None
    # Documents
    cv_text: Optional[str] = None
    motivation_letter: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    password: str  # Пароль в открытом виде (будет захеширован на бэке)

class StudentProfileUpdate(BaseModel):
    """Schema for updating student profile (without password) - all fields optional"""
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    grade: Optional[int] = None
    interests: Optional[str] = None
    subjects: Optional[str] = None
    goals: Optional[str] = None
    bio: Optional[str] = None
    gpa: Optional[float] = None
    ielts_score: Optional[float] = None
    toefl_score: Optional[int] = None
    sat_score: Optional[int] = None
    activities: Optional[str] = None
    certificates: Optional[str] = None
    cv_text: Optional[str] = None
    motivation_letter: Optional[str] = None

class StudentProfile(StudentProfileBase):
    id: int
    avatar_emoji: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SavedOpportunityResponse(BaseModel):
    id: int
    opportunity: Opportunity
    saved_at: datetime

    class Config:
        from_attributes = True

class EnrollmentResponse(BaseModel):
    id: int
    course: Course
    progress: float
    completed: bool
    enrolled_at: datetime

    class Config:
        from_attributes = True

class TelegramPostBase(BaseModel):
    telegram_message_id: int
    title: Optional[str] = None
    content: str
    category: str = "general"
    summary: Optional[str] = None
    post_info: Optional[str] = None
    image_url: Optional[str] = None

class TelegramPostCreate(TelegramPostBase):
    posted_at: Optional[datetime] = None

class TelegramPost(TelegramPostBase):
    id: int
    posted_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

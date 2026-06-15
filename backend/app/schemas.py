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

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfile(StudentProfileBase):
    id: int
    created_at: datetime

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

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Table, Float, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

user_opportunity = Table(
    "user_opportunity",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("student_profile.id")),
    Column("opportunity_id", Integer, ForeignKey("opportunity.id")),
)

class StudentProfile(Base):
    __tablename__ = "student_profile"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    password_hash = Column(String)  # Хеширован bcrypt
    grade = Column(Integer)  # 8-11
    interests = Column(String)  # JSON или CSV, например "STEM,Business"
    subjects = Column(String)
    goals = Column(String)
    bio = Column(Text, nullable=True)  # О себе: амбиции, цели, интересы
    avatar_emoji = Column(String, default="👤")  # Аватар как эмодзи

    # Academic Stats
    gpa = Column(Float, nullable=True)  # GPA (0-4.0 или 0-5.0)
    ielts_score = Column(Float, nullable=True)  # IELTS (0-9)
    toefl_score = Column(Integer, nullable=True)  # TOEFL (0-120)
    sat_score = Column(Integer, nullable=True)  # SAT (0-1600)

    # Activities & Achievements
    activities = Column(Text, nullable=True)  # Спорт, клубы, волонтёрство (JSON)
    certificates = Column(Text, nullable=True)  # Сертификаты, награды (JSON)
    skills = Column(Text, nullable=True)  # Навыки (CSV: Python,Leadership,etc)

    # Documents
    cv_text = Column(Text, nullable=True)  # CV в текстовом формате
    cv_video_url = Column(String, nullable=True)  # Видео CV
    motivation_letter = Column(Text, nullable=True)  # Мотивационное письмо
    transcript_url = Column(String, nullable=True)  # Транскрипт

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="student")
    lesson_progress = relationship("LessonProgress", back_populates="student")
    saved_opportunities = relationship("SavedOpportunity", back_populates="student")
    notification_preference = relationship("NotificationPreference", back_populates="student", uselist=False)
    notification_logs = relationship("NotificationLog", back_populates="student")
    opportunity_journeys = relationship("OpportunityJourney", back_populates="student")
    comments = relationship("Comment", back_populates="student", cascade="all, delete-orphan")

class Opportunity(Base):
    __tablename__ = "opportunity"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String)  # e.g., "олимпиада", "стажировка", "конкурс"
    direction = Column(String)  # e.g., "Business", "STEM", "Finance", "Science"
    format = Column(String)  # e.g., "online", "offline", "hybrid"
    deadline = Column(Date)
    description = Column(Text)
    requirements = Column(Text)
    apply_url = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    grade_level = Column(String)
    tags = Column(String)  # JSON или CSV
    created_at = Column(DateTime, default=datetime.utcnow)

    saved_by = relationship("SavedOpportunity", back_populates="opportunity", cascade="all, delete-orphan")
    journeys = relationship("OpportunityJourney", back_populates="opportunity", cascade="all, delete-orphan")

class SavedOpportunity(Base):
    __tablename__ = "saved_opportunity"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profile.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunity.id"))
    saved_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="saved_opportunities")
    opportunity = relationship("Opportunity", back_populates="saved_by")

class Course(Base):
    __tablename__ = "course"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    difficulty_level = Column(String)  # e.g., "beginner", "intermediate", "advanced"
    tags = Column(String)  # JSON или CSV
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lesson"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"))
    title = Column(String)
    content = Column(Text)
    video_url = Column(String, nullable=True)
    order = Column(Integer)  # порядок урока в курсе
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="lessons")
    progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="lesson", cascade="all, delete-orphan")

class Quiz(Base):
    __tablename__ = "quiz"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lesson.id"))
    title = Column(String)
    questions = Column(Text)  # JSON с вопросами и ответами
    created_at = Column(DateTime, default=datetime.utcnow)

    lesson = relationship("Lesson", back_populates="quiz")

class Enrollment(Base):
    __tablename__ = "enrollment"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profile.id"))
    course_id = Column(Integer, ForeignKey("course.id"))
    progress = Column(Float, default=0.0)  # 0-100%
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)

    student = relationship("StudentProfile", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profile.id"))
    lesson_id = Column(Integer, ForeignKey("lesson.id"))
    completed = Column(Boolean, default=False)
    quiz_passed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    student = relationship("StudentProfile", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress")

class NotificationPreference(Base):
    __tablename__ = "notification_preference"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profile.id"), unique=True)
    email_enabled = Column(Boolean, default=False)
    telegram_enabled = Column(Boolean, default=False)
    telegram_chat_id = Column(String, nullable=True)
    deadline_alerts = Column(Boolean, default=True)
    weekly_digest = Column(Boolean, default=True)
    course_reminders = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="notification_preference")

class NotificationLog(Base):
    __tablename__ = "notification_log"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profile.id"))
    channel = Column(String)
    type = Column(String)
    title = Column(String)
    message = Column(Text)
    status = Column(String)
    error_message = Column(String, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="notification_logs")

class TelegramPost(Base):
    __tablename__ = "telegram_posts"

    id = Column(Integer, primary_key=True, index=True)
    telegram_message_id = Column(Integer, unique=True, index=True)
    title = Column(String, nullable=True)
    content = Column(Text)
    summary = Column(Text, nullable=True)  # AI-generated summary
    post_info = Column(Text, nullable=True)  # JSON with structured data (audience, deadline, format, etc)
    category = Column(String, default="general", index=True)  # hiring, programs, opportunities, news, tips, general
    image_url = Column(String, nullable=True)
    posted_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class OpportunityJourney(Base):
    __tablename__ = "opportunity_journey"
    __table_args__ = (UniqueConstraint("student_id", "opportunity_id", name="uq_journey_student_opp"),)

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profile.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunity.id"))
    stage = Column(String, default="discovered")
    readiness_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="opportunity_journeys")
    opportunity = relationship("Opportunity", back_populates="journeys")

class Comment(Base):
    __tablename__ = "comment"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lesson.id"))
    student_id = Column(Integer, ForeignKey("student_profile.id"))
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    lesson = relationship("Lesson", back_populates="comments")
    student = relationship("StudentProfile", back_populates="comments")

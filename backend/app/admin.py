from sqladmin import ModelView
from .models import (
    StudentProfile, Opportunity, SavedOpportunity, Course, Lesson, Quiz,
    Enrollment, LessonProgress, NotificationPreference, NotificationLog,
)

class StudentProfileAdmin(ModelView, model=StudentProfile):
    name = "Student"
    name_plural = "Students"
    column_list = [StudentProfile.id, StudentProfile.email, StudentProfile.first_name, StudentProfile.grade, StudentProfile.created_at]

class OpportunityAdmin(ModelView, model=Opportunity):
    name = "Opportunity"
    name_plural = "Opportunities"
    column_list = [Opportunity.id, Opportunity.title, Opportunity.category, Opportunity.direction, Opportunity.deadline]

class SavedOpportunityAdmin(ModelView, model=SavedOpportunity):
    name = "Saved Opportunity"
    name_plural = "Saved Opportunities"

class CourseAdmin(ModelView, model=Course):
    name = "Course"
    name_plural = "Courses"
    column_list = [Course.id, Course.title, Course.difficulty_level, Course.created_at]

class LessonAdmin(ModelView, model=Lesson):
    name = "Lesson"
    name_plural = "Lessons"
    column_list = [Lesson.id, Lesson.title, Lesson.course_id, Lesson.order]

class QuizAdmin(ModelView, model=Quiz):
    name = "Quiz"
    name_plural = "Quizzes"

class EnrollmentAdmin(ModelView, model=Enrollment):
    name = "Enrollment"
    name_plural = "Enrollments"
    column_list = [Enrollment.id, Enrollment.student_id, Enrollment.course_id, Enrollment.progress, Enrollment.enrolled_at]

class LessonProgressAdmin(ModelView, model=LessonProgress):
    name = "Lesson Progress"
    name_plural = "Lesson Progresses"
    column_list = [LessonProgress.id, LessonProgress.student_id, LessonProgress.lesson_id, LessonProgress.completed]

class NotificationPreferenceAdmin(ModelView, model=NotificationPreference):
    name = "Notification Preference"
    name_plural = "Notification Preferences"
    column_list = [
        NotificationPreference.id,
        NotificationPreference.student_id,
        NotificationPreference.email_enabled,
        NotificationPreference.telegram_enabled,
        NotificationPreference.telegram_chat_id,
    ]

class NotificationLogAdmin(ModelView, model=NotificationLog):
    name = "Notification Log"
    name_plural = "Notification Logs"
    column_list = [
        NotificationLog.id,
        NotificationLog.student_id,
        NotificationLog.channel,
        NotificationLog.type,
        NotificationLog.status,
        NotificationLog.sent_at,
    ]

def register_admin(admin):
    admin.add_view(StudentProfileAdmin)
    admin.add_view(OpportunityAdmin)
    admin.add_view(SavedOpportunityAdmin)
    admin.add_view(CourseAdmin)
    admin.add_view(LessonAdmin)
    admin.add_view(QuizAdmin)
    admin.add_view(EnrollmentAdmin)
    admin.add_view(LessonProgressAdmin)
    admin.add_view(NotificationPreferenceAdmin)
    admin.add_view(NotificationLogAdmin)

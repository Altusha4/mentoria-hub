from datetime import date, timedelta, datetime
from .database import SessionLocal
from .models import StudentProfile, Opportunity, Course, Lesson, Quiz, TelegramPost
from .auth import hash_password
import random

def seed_data():
    db = SessionLocal()

    # Helper to get random avatar
    AVATAR_EMOJIS = ['👤', '😊', '🎓', '🚀', '⭐', '💼', '🎯', '🌟', '💡', '🏆', '🎨', '🧠']

    # Create sample students
    students = [
        StudentProfile(
            email="student1@example.com",
            first_name="Айдар",
            last_name="Оспанов",
            grade=10,
            interests="STEM,Programming",
            subjects="Mathematics,Physics",
            goals="University entrance",
            password_hash=hash_password("password123"),
            avatar_emoji=random.choice(AVATAR_EMOJIS),
        ),
        StudentProfile(
            email="student2@example.com",
            first_name="Айнур",
            last_name="Ахметова",
            grade=9,
            interests="Business,Finance",
            subjects="Economics,English",
            goals="Business competition",
            password_hash=hash_password("password123"),
            avatar_emoji=random.choice(AVATAR_EMOJIS),
        ),
    ]
    for student in students:
        db.add(student)
    db.commit()

    # Create sample opportunities
    opportunities = [
        Opportunity(
            title="International Science Olympiad",
            category="олимпиада",
            direction="STEM",
            format="online",
            deadline=date.today() + timedelta(days=60),
            description="International Science Olympiad for high school students across multiple disciplines.",
            requirements="Strong background in Physics and Mathematics, English language proficiency",
            grade_level="10-11",
            tags="STEM,Science,Olympiad,Online",
        ),
        Opportunity(
            title="Summer Business Camp",
            category="стажировка",
            direction="Business",
            format="offline",
            deadline=date.today() + timedelta(days=45),
            description="Hands-on business experience with real case studies and mentorship.",
            requirements="Interest in business, basic English",
            grade_level="9-11",
            tags="Business,Leadership,Summer",
        ),
        Opportunity(
            title="AI & Machine Learning Hackathon",
            category="хакатон",
            direction="Programming",
            format="hybrid",
            deadline=date.today() + timedelta(days=30),
            description="Build innovative AI solutions with industry experts.",
            requirements="Python programming knowledge, teamwork skills",
            grade_level="10-11",
            tags="Programming,AI,Hackathon,Technology",
        ),
        Opportunity(
            title="Financial Literacy Scholarship",
            category="стипендия",
            direction="Finance",
            format="online",
            deadline=date.today() + timedelta(days=90),
            description="Full scholarship for finance education program.",
            requirements="Keen interest in finance, mathematics proficiency",
            grade_level="8-11",
            tags="Finance,Scholarship,Learning",
        ),
        Opportunity(
            title="Social Innovation Challenge",
            category="конкурс",
            direction="Social Impact",
            format="online",
            deadline=date.today() + timedelta(days=50),
            description="Solve real-world social problems with innovative solutions.",
            requirements="Creativity, team collaboration",
            grade_level="8-11",
            tags="Social,Innovation,Competition",
        ),
        Opportunity(
            title="STEM Research Program",
            category="программа",
            direction="STEM",
            format="offline",
            deadline=date.today() + timedelta(days=75),
            description="Research opportunities in science with university mentors.",
            requirements="Strong interest in research, science background",
            grade_level="10-11",
            tags="STEM,Research,Education",
        ),
        Opportunity(
            title="Global Leadership Summit",
            category="конференция",
            direction="Business",
            format="hybrid",
            deadline=date.today() + timedelta(days=120),
            description="Network with future leaders from around the world.",
            requirements="Leadership potential, English language",
            grade_level="9-11",
            tags="Leadership,Networking,Global",
        ),
        Opportunity(
            title="Coding Excellence Program",
            category="курс",
            direction="Programming",
            format="online",
            deadline=date.today() + timedelta(days=55),
            description="Advanced programming course with certification.",
            requirements="Basic programming knowledge",
            grade_level="8-11",
            tags="Programming,Coding,Online",
        ),
        Opportunity(
            title="Environmental Science Competition",
            category="конкурс",
            direction="STEM",
            format="offline",
            deadline=date.today() + timedelta(days=40),
            description="Compete in environmental science research competitions.",
            requirements="Science knowledge, research skills",
            grade_level="9-11",
            tags="STEM,Environment,Science",
        ),
        Opportunity(
            title="Entrepreneurship Incubator",
            category="программа",
            direction="Business",
            format="hybrid",
            deadline=date.today() + timedelta(days=65),
            description="Turn your business ideas into reality with expert mentorship.",
            requirements="Entrepreneurial mindset",
            grade_level="9-11",
            tags="Business,Entrepreneurship,Mentoring",
        ),
    ]
    for opportunity in opportunities:
        db.add(opportunity)
    db.commit()

    # Create sample courses
    courses = [
        Course(
            title="English for Academic Success",
            description="Master academic English writing, presentation, and communication skills.",
            difficulty_level="intermediate",
            tags="English,Academic,Language",
        ),
        Course(
            title="Python Programming Fundamentals",
            description="Learn Python from basics to advanced OOP concepts.",
            difficulty_level="beginner",
            tags="Programming,Python,Coding",
        ),
        Course(
            title="Business Strategy & Leadership",
            description="Develop leadership and strategic thinking skills for business.",
            difficulty_level="intermediate",
            tags="Business,Leadership,Strategy",
        ),
    ]
    for course in courses:
        db.add(course)
    db.commit()

    # Create lessons for courses
    lessons_data = [
        {
            "course_title": "English for Academic Success",
            "lessons": [
                ("Essay Writing Basics", "Learn the fundamentals of academic essay writing.", "https://www.youtube.com/watch?v=essay1", 1),
                ("Advanced Vocabulary", "Expand your academic vocabulary with common phrases.", "https://www.youtube.com/watch?v=vocab1", 2),
                ("Public Speaking for Presentations", "Master presentation skills and overcome stage fright.", "https://www.youtube.com/watch?v=speaking1", 3),
            ],
        },
        {
            "course_title": "Python Programming Fundamentals",
            "lessons": [
                ("Introduction to Python", "Get started with Python syntax and environment setup.", "https://www.youtube.com/watch?v=python1", 1),
                ("Variables & Data Types", "Understand variables, data types, and operations.", "https://www.youtube.com/watch?v=python2", 2),
                ("Control Flow & Functions", "Master loops, conditionals, and functions.", "https://www.youtube.com/watch?v=python3", 3),
            ],
        },
        {
            "course_title": "Business Strategy & Leadership",
            "lessons": [
                ("Leadership Fundamentals", "Core concepts of effective leadership.", "https://www.youtube.com/watch?v=leadership1", 1),
                ("Strategic Planning", "Learn how to develop and execute business strategies.", "https://www.youtube.com/watch?v=strategy1", 2),
            ],
        },
    ]

    for course_data in lessons_data:
        course = db.query(Course).filter(Course.title == course_data["course_title"]).first()
        if course:
            for lesson_title, content, video_url, order in course_data["lessons"]:
                lesson = Lesson(
                    course_id=course.id,
                    title=lesson_title,
                    content=content,
                    video_url=video_url,
                    order=order,
                )
                db.add(lesson)
    db.commit()

    # Create sample Telegram posts
    telegram_posts = [
        TelegramPost(
            telegram_message_id=1,
            title="🎯 International Science Olympiad 2024",
            content="Join the biggest science competition! Participate in Physics, Chemistry, Biology, and more. Early bird registration is open now!",
            category="opportunities",
            posted_at=datetime.now(),
        ),
        TelegramPost(
            telegram_message_id=2,
            title="💼 Summer Internship Program - Google",
            content="Google is hiring summer interns! Applications are open for software engineering, product management, and business roles. Apply before June 30th!",
            category="hiring",
            posted_at=datetime.now(),
        ),
        TelegramPost(
            telegram_message_id=3,
            title="📚 Free Python Course - Week 1 Complete",
            content="Congratulations to all who completed week 1! This week we'll dive into advanced OOP concepts. Check out our GitHub repo for resources.",
            category="programs",
            posted_at=datetime.now(),
        ),
        TelegramPost(
            telegram_message_id=4,
            title="💡 5 Tips for Successful University Applications",
            content="1. Start early\n2. Tell your story\n3. Show initiative\n4. Get good recommendations\n5. Perfect your essays\n\nRead the full guide in our blog!",
            category="tips",
            posted_at=datetime.now(),
        ),
        TelegramPost(
            telegram_message_id=5,
            title="🏆 Student Success Story - Aida's Journey",
            content="Meet Aida! She went from a small town to Harvard through hard work and mentorship. Read her inspiring story and learn what worked for her.",
            category="news",
            posted_at=datetime.now(),
        ),
        TelegramPost(
            telegram_message_id=6,
            title="🤖 AI & Machine Learning Hackathon 2024",
            content="48-hour hackathon starting June 25th! Build innovative AI solutions with $50k in prizes. Teams of 2-4. Register now!",
            category="opportunities",
            posted_at=datetime.now(),
        ),
        TelegramPost(
            telegram_message_id=7,
            title="📖 New Scholarship: Full Ride to Stanford",
            content="New scholarship program available for high-achieving students from Central Asia. GPA 3.8+ required. Application deadline: July 15th.",
            category="programs",
            posted_at=datetime.now(),
        ),
        TelegramPost(
            telegram_message_id=8,
            title="✨ Mentorship Program Launched",
            content="Connect with industry experts and top students! Get personalized guidance for your university applications and career path.",
            category="news",
            posted_at=datetime.now(),
        ),
    ]
    for post in telegram_posts:
        db.add(post)
    db.commit()

    print("✅ Mock data seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()

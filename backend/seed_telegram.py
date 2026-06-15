#!/usr/bin/env python3
from datetime import datetime, timedelta
from app.database import SessionLocal, Base, engine
from app.models import TelegramPost

# Создаём все таблицы
Base.metadata.create_all(bind=engine)
print("✅ Tables created")

# Расширенные тестовые посты (30+)
TEST_POSTS = [
    # Hiring (8)
    {"telegram_message_id": 1001, "title": "Join our hiring drive 2024", "content": "We are hiring talented developers and designers!", "category": "hiring"},
    {"telegram_message_id": 1006, "title": "Developer wanted for startup", "content": "Fast-growing startup recruiting senior full-stack developers.", "category": "hiring"},
    {"telegram_message_id": 1010, "title": "Marketing Manager - Remote", "content": "Looking for experienced marketing manager with 5+ years experience.", "category": "hiring"},
    {"telegram_message_id": 1015, "title": "Data Scientist position", "content": "Help us build ML models for our platform. Competitive salary.", "category": "hiring"},
    {"telegram_message_id": 1020, "title": "Product Designer wanted", "content": "Join our design team and create amazing user experiences.", "category": "hiring"},
    {"telegram_message_id": 1025, "title": "Backend Engineer - Startup", "content": "Scale our infrastructure. Equity + salary included.", "category": "hiring"},
    {"telegram_message_id": 1030, "title": "Mobile Developer (React Native)", "content": "Build apps used by millions. Remote-first company.", "category": "hiring"},
    {"telegram_message_id": 1035, "title": "Sales Manager opening", "content": "Lead our sales team. Great commission structure.", "category": "hiring"},

    # Programs (8)
    {"telegram_message_id": 1002, "title": "New AI course launched", "content": "Comprehensive course on AI and Machine Learning.", "category": "programs"},
    {"telegram_message_id": 1007, "title": "Web Development Bootcamp", "content": "12-week intensive training on modern web technologies.", "category": "programs"},
    {"telegram_message_id": 1040, "title": "Python for Data Science", "content": "Learn Python, Pandas, NumPy, and Scikit-learn in 6 weeks.", "category": "programs"},
    {"telegram_message_id": 1045, "title": "Cloud Architecture Masterclass", "content": "AWS/GCP/Azure - understand cloud at scale.", "category": "programs"},
    {"telegram_message_id": 1050, "title": "Cybersecurity bootcamp", "content": "12-week hands-on cybersecurity training program.", "category": "programs"},
    {"telegram_message_id": 1055, "title": "Business Analytics Program", "content": "Learn SQL, Tableau, and business intelligence tools.", "category": "programs"},
    {"telegram_message_id": 1060, "title": "UX/UI Design Course", "content": "Master Figma, design systems, and user research.", "category": "programs"},
    {"telegram_message_id": 1065, "title": "Blockchain Development", "content": "Learn Solidity, Web3, and build DApps.", "category": "programs"},

    # Opportunities (8)
    {"telegram_message_id": 1003, "title": "Hackathon 2024 - Register now", "content": "The biggest hackathon of the year! Amazing prizes.", "category": "opportunities"},
    {"telegram_message_id": 1008, "title": "Digital Marketing Challenge", "content": "Showcase your marketing skills and win prizes.", "category": "opportunities"},
    {"telegram_message_id": 1070, "title": "Summer internship program", "content": "12-week internship at leading tech companies.", "category": "opportunities"},
    {"telegram_message_id": 1075, "title": "Innovation competition 2024", "content": "Pitch your startup idea. $10k prize pool.", "category": "opportunities"},
    {"telegram_message_id": 1080, "title": "Scholarship for undergraduates", "content": "Full scholarship for top 10 performers.", "category": "opportunities"},
    {"telegram_message_id": 1085, "title": "Tech fellowship program", "content": "12-month fellowship with stipend and mentorship.", "category": "opportunities"},
    {"telegram_message_id": 1090, "title": "Study abroad program", "content": "Exchange program with universities worldwide.", "category": "opportunities"},
    {"telegram_message_id": 1095, "title": "Research assistant position", "content": "Work on cutting-edge AI research projects.", "category": "opportunities"},

    # News (4)
    {"telegram_message_id": 1004, "title": "Exciting news from our community", "content": "We're launching our new mentorship program!", "category": "news"},
    {"telegram_message_id": 1100, "title": "Mentoria platform reaches 10k users", "content": "We hit 10,000 active students on our platform!", "category": "news"},
    {"telegram_message_id": 1105, "title": "Partnership with top universities", "content": "We partnered with 5 leading universities.", "category": "news"},
    {"telegram_message_id": 1110, "title": "Annual report 2024", "content": "Check out our impact report for 2024.", "category": "news"},

    # Tips (2)
    {"telegram_message_id": 1005, "title": "5 tips for acing interviews", "content": "How to prepare for your next job interview.", "category": "tips"},
    {"telegram_message_id": 1115, "title": "Resume writing guide", "content": "10 tips to make your resume stand out.", "category": "tips"},
]

db = SessionLocal()
count = 0

for i, post_data in enumerate(TEST_POSTS):
    existing = db.query(TelegramPost).filter(
        TelegramPost.telegram_message_id == post_data["telegram_message_id"]
    ).first()

    if existing:
        print(f"⏭️  Post #{post_data['telegram_message_id']} already exists")
        continue

    post = TelegramPost(
        telegram_message_id=post_data["telegram_message_id"],
        title=post_data["title"],
        content=post_data["content"],
        category=post_data["category"],
        posted_at=datetime.now() - timedelta(days=i)
    )

    db.add(post)
    count += 1
    print(f"✅ {post_data['title']}")

db.commit()
db.close()

print(f"\n✨ Created {count} telegram posts!")

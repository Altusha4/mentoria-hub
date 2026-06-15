#!/usr/bin/env python3
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

sys.path.insert(0, '/Users/altynayyertay/IdeaProjects/mentoria-hub/backend')
from app.database import SessionLocal
from app.models import TelegramPost

# Test posts с разными категориями
TEST_POSTS = [
    {
        "telegram_message_id": 1001,
        "title": "Join our hiring drive 2024",
        "content": "We are hiring talented developers and designers! Join us and grow your career. Looking for fresh talent to join our team.",
        "category": "hiring",
        "image_url": None,
    },
    {
        "telegram_message_id": 1002,
        "title": "New AI course launched",
        "content": "Introducing our comprehensive course on Artificial Intelligence and Machine Learning. Learn cutting-edge techniques with industry experts.",
        "category": "programs",
        "image_url": None,
    },
    {
        "telegram_message_id": 1003,
        "title": "Hackathon 2024 - Register now",
        "content": "The biggest hackathon of the year is here! Compete for amazing prizes and network with fellow innovators. Registration deadline: June 30.",
        "category": "opportunities",
        "image_url": None,
    },
    {
        "telegram_message_id": 1004,
        "title": "Exciting news from our community",
        "content": "We're thrilled to announce the launch of our new mentorship program! This initiative will connect experienced professionals with aspiring students.",
        "category": "news",
        "image_url": None,
    },
    {
        "telegram_message_id": 1005,
        "title": "5 tips for acing interviews",
        "content": "How to prepare for your next job interview: research the company, practice answers, dress professionally, arrive early, and follow up after.",
        "category": "tips",
        "image_url": None,
    },
    {
        "telegram_message_id": 1006,
        "title": "Developer wanted for startup",
        "content": "Fast-growing startup recruiting senior full-stack developers. Competitive salary, equity, and flexible work arrangement. Apply now!",
        "category": "hiring",
        "image_url": None,
    },
    {
        "telegram_message_id": 1007,
        "title": "Web Development Bootcamp",
        "content": "12-week intensive training program covering modern web technologies: React, Node.js, databases, and deployment. Limited seats available!",
        "category": "programs",
        "image_url": None,
    },
    {
        "telegram_message_id": 1008,
        "title": "Digital Marketing Challenge",
        "content": "Participate in our online competition and showcase your marketing skills. Win prizes, build portfolio, and network with industry leaders.",
        "category": "opportunities",
        "image_url": None,
    },
]

def create_test_posts():
    db = SessionLocal()
    count = 0

    try:
        for post_data in TEST_POSTS:
            # Check if post already exists
            existing = db.query(TelegramPost).filter(
                TelegramPost.telegram_message_id == post_data["telegram_message_id"]
            ).first()

            if existing:
                print(f"⏭️  Post #{post_data['telegram_message_id']} already exists, skipping...")
                continue

            # Set posted_at to recent dates
            posted_at = datetime.now() - timedelta(days=count)

            post = TelegramPost(
                telegram_message_id=post_data["telegram_message_id"],
                title=post_data["title"],
                content=post_data["content"],
                category=post_data["category"],
                image_url=post_data["image_url"],
                posted_at=posted_at
            )

            db.add(post)
            count += 1
            print(f"✅ Created post: {post_data['title']} [{post_data['category']}]")

        db.commit()
        print(f"\n✨ Success! Created {count} test posts")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_posts()

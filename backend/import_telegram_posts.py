import asyncio
import sys
import re
import os
from datetime import datetime
from telethon import TelegramClient
from sqlalchemy.orm import Session
from openai import OpenAI

# Твои API значения
API_ID = 33509580
API_HASH = "1ccfe0bac443811a1755c15f6a1a3b24"
CHANNEL_USERNAME = "mentoria_updates"  # Твой канал
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Импортируем из backend
sys.path.insert(0, '/Users/altynayyertay/IdeaProjects/mentoria-hub/backend')
from app.database import SessionLocal
from app.models import TelegramPost

# Инициализируем OpenAI клиент
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Ключевые слова для определения категорий (англ + русс)
CATEGORY_KEYWORDS = {
    "hiring": [
        # English
        "hiring", "join us", "looking for", "recruiting", "vacancy", "job opening",
        "we're hiring", "we are hiring", "career", "apply now", "apply here",
        # Russian
        "набор", "ищем", "вакансия", "ищем сотрудников", "приглашаем", "присоединяйтесь",
        "работа", "открыта вакансия", "квалифицированный", "нужны люди"
    ],
    "programs": [
        # English
        "program", "course", "curriculum", "training", "workshop", "bootcamp",
        "academy", "school", "learn", "education", "study", "class", "module",
        # Russian
        "программа", "курс", "обучение", "школа", "учеба", "уроки", "занятие",
        "мастер-класс", "тренинг", "образование", "изучение", "модуль"
    ],
    "opportunities": [
        # English
        "opportunity", "olympiad", "competition", "contest", "hackathon", "challenge",
        "grant", "scholarship", "fellowship", "internship", "program", "event",
        # Russian
        "возможность", "олимпиада", "конкурс", "чемпионат", "хакатон", "вызов",
        "стипендия", "стажировка", "мероприятие", "программа", "грант"
    ],
    "news": [
        # English
        "announce", "announcement", "news", "update", "new", "excited", "proud",
        "launch", "release", "coming", "started", "begins", "started",
        # Russian
        "объявление", "новость", "анонс", "обновление", "новое", "запустили",
        "начали", "рады", "гордимся", "поздравляем", "новинка"
    ],
    "tips": [
        # English
        "tip", "advice", "guide", "how to", "tutorial", "hack", "trick",
        "best practice", "recommend", "suggestion", "trick", "life hack",
        # Russian
        "совет", "рекомендация", "гайд", "как", "подсказка", "трюк",
        "лайфхак", "лучше практика", "рекомендуем", "советуем"
    ]
}

def clean_text(text):
    """Очистить текст от ссылок, лишних пробелов и эмодзи"""
    # Удалить URL
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    # Удалить @упоминания
    text = re.sub(r'@\w+', '', text)
    # Удалить #хештеги
    text = re.sub(r'#\w+', '', text)
    # Очистить лишние пробелы
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def detect_category(text):
    """Автоматически определить категорию по ключевым словам"""
    text_lower = text.lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category

    return "general"

def generate_summary(title: str, content: str) -> str:
    """Generate AI summary for a post"""
    if not openai_client:
        return ""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes Telegram posts in Russian. Keep summaries concise (2-3 sentences) and focus on key details like dates, requirements, and actions."
                },
                {
                    "role": "user",
                    "content": f"Summarize this post:\n\nTitle: {title}\n\nContent: {content}"
                }
            ],
            max_tokens=150,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating summary: {e}")
        return ""

def generate_metadata(title: str, content: str) -> str:
    """Extract structured metadata from post (JSON format)"""
    if not openai_client:
        return ""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert at extracting structured information from Russian text.
Extract the following information and return ONLY valid JSON (no markdown, no extra text):
{
  "audience": "target audience (e.g., 'школьники 9-11 класс')",
  "deadline": "application deadline date if mentioned",
  "organizer": "who is organizing/hosting",
  "format": "format: online/offline/hybrid, location if mentioned",
  "requirements": "key requirements (concise)",
  "benefits": "what participants get (experience, certificate, etc)"
}

If any field is not mentioned, use null. Return ONLY the JSON object."""
                },
                {
                    "role": "user",
                    "content": f"Title: {title}\n\nContent: {content}"
                }
            ],
            max_tokens=200,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating metadata: {e}")
        return ""

async def import_posts():
    print(f"🔐 Подключаюсь к Telegram...")

    async with TelegramClient('session', API_ID, API_HASH) as client:
        print(f"✅ Подключился! Загружаю посты из @{CHANNEL_USERNAME}...")

        db = SessionLocal()
        count = 0

        try:
            async for message in client.iter_messages(CHANNEL_USERNAME, limit=None):
                # Пропускаем пустые сообщения
                if not message.text:
                    continue

                # Проверяем что поста еще нет в БД
                existing = db.query(TelegramPost).filter(
                    TelegramPost.telegram_message_id == message.id
                ).first()

                if existing:
                    continue

                # Очищаем и обрезаем контент
                content = clean_text(message.text)

                # Парсим заголовок из первой строки
                lines = content.split('\n', 1)
                title = lines[0][:100]

                # Определяем категорию
                category = detect_category(message.text)

                # Извлекаем фото если есть
                image_url = None
                if message.photo:
                    image_url = f"https://t.me/{CHANNEL_USERNAME}/{message.id}"

                # Генерируем summary и post_info
                summary = generate_summary(title, content)
                post_info = generate_metadata(title, content)

                # Создаем пост
                post = TelegramPost(
                    telegram_message_id=message.id,
                    title=title,
                    content=content,
                    category=category,
                    summary=summary,
                    post_info=post_info,
                    image_url=image_url,
                    posted_at=message.date
                )

                db.add(post)
                count += 1

                if count % 10 == 0:
                    print(f"📥 Загружено {count} постов...")

        finally:
            db.commit()
            db.close()

        print(f"✨ Готово! Загружено {count} новых постов!")

if __name__ == "__main__":
    asyncio.run(import_posts())

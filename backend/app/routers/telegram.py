from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import TelegramPost
from ..schemas import TelegramPost as TelegramPostSchema, TelegramPostCreate
from pydantic import BaseModel

router = APIRouter(prefix="/api/telegram", tags=["telegram"])

class TelegramWebhook(BaseModel):
    update_id: int
    message: dict

@router.post("/webhook")
def handle_telegram_webhook(data: dict, db: Session = Depends(get_db)):
    """Получает сообщения из Telegram бота через webhook"""

    # Извлекаем данные из Telegram API
    if "message" not in data:
        return {"ok": True}

    message = data.get("message", {})
    message_id = message.get("message_id")

    # Проверяем что это сообщение из канала
    if "channel_post" in data:
        message = data.get("channel_post", {})
        message_id = message.get("message_id")

    if not message_id:
        return {"ok": True}

    # Проверяем что пост уже не сохранён
    existing = db.query(TelegramPost).filter(
        TelegramPost.telegram_message_id == message_id
    ).first()

    if existing:
        return {"ok": True}

    # Извлекаем текст (может быть text или caption для фото/видео)
    text = message.get("text") or message.get("caption") or ""

    if not text:
        return {"ok": True}

    # Парсим текст: первая строка = title, остальное = content
    lines = text.split("\n", 1)
    title = lines[0][:100]  # Максимум 100 символов
    content = lines[1] if len(lines) > 1 else lines[0]

    # Извлекаем фото если есть
    image_url = None
    if "photo" in message:
        photos = message.get("photo", [])
        if photos:
            # Берём самое большое фото
            largest_photo = max(photos, key=lambda p: p.get("file_size", 0))
            image_url = f"https://api.telegram.org/file/bot{largest_photo.get('file_id')}"

    # Получаем время сообщения
    posted_at = datetime.fromtimestamp(message.get("date", 0))

    # Сохраняем в БД
    db_post = TelegramPost(
        telegram_message_id=message_id,
        title=title,
        content=content,
        image_url=image_url,
        posted_at=posted_at
    )

    db.add(db_post)
    db.commit()

    print(f"✅ [TELEGRAM] Saved post #{message_id}")

    return {"ok": True}

@router.get("/posts", response_model=List[TelegramPostSchema])
def get_telegram_posts(limit: int = 10, category: str = None, db: Session = Depends(get_db)):
    """Получить последние посты из Telegram канала (опционально с фильтром по категориям)"""
    query = db.query(TelegramPost)

    if category and category != "all":
        query = query.filter(TelegramPost.category == category)

    posts = query.order_by(
        TelegramPost.posted_at.desc()
    ).limit(limit).all()

    return posts

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Получить все доступные категории с количеством постов"""
    from sqlalchemy import func

    categories = db.query(
        TelegramPost.category,
        func.count(TelegramPost.id).label("count")
    ).group_by(TelegramPost.category).all()

    return {
        "categories": [
            {"name": cat, "count": count} for cat, count in categories
        ]
    }

@router.patch("/posts/{post_id}/category")
def update_post_category(post_id: int, category: str, db: Session = Depends(get_db)):
    """Обновить категорию поста (для редактирования)"""
    post = db.query(TelegramPost).filter(TelegramPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    valid_categories = ["hiring", "programs", "opportunities", "news", "tips", "general"]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of {valid_categories}")

    post.category = category
    db.commit()
    db.refresh(post)

    return post

@router.get("/posts/{post_id}", response_model=TelegramPostSchema)
def get_telegram_post(post_id: int, db: Session = Depends(get_db)):
    """Получить конкретный пост"""
    post = db.query(TelegramPost).filter(TelegramPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return post

@router.post("/posts", response_model=TelegramPostSchema)
def create_telegram_post(post: TelegramPostCreate, db: Session = Depends(get_db)):
    """Создать пост вручную (для демонстрации)"""

    # Проверяем что пост с таким ID еще не существует
    existing = db.query(TelegramPost).filter(
        TelegramPost.telegram_message_id == post.telegram_message_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Post already exists")

    db_post = TelegramPost(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    print(f"✅ [TELEGRAM] Created post manually: {post.telegram_message_id}")

    return db_post


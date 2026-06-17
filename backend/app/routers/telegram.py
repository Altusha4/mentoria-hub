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
    from .. import telegram_service
    from ..models import NotificationPreference

    print(f"📬 [WEBHOOK] Получено обновление из Telegram")

    # Проверяем что это channel_post
    if "channel_post" not in data:
        return {"ok": True}

    message = data.get("channel_post", {})
    message_id = message.get("message_id")
    chat_id = message.get("chat", {}).get("id")

    print(f"📮 [WEBHOOK] Channel post #{message_id} from chat {chat_id}")

    # Проверяем что это из нашего канала
    if chat_id != -1004422220327:  # @mentoria_updates
        return {"ok": True}

    if not message_id:
        return {"ok": True}

    # Проверяем что пост уже не сохранён
    existing = db.query(TelegramPost).filter(
        TelegramPost.telegram_message_id == message_id
    ).first()

    if existing:
        print(f"⏭️  Post #{message_id} already exists")
        return {"ok": True}

    # Извлекаем текст
    text = message.get("text") or message.get("caption") or ""

    if not text:
        return {"ok": True}

    # Парсим текст: первая строка = title, остальное = content
    lines = text.split("\n", 1)
    title = lines[0][:100]
    content = "\n".join(lines[1:]) if len(lines) > 1 else text

    # Определяем категорию
    def detect_category(text):
        text_lower = text.lower()
        if any(word in text_lower for word in ["hiring", "job", "career", "vacancy"]):
            return "hiring"
        elif any(word in text_lower for word in ["course", "program", "training", "bootcamp"]):
            return "programs"
        elif any(word in text_lower for word in ["hackathon", "competition", "olympiad", "internship"]):
            return "opportunities"
        elif any(word in text_lower for word in ["announce", "news", "launch", "update"]):
            return "news"
        elif any(word in text_lower for word in ["tip", "advice", "guide"]):
            return "tips"
        return "general"

    # Извлекаем фото если есть
    image_url = None
    if "photo" in message:
        photos = message.get("photo", [])
        if photos:
            largest_photo = max(photos, key=lambda p: p.get("file_size", 0))
            image_url = f"https://api.telegram.org/file/bot{largest_photo.get('file_id')}"

    # Получаем время сообщения
    posted_at = datetime.fromtimestamp(message.get("date", 0))

    # Сохраняем в БД
    db_post = TelegramPost(
        telegram_message_id=message_id,
        title=title,
        content=content,
        category=detect_category(text),
        image_url=image_url,
        posted_at=posted_at
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    print(f"✅ [WEBHOOK] Saved post: {title}")

    # Отправляем уведомления студентам
    print(f"📢 [WEBHOOK] Отправляю уведомления студентам...")

    notification_prefs = db.query(NotificationPreference).filter(
        NotificationPreference.telegram_enabled == True,
        NotificationPreference.telegram_chat_id.isnot(None)
    ).all()

    success_count = 0
    for pref in notification_prefs:
        if not pref.telegram_chat_id:
            continue

        message_text = telegram_service.format_new_post_notification(title, content)
        success, error = telegram_service.send_telegram_message(
            chat_id=pref.telegram_chat_id,
            text=message_text
        )

        if success:
            success_count += 1
            print(f"✅ Notification sent to student {pref.student_id}")
        else:
            print(f"❌ Failed to send to {pref.student_id}: {error}")

    print(f"✨ [WEBHOOK] Sent {success_count} notifications")

    return {"ok": True, "saved": True, "notifications_sent": success_count}

@router.post("/sync")
def sync_telegram_posts(db: Session = Depends(get_db)):
    """Синхронизировать посты с реального Telegram канала @mentoria_updates"""
    from .. import telegram_service
    from datetime import datetime

    print("🔄 [TELEGRAM] Синхронизирую посты с каналом...")

    # Получаем последние посты с канала
    posts = telegram_service.get_recent_posts("-1004422220327", limit=10)

    if not posts:
        return {"message": "No new posts found", "count": 0}

    # Определяем категорию по ключевым словам
    def detect_category(text):
        text_lower = text.lower()
        if any(word in text_lower for word in ["hiring", "job", "career", "vacancy", "recruiting"]):
            return "hiring"
        elif any(word in text_lower for word in ["course", "program", "training", "bootcamp", "learn"]):
            return "programs"
        elif any(word in text_lower for word in ["hackathon", "competition", "olympiad", "internship", "opportunity"]):
            return "opportunities"
        elif any(word in text_lower for word in ["announce", "news", "launch", "update"]):
            return "news"
        elif any(word in text_lower for word in ["tip", "advice", "guide", "how to"]):
            return "tips"
        return "general"

    count = 0
    for post_data in posts:
        # Проверяем что поста еще нет в БД
        existing = db.query(TelegramPost).filter(
            TelegramPost.telegram_message_id == post_data["message_id"]
        ).first()

        if existing:
            print(f"⏭️  Post #{post_data['message_id']} already exists")
            continue

        # Парсим заголовок и контент
        text = post_data.get("text", "")
        lines = text.split("\n", 1)
        title = lines[0][:100] if lines else "Update"
        content = "\n".join(lines[1:]) if len(lines) > 1 else text

        # Сохраняем в БД
        db_post = TelegramPost(
            telegram_message_id=post_data["message_id"],
            title=title,
            content=content,
            category=detect_category(text),
            posted_at=datetime.fromtimestamp(post_data.get("date", 0))
        )

        db.add(db_post)
        count += 1
        print(f"✅ [TELEGRAM] Сохранен пост: {title[:50]}...")

    db.commit()
    print(f"✨ [TELEGRAM] Синхронизировано {count} новых постов")

    return {
        "message": f"Synced {count} new posts",
        "count": count,
        "total_posts": db.query(TelegramPost).count()
    }


@router.get("/posts", response_model=List[TelegramPostSchema])
def get_telegram_posts(limit: int = 50, category: str = None, db: Session = Depends(get_db)):
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

    result = db.query(
        TelegramPost.category.label("name"),
        func.count(TelegramPost.id).label("count")
    ).group_by(TelegramPost.category).all()

    return {
        "categories": [{"name": row.name, "count": row.count} for row in result]
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


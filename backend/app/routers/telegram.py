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

def _detect_category(text):
    """Определить категорию поста по ключевым словам"""
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


def _save_or_update_post(message: dict, db: Session, is_edit: bool = False):
    """Сохранить новый пост или обновить существующий"""
    message_id = message.get("message_id")
    text = message.get("text") or message.get("caption") or ""

    if not text:
        return None

    lines = text.split("\n", 1)
    title = lines[0][:100]
    content = "\n".join(lines[1:]) if len(lines) > 1 else text

    image_url = None
    if "photo" in message:
        photos = message.get("photo", [])
        if photos:
            largest_photo = max(photos, key=lambda p: p.get("file_size", 0))
            image_url = f"https://api.telegram.org/file/bot{largest_photo.get('file_id')}"

    posted_at = datetime.fromtimestamp(message.get("date", 0))

    existing = db.query(TelegramPost).filter(
        TelegramPost.telegram_message_id == message_id
    ).first()

    if existing:
        if is_edit:
            print(f"✏️  [WEBHOOK] Обновляю пост #{message_id}: {title}")
            existing.title = title
            existing.content = content
            existing.category = _detect_category(text)
            existing.image_url = image_url
            existing.posted_at = posted_at
            db.commit()
            db.refresh(existing)
            return existing
        else:
            print(f"⏭️  Post #{message_id} уже существует")
            return existing

    # Новый пост
    db_post = TelegramPost(
        telegram_message_id=message_id,
        title=title,
        content=content,
        category=_detect_category(text),
        image_url=image_url,
        posted_at=posted_at
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    print(f"✅ [WEBHOOK] Новый пост: {title}")
    return db_post


def _notify_students(title: str, content: str, db: Session, telegram_service):
    """Отправить уведомления всем студентам"""
    from ..models import NotificationPreference

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

    return success_count


@router.post("/webhook")
def handle_telegram_webhook(data: dict, db: Session = Depends(get_db)):
    """Получает обновления из Telegram бота через webhook:
    - channel_post: новый пост
    - edited_channel_post: редактирование поста
    - Автоматически детектирует удаленные посты если message_id "прыгает"
    """
    from .. import telegram_service
    from ..models import NotificationPreference

    print(f"📬 [WEBHOOK] Получено обновление из Telegram")
    update_id = data.get("update_id")

    # 1️⃣ НОВЫЙ ПОСТ
    if "channel_post" in data:
        message = data.get("channel_post", {})
        message_id = message.get("message_id")
        chat_id = message.get("chat", {}).get("id")

        print(f"📮 [WEBHOOK] Новый пост #{message_id}")

        if chat_id != -1004422220327:
            return {"ok": True}

        if not message_id:
            return {"ok": True}

        # Проверяем есть ли "пропущенные" message_id (значит посты были удалены в Telegram)
        max_existing = db.query(TelegramPost.telegram_message_id).order_by(
            TelegramPost.telegram_message_id.desc()
        ).first()

        if max_existing and message_id > max_existing[0] + 1:
            # Есть gap между последним постом в БД и новым постом
            # Это значит что посты в этом диапазоне удалены из Telegram
            gap_start = max_existing[0] + 1
            gap_end = message_id

            print(f"🗑️  [WEBHOOK] Детектирован gap: {gap_start}...{gap_end-1}")

            # Удаляем посты из БД которые в этом диапазоне
            deleted_count = 0
            for gap_id in range(gap_start, gap_end):
                deleted_post = db.query(TelegramPost).filter(
                    TelegramPost.telegram_message_id == gap_id
                ).first()
                if deleted_post:
                    print(f"  🗑️  Удаляю пост #{gap_id}: {deleted_post.title}")
                    db.delete(deleted_post)
                    deleted_count += 1

            if deleted_count > 0:
                db.commit()
                print(f"✨ [WEBHOOK] Удалено {deleted_count} постов из БД")

        post = _save_or_update_post(message, db, is_edit=False)
        if post:
            _notify_students(post.title, post.content, db, telegram_service)

        return {"ok": True, "type": "new_post"}

    # 2️⃣ РЕДАКТИРОВАНИЕ ПОСТА
    elif "edited_channel_post" in data:
        message = data.get("edited_channel_post", {})
        message_id = message.get("message_id")
        chat_id = message.get("chat", {}).get("id")

        print(f"✏️  [WEBHOOK] Редактирование поста #{message_id}")

        if chat_id != -1004422220327:
            return {"ok": True}

        if not message_id:
            return {"ok": True}

        post = _save_or_update_post(message, db, is_edit=True)
        if post:
            print(f"✨ Пост #{message_id} обновлён")

        return {"ok": True, "type": "edited_post"}

    # 3️⃣ УДАЛЕНИЕ ПОСТА (через /sync с проверкой)
    return {"ok": True}

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


@router.delete("/posts/{post_id}")
def delete_telegram_post(post_id: int, db: Session = Depends(get_db)):
    """Удалить пост из БД (когда удален из Telegram)"""
    post = db.query(TelegramPost).filter(TelegramPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    print(f"🗑️  [TELEGRAM] Удаляю пост #{post.telegram_message_id}: {post.title}")
    db.delete(post)
    db.commit()

    return {"message": f"Post {post_id} deleted successfully", "deleted_id": post_id}


@router.post("/sync-deletions")
def sync_telegram_deletions(db: Session = Depends(get_db)):
    """⚠️  DEPRECATED - Telegram Bot API не поддерживает получение списка постов с канала"""
    return {
        "message": "Use DELETE /api/telegram/posts/{post_id} instead to delete individual posts",
        "deleted": 0,
        "note": "Telegram Bot API limitation: cannot fetch posts from channels for verification"
    }


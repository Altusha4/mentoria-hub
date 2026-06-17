import os
import json
import ssl
import urllib.request
import urllib.parse
from typing import Optional, List
import certifi


def _ssl_ctx() -> ssl.SSLContext:
    return ssl.create_default_context(cafile=certifi.where())


def _token() -> str:
    return os.getenv("TELEGRAM_BOT_TOKEN", "8925206527:AAGi56pHckWSZ5-YNtQyeLRp7mkdtobzBik").strip()


def _app_url() -> str:
    return os.getenv("APP_URL", "http://localhost:5173").strip()


def is_configured() -> bool:
    return bool(_token())


def _telegram_api_call(method: str, params: dict) -> dict:
    """Делает запрос к Telegram Bot API"""
    token = _token()
    url = f"https://api.telegram.org/bot{token}/{method}"

    if params:
        query_string = urllib.parse.urlencode(params)
        url = f"{url}?{query_string}"

    try:
        with urllib.request.urlopen(url, timeout=10, context=_ssl_ctx()) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"❌ Telegram API error: {e}")
        return {"ok": False, "error": str(e)}


def get_chat_info(chat_id: str) -> dict:
    """Получить информацию о чате/канале"""
    return _telegram_api_call("getChat", {"chat_id": chat_id})


def get_recent_posts(chat_id: str, limit: int = 10) -> List[dict]:
    """Получить последние посты с канала через Telegram Bot API"""
    print(f"📥 Получаю последние {limit} постов из канала {chat_id}...")

    result = _telegram_api_call("getUpdates", {
        "limit": limit * 2,
        "timeout": 30,
        "allowed_updates": ["channel_post"]
    })

    if not result.get("ok"):
        print(f"❌ Ошибка получения постов: {result.get('error')}")
        return []

    posts = []
    for update in result.get("result", []):
        if "channel_post" in update:
            msg = update["channel_post"]
            if msg.get("chat", {}).get("id") == int(chat_id):
                posts.append({
                    "message_id": msg.get("message_id"),
                    "text": msg.get("text") or msg.get("caption") or "",
                    "date": msg.get("date"),
                    "photo": msg.get("photo"),
                    "video": msg.get("video"),
                    "forward_from_chat": msg.get("forward_from_chat")
                })

    print(f"✅ Получено {len(posts)} постов")
    return posts[:limit]


def send_telegram_message(chat_id: str, text: str) -> tuple[bool, Optional[str]]:
    token = _token()
    if not token:
        return False, "Telegram bot not configured (missing TELEGRAM_BOT_TOKEN env var)"
    if not chat_id:
        return False, "No Telegram chat_id configured for this student"
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "HTML"}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10, context=_ssl_ctx()) as resp:
            result = json.loads(resp.read())
            if result.get("ok"):
                return True, None
            return False, result.get("description", "Unknown Telegram API error")
    except Exception as e:
        return False, str(e)


def format_test_message(student_name: str) -> str:
    app_url = _app_url()
    return (
        f"🛡️ <b>Mentoria Guardian</b>\n\n"
        f"✅ Test successful!\n\n"
        f"Hi <b>{student_name}</b>, your Telegram notifications are working correctly.\n\n"
        f"You'll receive:\n"
        f"• 📅 Deadline alerts\n"
        f"• 📊 Weekly digests\n"
        f"• 📚 Course reminders\n\n"
        f"🚀 <a href='{app_url}'>Open Mentoria Hub</a>"
    )


def format_deadline_alert(student_name: str, opportunity_title: str, days_left: int) -> str:
    app_url = _app_url()
    if days_left == 0:
        urgency = "🔴 DUE TODAY"
    elif days_left == 1:
        urgency = "🔴 TOMORROW"
    elif days_left <= 3:
        urgency = "🟡 SOON"
    else:
        urgency = "🔵 UPCOMING"

    return (
        f"🛡️ <b>Mentoria Guardian Alert</b>\n\n"
        f"{urgency}: <b>{opportunity_title}</b>\n"
        f"closes in <b>{days_left} day{'s' if days_left != 1 else ''}</b>.\n\n"
        f"Your next steps:\n"
        f"✅ Review requirements\n"
        f"✅ Prepare application\n"
        f"✅ Submit before deadline\n\n"
        f"💪 You've got this, {student_name}!\n"
        f"🚀 <a href='{app_url}/opportunities'>Open Opportunities</a>"
    )


def format_new_post_notification(title: str, content: str) -> str:
    """Уведомление о новом посте в канале"""
    app_url = _app_url()
    return (
        f"📢 <b>New Update from Mentoria</b>\n\n"
        f"<b>{title}</b>\n\n"
        f"{content[:200]}...\n\n"
        f"🔗 <a href='{app_url}/updates'>View all updates</a>"
    )

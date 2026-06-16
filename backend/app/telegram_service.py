import os
import json
import urllib.request
from typing import Optional

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
APP_URL = os.getenv("APP_URL", "http://localhost:5173")


def is_configured() -> bool:
    return bool(TELEGRAM_BOT_TOKEN)


def send_telegram_message(chat_id: str, text: str) -> tuple[bool, Optional[str]]:
    if not is_configured():
        return False, "Telegram bot not configured (missing TELEGRAM_BOT_TOKEN env var)"
    if not chat_id:
        return False, "No Telegram chat_id configured for this student"
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "HTML"}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            if result.get("ok"):
                return True, None
            return False, result.get("description", "Unknown Telegram API error")
    except Exception as e:
        return False, str(e)


def format_test_message(student_name: str) -> str:
    return (
        f"🛡️ <b>Mentoria Guardian</b>\n\n"
        f"✅ Test successful!\n\n"
        f"Hi <b>{student_name}</b>, your Telegram notifications are working correctly.\n\n"
        f"You'll receive:\n"
        f"• 📅 Deadline alerts\n"
        f"• 📊 Weekly digests\n"
        f"• 📚 Course reminders\n\n"
        f"🚀 <a href='{APP_URL}'>Open Mentoria Hub</a>"
    )


def format_deadline_alert(student_name: str, opportunity_title: str, days_left: int) -> str:
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
        f"🚀 <a href='{APP_URL}/opportunities'>Open Opportunities</a>"
    )


def get_bot_username() -> Optional[str]:
    if not is_configured():
        return None
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getMe"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            return data.get("result", {}).get("username")
    except Exception:
        return None


def get_recent_updates(limit: int = 50) -> list:
    if not is_configured():
        return []
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates?limit={limit}&timeout=0"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read())
            return data.get("result", [])
    except Exception:
        return []


def format_weekly_digest(student_name: str, digest: dict) -> str:
    risk = digest.get("risk_status", "safe")
    risk_line = {
        "safe": "🟢 Status: <b>Safe</b> — no urgent deadlines",
        "attention": "🟡 Status: <b>Needs Attention</b> — deadlines this week",
        "risk": "🔴 Status: <b>Deadline Risk</b> — due today or tomorrow",
    }.get(risk, "⚪ Status: Unknown")

    lines = [
        f"🛡️ <b>Mentoria Guardian — Weekly Report</b>",
        f"Hi <b>{student_name}</b>! Here's your weekly update.\n",
        risk_line,
        "",
    ]

    deadlines = digest.get("upcoming_deadlines", [])
    if deadlines:
        lines.append("📅 <b>Upcoming Deadlines:</b>")
        for d in deadlines[:3]:
            days = d.get("days_left", 0)
            lines.append(f"  • {d['title']} — {days}d left")
        lines.append("")

    courses = digest.get("course_progress", [])
    if courses:
        lines.append("📚 <b>Course Progress:</b>")
        for c in courses[:3]:
            pct = c.get("progress", 0)
            filled = int(pct / 10)
            bar = "█" * filled + "░" * (10 - filled)
            lines.append(f"  {c['title'][:28]}")
            lines.append(f"  [{bar}] {pct:.0f}%")
        lines.append("")

    actions = digest.get("next_actions", [])
    if actions:
        lines.append("⚡ <b>Next Actions:</b>")
        for a in actions:
            lines.append(f"  → {a}")
        lines.append("")

    lines.append(f"🚀 <a href='{APP_URL}'>Open Mentoria Hub</a>")
    return "\n".join(lines)

import os
import json
import ssl
import urllib.request
from typing import Optional

import certifi


def _ssl_ctx() -> ssl.SSLContext:
    return ssl.create_default_context(cafile=certifi.where())


def _token() -> str:
    return os.getenv("TELEGRAM_BOT_TOKEN", "").strip()


def _app_url() -> str:
    return os.getenv("APP_URL", "http://localhost:5173").strip()


def is_configured() -> bool:
    return bool(_token())


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


def get_bot_username() -> Optional[str]:
    token = _token()
    if not token:
        return None
    try:
        url = f"https://api.telegram.org/bot{token}/getMe"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5, context=_ssl_ctx()) as resp:
            data = json.loads(resp.read())
            return data.get("result", {}).get("username")
    except Exception:
        return None


def get_recent_updates(limit: int = 50) -> list:
    token = _token()
    if not token:
        return []
    try:
        url = f"https://api.telegram.org/bot{token}/getUpdates?limit={limit}&timeout=0"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=6, context=_ssl_ctx()) as resp:
            data = json.loads(resp.read())
            return data.get("result", [])
    except Exception:
        return []


_last_update_id: int = 0


def get_pending_commands(limit: int = 50) -> list:
    global _last_update_id
    token = _token()
    if not token:
        return []
    try:
        offset = _last_update_id + 1 if _last_update_id else ""
        url = f"https://api.telegram.org/bot{token}/getUpdates?limit={limit}&timeout=0"
        if offset:
            url += f"&offset={offset}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=6, context=_ssl_ctx()) as resp:
            data = json.loads(resp.read())
            updates = data.get("result", [])
            if updates:
                _last_update_id = updates[-1]["update_id"]
            return updates
    except Exception:
        return []


def format_coach_today(student_name: str, missions: list, guardian_score: float) -> str:
    app_url = _app_url()
    lines = [
        f"🛡️ <b>Today's Mission — {student_name}</b>",
        f"Guardian Score: <b>{guardian_score:.0f}/100</b>\n",
        "📋 <b>What to do today:</b>",
    ]
    if not missions:
        lines.append("  No active missions. Keep exploring opportunities!")
    else:
        for m in missions:
            lines.append(f"\n  {m['icon']} <b>{m['title'][:45]}</b>")
            lines.append(f"  {m['action'][:80]}")
    lines.append(f"\n🚀 <a href='{app_url}/guardian'>Open Guardian</a>")
    return "\n".join(lines)


def format_coach_deadlines(student_name: str, watchlist: list) -> str:
    app_url = _app_url()
    upcoming = [w for w in watchlist if w.get("days_left") is not None and w["days_left"] >= 0]
    upcoming.sort(key=lambda x: x["days_left"])
    lines = [f"📅 <b>Upcoming Deadlines — {student_name}</b>\n"]
    if not upcoming:
        lines.append("No upcoming deadlines in your watchlist.")
        lines.append("Save opportunities in Mentoria Hub to track them here.")
    else:
        for w in upcoming[:6]:
            d = w["days_left"]
            icon = "🔴" if d <= 1 else "🟡" if d <= 7 else "🔵"
            label = "Due TODAY" if d == 0 else "Due tomorrow" if d == 1 else f"{d} days left"
            effective = w.get("effective_url") or w.get("apply_url") or w.get("source_url")
            title_str = f"<a href='{effective}'>{w['title'][:45]}</a>" if effective else f"<b>{w['title'][:45]}</b>"
            lines.append(f"{icon} {title_str}")
            lines.append(f"   {label} · {w['readiness_score']:.0f}% ready")
            if w.get("next_action"):
                lines.append(f"   ⚡ {w['next_action'][:60]}")
    lines.append(f"\n🚀 <a href='{app_url}/guardian'>View in Guardian</a>")
    return "\n".join(lines)


def format_coach_watchlist(student_name: str, watchlist: list) -> str:
    app_url = _app_url()
    stage_icon = {"discovered": "💡", "exploring": "🔍", "preparing": "📝", "ready": "✅", "applied": "🚀"}
    lines = [f"🎯 <b>Your Watchlist — {student_name}</b>\n"]
    if not watchlist:
        lines.append("No tracked opportunities yet.")
        lines.append("Visit Mentoria Hub to save opportunities and track your progress.")
    else:
        for w in watchlist[:6]:
            ico = stage_icon.get(w.get("stage", "discovered"), "💡")
            d = w.get("days_left")
            dl = f" · {d}d left" if d is not None and d >= 0 else (" · Expired" if d is not None else "")
            effective = w.get("effective_url") or w.get("apply_url") or w.get("source_url")
            title_str = f"<a href='{effective}'>{w['title'][:45]}</a>" if effective else f"<b>{w['title'][:45]}</b>"
            lines.append(f"{ico} {title_str}")
            lines.append(f"   {w['readiness_score']:.0f}% ready{dl}")
            if w.get("next_action"):
                lines.append(f"   ⚡ {w['next_action'][:60]}")
    lines.append(f"\n🚀 <a href='{app_url}/guardian'>Guardian Dashboard</a>")
    return "\n".join(lines)


def format_coach_score(student_name: str, guardian_score: float, risk_status: str) -> str:
    app_url = _app_url()
    risk_line = {
        "safe": "🟢 All clear — no urgent deadlines",
        "attention": "🟡 Heads up — deadlines this week",
        "risk": "🔴 Urgent — deadline today or tomorrow",
    }.get(risk_status, "⚪ Status unknown")
    if guardian_score >= 80:
        tier, tier_icon = "Fully Protected", "🏆"
    elif guardian_score >= 60:
        tier, tier_icon = "On Track", "✅"
    elif guardian_score >= 40:
        tier, tier_icon = "Needs Attention", "⚡"
    else:
        tier, tier_icon = "At Risk", "⚠️"
    lines = [
        f"🛡️ <b>Guardian Score — {student_name}</b>\n",
        f"{tier_icon} <b>{guardian_score:.0f} / 100</b> — {tier}",
        "",
        risk_line,
        "",
        f"Send /today for today's missions.",
        f"Send /deadlines to check your timeline.",
        f"\n🚀 <a href='{app_url}/guardian'>Full Report</a>",
    ]
    return "\n".join(lines)


def format_coach_courses(student_name: str, course_progress: list, incomplete: int) -> str:
    app_url = _app_url()
    lines = [f"📚 <b>Courses — {student_name}</b>\n"]
    if not course_progress:
        lines.append("No enrolled courses yet.")
        lines.append(f"Browse courses at {app_url}/courses")
    else:
        for c in course_progress:
            pct = c.get("progress", 0)
            done = pct >= 100
            icon = "🏆" if done else "🔥" if pct > 50 else "📖" if pct > 0 else "🚀"
            filled = int(pct / 10)
            bar = "█" * filled + "░" * (10 - filled)
            status = "Complete! 🎉" if done else f"{pct:.0f}%"
            lines.append(f"{icon} <b>{c['title'][:40]}</b>")
            lines.append(f"   [{bar}] {status}")
        if incomplete > 0:
            lines.append(f"\n⏳ {incomplete} lesson{'s' if incomplete > 1 else ''} remaining across all courses")
    lines.append(f"\n🚀 <a href='{app_url}/courses'>Go to Courses</a>")
    return "\n".join(lines)


def format_coach_guardian(student_name: str, data: dict) -> str:
    app_url = _app_url()
    score = data.get("guardian_score", 0)
    risk = data.get("risk_status", "safe")
    watchlist = data.get("watchlist", [])
    courses = data.get("course_progress", [])
    missions = data.get("missions", [])
    risk_line = {
        "safe": "🟢 Status: Safe",
        "attention": "🟡 Status: Needs Attention",
        "risk": "🔴 Status: Deadline Risk",
    }.get(risk, "⚪")
    lines = [
        f"🛡️ <b>Mentoria Guardian</b>",
        f"<b>{student_name}</b> · Score: {score:.0f}/100",
        "",
        risk_line,
        "",
    ]
    if missions:
        lines.append("📋 <b>Today's missions:</b>")
        for m in missions[:2]:
            lines.append(f"  {m['icon']} {m['action'][:60]}")
        lines.append("")
    urgent = [w for w in watchlist if w.get("days_left") is not None and 0 <= w["days_left"] <= 7]
    if urgent:
        lines.append("⚠️ <b>Urgent deadlines:</b>")
        for w in urgent[:3]:
            d = w["days_left"]
            label = "TODAY" if d == 0 else f"{d}d"
            lines.append(f"  • {w['title'][:38]} ({label})")
        lines.append("")
    if courses:
        active = [c for c in courses if 0 < c.get("progress", 0) < 100]
        if active:
            c = active[0]
            lines.append(f"📖 Continue: <b>{c['title'][:35]}</b> — {c['progress']:.0f}%")
            lines.append("")
    lines.append(f"🚀 <a href='{app_url}/guardian'>Open Guardian</a>")
    lines.append("\n<i>/today /deadlines /watchlist /score /courses /help</i>")
    return "\n".join(lines)


def format_coach_help() -> str:
    return (
        "🛡️ <b>Mentoria Guardian Bot</b>\n\n"
        "I'm your personal education coach. Here's what I can do:\n\n"
        "  /today — Today's priority missions\n"
        "  /deadlines — Upcoming application deadlines\n"
        "  /watchlist — Tracked opportunities + readiness\n"
        "  /score — Your Guardian Score\n"
        "  /courses — Course progress\n"
        "  /guardian — Full summary\n"
        "  /help — Show this message\n\n"
        "Powered by Mentoria Hub 🚀"
    )


def format_weekly_digest(student_name: str, digest: dict) -> str:
    app_url = _app_url()
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

    lines.append(f"🚀 <a href='{app_url}'>Open Mentoria Hub</a>")
    return "\n".join(lines)

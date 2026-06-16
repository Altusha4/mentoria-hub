from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel

from ..database import get_db
from ..models import (
    StudentProfile, NotificationPreference, NotificationLog,
    SavedOpportunity, Enrollment, LessonProgress,
)
from ..email_service import (
    send_test_email, send_digest_email, send_deadline_email,
    is_configured as email_configured,
)
from ..telegram_service import (
    send_telegram_message, format_test_message,
    format_deadline_alert, format_weekly_digest,
    is_configured as telegram_configured,
    get_bot_username, get_recent_updates,
)

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class PreferenceUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    telegram_enabled: Optional[bool] = None
    telegram_chat_id: Optional[str] = None
    deadline_alerts: Optional[bool] = None
    weekly_digest: Optional[bool] = None
    course_reminders: Optional[bool] = None


def _get_student_or_404(student_id: int, db: Session) -> StudentProfile:
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


def _get_or_create_prefs(student_id: int, db: Session) -> NotificationPreference:
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.student_id == student_id
    ).first()
    if not prefs:
        prefs = NotificationPreference(student_id=student_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs


def _log(
    db: Session,
    student_id: int,
    channel: str,
    type: str,
    title: str,
    message: str,
    status: str,
    error: Optional[str] = None,
) -> None:
    entry = NotificationLog(
        student_id=student_id,
        channel=channel,
        type=type,
        title=title,
        message=message[:500],
        status=status,
        error_message=error,
        sent_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()


def _build_digest(student_id: int, db: Session) -> dict:
    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.student_id == student_id
    ).all()

    today = date.today()
    upcoming_deadlines = []
    risk_status = "safe"

    for s in saved:
        opp = s.opportunity
        if opp and opp.deadline:
            days_left = (opp.deadline - today).days
            if days_left >= 0:
                upcoming_deadlines.append({
                    "id": opp.id,
                    "title": opp.title,
                    "category": opp.category,
                    "deadline": opp.deadline.isoformat(),
                    "days_left": days_left,
                })
                if days_left <= 1 and risk_status != "risk":
                    risk_status = "risk"
                elif days_left <= 7 and risk_status == "safe":
                    risk_status = "attention"

    upcoming_deadlines.sort(key=lambda x: x["days_left"])

    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == student_id
    ).all()

    course_progress = [
        {
            "id": e.course.id,
            "title": e.course.title,
            "progress": e.progress,
            "completed": e.completed,
        }
        for e in enrollments
    ]

    all_lesson_ids = [l.id for e in enrollments for l in e.course.lessons]
    completed_ids = {
        lp.lesson_id
        for lp in db.query(LessonProgress).filter(
            LessonProgress.student_id == student_id,
            LessonProgress.completed == True,
        ).all()
    }
    incomplete_count = len([lid for lid in all_lesson_ids if lid not in completed_ids])

    next_actions: list[str] = []

    if upcoming_deadlines:
        nd = upcoming_deadlines[0]
        if nd["days_left"] <= 3:
            next_actions.append(
                f"Apply to '{nd['title']}' before the deadline ({nd['days_left']}d left)"
            )
        else:
            next_actions.append(f"Review saved opportunity: {nd['title']}")

    for cp in course_progress:
        if not cp["completed"] and cp["progress"] < 100:
            if cp["progress"] == 0:
                next_actions.append(f"Start your '{cp['title']}' course")
            else:
                next_actions.append(
                    f"Continue '{cp['title']}' — you're {cp['progress']:.0f}% done"
                )
            break

    if incomplete_count > 0:
        next_actions.append(
            f"Complete {incomplete_count} pending lesson{'s' if incomplete_count > 1 else ''} in your courses"
        )

    if not next_actions:
        next_actions.append("Explore new opportunities that match your interests")

    if len(next_actions) < 2:
        next_actions.append("Review your saved opportunities and check requirements")

    return {
        "risk_status": risk_status,
        "upcoming_deadlines": upcoming_deadlines[:5],
        "course_progress": course_progress,
        "incomplete_lessons": incomplete_count,
        "next_actions": next_actions[:3],
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.get("/preferences/{student_id}")
def get_preferences(student_id: int, db: Session = Depends(get_db)):
    _get_student_or_404(student_id, db)
    prefs = _get_or_create_prefs(student_id, db)
    return {
        "id": prefs.id,
        "student_id": prefs.student_id,
        "email_enabled": prefs.email_enabled,
        "telegram_enabled": prefs.telegram_enabled,
        "telegram_chat_id": prefs.telegram_chat_id,
        "deadline_alerts": prefs.deadline_alerts,
        "weekly_digest": prefs.weekly_digest,
        "course_reminders": prefs.course_reminders,
        "email_configured": email_configured(),
        "telegram_configured": telegram_configured(),
    }


@router.put("/preferences/{student_id}")
def update_preferences(student_id: int, data: PreferenceUpdate, db: Session = Depends(get_db)):
    _get_student_or_404(student_id, db)
    prefs = _get_or_create_prefs(student_id, db)

    for field, value in data.dict(exclude_none=True).items():
        setattr(prefs, field, value)

    prefs.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prefs)

    return {
        "id": prefs.id,
        "student_id": prefs.student_id,
        "email_enabled": prefs.email_enabled,
        "telegram_enabled": prefs.telegram_enabled,
        "telegram_chat_id": prefs.telegram_chat_id,
        "deadline_alerts": prefs.deadline_alerts,
        "weekly_digest": prefs.weekly_digest,
        "course_reminders": prefs.course_reminders,
        "email_configured": email_configured(),
        "telegram_configured": telegram_configured(),
    }


@router.post("/test-email/{student_id}")
def test_email(student_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)
    title = "Test Email Notification"
    message = f"Test email sent to {student.email}"

    if not email_configured():
        _log(db, student_id, "email", "test", title, message, "skipped",
             "Email service not configured")
        return {
            "success": False,
            "demo_mode": True,
            "message": "Demo mode: Email service not configured. Add SMTP_USER and SMTP_PASSWORD env vars to enable real emails.",
            "preview": f"Would send test email to {student.email}",
        }

    ok, err = send_test_email(student.email, student.first_name)
    status = "sent" if ok else "failed"
    _log(db, student_id, "email", "test", title, message, status, err)

    if ok:
        return {"success": True, "message": f"Test email sent to {student.email}"}
    return {"success": False, "message": f"Failed to send email: {err}"}


@router.post("/test-telegram/{student_id}")
def test_telegram(student_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)
    prefs = _get_or_create_prefs(student_id, db)
    title = "Test Telegram Notification"
    message = format_test_message(student.first_name)

    if not telegram_configured():
        _log(db, student_id, "telegram", "test", title, message, "skipped",
             "Telegram bot not configured")
        return {
            "success": False,
            "demo_mode": True,
            "message": "Demo mode: Telegram bot not configured. Add TELEGRAM_BOT_TOKEN env var to enable real Telegram messages.",
            "preview": message,
        }

    if not prefs.telegram_chat_id:
        _log(db, student_id, "telegram", "test", title, message, "skipped",
             "No chat_id configured")
        return {
            "success": False,
            "message": "No Telegram Chat ID configured. Enter your Chat ID in notification settings.",
        }

    ok, err = send_telegram_message(prefs.telegram_chat_id, message)
    status = "sent" if ok else "failed"
    _log(db, student_id, "telegram", "test", title, message, status, err)

    if ok:
        return {"success": True, "message": "Test message sent to Telegram"}
    return {"success": False, "message": f"Failed: {err}"}


@router.post("/deadline-scan/{student_id}")
def deadline_scan(student_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)
    prefs = _get_or_create_prefs(student_id, db)

    if not prefs.deadline_alerts:
        return {"message": "Deadline alerts disabled", "sent": 0, "scanned": 0}

    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.student_id == student_id
    ).all()

    today = date.today()
    alert_days = {0, 1, 3, 7}
    results = []

    for s in saved:
        opp = s.opportunity
        if not opp or not opp.deadline:
            continue
        days_left = (opp.deadline - today).days
        if days_left not in alert_days or days_left < 0:
            continue

        sent_channels = []

        if prefs.email_enabled:
            if not email_configured():
                _log(db, student_id, "email", "deadline_alert",
                     f"Deadline: {opp.title}", f"{days_left}d left", "skipped",
                     "Email not configured")
            else:
                ok, err = send_deadline_email(student.email, student.first_name, opp.title, days_left)
                _log(db, student_id, "email", "deadline_alert",
                     f"Deadline: {opp.title}", f"{days_left}d left",
                     "sent" if ok else "failed", err)
                if ok:
                    sent_channels.append("email")

        if prefs.telegram_enabled and prefs.telegram_chat_id:
            text = format_deadline_alert(student.first_name, opp.title, days_left)
            if not telegram_configured():
                _log(db, student_id, "telegram", "deadline_alert",
                     f"Deadline: {opp.title}", text, "skipped", "Telegram not configured")
            else:
                ok, err = send_telegram_message(prefs.telegram_chat_id, text)
                _log(db, student_id, "telegram", "deadline_alert",
                     f"Deadline: {opp.title}", text, "sent" if ok else "failed", err)
                if ok:
                    sent_channels.append("telegram")

        results.append({
            "opportunity": opp.title,
            "days_left": days_left,
            "channels": sent_channels,
        })

    return {
        "scanned": len(saved),
        "alerts_triggered": len(results),
        "results": results,
        "demo_mode": not email_configured() and not telegram_configured(),
    }


@router.get("/digest/{student_id}")
def get_digest_preview(student_id: int, db: Session = Depends(get_db)):
    _get_student_or_404(student_id, db)
    return _build_digest(student_id, db)


@router.post("/send-digest/{student_id}")
def send_digest(student_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)
    prefs = _get_or_create_prefs(student_id, db)
    digest = _build_digest(student_id, db)
    sent: list[str] = []
    errors: list[str] = []
    demo_mode = False

    if prefs.email_enabled and prefs.weekly_digest:
        if not email_configured():
            demo_mode = True
            _log(db, student_id, "email", "weekly_digest", "Weekly Digest",
                 "digest preview", "skipped", "Email not configured")
        else:
            ok, err = send_digest_email(student.email, student.first_name, digest)
            _log(db, student_id, "email", "weekly_digest", "Weekly Digest",
                 "digest sent", "sent" if ok else "failed", err)
            if ok:
                sent.append("email")
            else:
                errors.append(f"email: {err}")

    if prefs.telegram_enabled and prefs.weekly_digest and prefs.telegram_chat_id:
        text = format_weekly_digest(student.first_name, digest)
        if not telegram_configured():
            demo_mode = True
            _log(db, student_id, "telegram", "weekly_digest", "Weekly Digest",
                 text, "skipped", "Telegram not configured")
        else:
            ok, err = send_telegram_message(prefs.telegram_chat_id, text)
            _log(db, student_id, "telegram", "weekly_digest", "Weekly Digest",
                 text, "sent" if ok else "failed", err)
            if ok:
                sent.append("telegram")
            else:
                errors.append(f"telegram: {err}")

    return {
        "sent_via": sent,
        "errors": errors,
        "demo_mode": demo_mode,
        "digest": digest,
    }


@router.get("/telegram-link/{student_id}")
def get_telegram_link(student_id: int, db: Session = Depends(get_db)):
    _get_student_or_404(student_id, db)
    prefs = _get_or_create_prefs(student_id, db)

    if prefs.telegram_chat_id:
        return {"connected": True}

    if not telegram_configured():
        return {"connected": False, "configured": False}

    username = get_bot_username()
    if not username:
        return {"connected": False, "configured": False}

    link = f"https://t.me/{username}?start={student_id}"
    return {"connected": False, "configured": True, "link": link}


@router.post("/telegram-poll/{student_id}")
def poll_telegram_connection(student_id: int, db: Session = Depends(get_db)):
    _get_student_or_404(student_id, db)
    prefs = _get_or_create_prefs(student_id, db)

    if prefs.telegram_chat_id:
        return {"connected": True}

    if not telegram_configured():
        return {"connected": False}

    updates = get_recent_updates(50)
    for update in updates:
        msg = update.get("message", {})
        text = msg.get("text", "")
        chat_id = str(msg.get("chat", {}).get("id", ""))
        if chat_id and (text == f"/start {student_id}" or text.startswith(f"/start {student_id} ")):
            prefs.telegram_chat_id = chat_id
            prefs.telegram_enabled = True
            prefs.updated_at = datetime.utcnow()
            db.commit()
            welcome = (
                f"🛡️ <b>Mentoria Guardian connected!</b>\n\n"
                f"You'll now receive:\n"
                f"• 📅 Deadline alerts\n"
                f"• 📊 Weekly progress reports\n"
                f"• 📚 Course reminders\n\n"
                f"Let's achieve your goals together! 🚀"
            )
            send_telegram_message(chat_id, welcome)
            _log(db, student_id, "telegram", "test", "Connected", welcome, "sent")
            return {"connected": True}

    return {"connected": False}


@router.get("/logs/{student_id}")
def get_logs(student_id: int, limit: int = 50, db: Session = Depends(get_db)):
    _get_student_or_404(student_id, db)
    logs = (
        db.query(NotificationLog)
        .filter(NotificationLog.student_id == student_id)
        .order_by(NotificationLog.sent_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": l.id,
            "channel": l.channel,
            "type": l.type,
            "title": l.title,
            "status": l.status,
            "error_message": l.error_message,
            "sent_at": l.sent_at.isoformat(),
        }
        for l in logs
    ]

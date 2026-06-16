from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from ..database import get_db
from ..models import StudentProfile, SavedOpportunity, NotificationPreference
from ..guardian_engine import compute_mission
from ..email_service import send_mission_report, is_configured as email_configured
from ..telegram_service import (
    is_configured as telegram_configured,
    get_pending_commands,
    send_telegram_message,
    format_coach_today,
    format_coach_deadlines,
    format_coach_watchlist,
    format_coach_score,
    format_coach_courses,
    format_coach_guardian,
    format_coach_help,
)
from ..models import OpportunityJourney

router = APIRouter(prefix="/api/guardian", tags=["guardian"])

VALID_STAGES = {"discovered", "exploring", "preparing", "ready", "applied"}


class JourneyUpdate(BaseModel):
    stage: str


def _get_student_or_404(student_id: int, db: Session) -> StudentProfile:
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/mission/{student_id}")
def get_mission(student_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)
    return compute_mission(student_id, student, db)


@router.get("/readiness/{student_id}/{opportunity_id}")
def get_readiness(student_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    from ..readiness_calculator import calculate_readiness
    from ..models import Enrollment
    from datetime import date

    student = _get_student_or_404(student_id, db)

    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.student_id == student_id,
        SavedOpportunity.opportunity_id == opportunity_id,
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Opportunity not in watchlist")

    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == student_id
    ).all()

    result = calculate_readiness(student, saved.opportunity, enrollments)

    journey = db.query(OpportunityJourney).filter(
        OpportunityJourney.student_id == student_id,
        OpportunityJourney.opportunity_id == opportunity_id,
    ).first()
    if not journey:
        journey = OpportunityJourney(
            student_id=student_id,
            opportunity_id=opportunity_id,
            readiness_score=result["readiness_score"],
            stage=result["suggested_stage"] if result["suggested_stage"] != "discovered" else "discovered",
        )
        db.add(journey)
        db.commit()
        db.refresh(journey)

    return {
        **result,
        "stage": journey.stage,
        "opportunity_title": saved.opportunity.title,
    }


@router.put("/journey/{student_id}/{opportunity_id}")
def update_journey_stage(
    student_id: int,
    opportunity_id: int,
    data: JourneyUpdate,
    db: Session = Depends(get_db),
):
    _get_student_or_404(student_id, db)

    if data.stage not in VALID_STAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage. Must be one of: {', '.join(sorted(VALID_STAGES))}",
        )

    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.student_id == student_id,
        SavedOpportunity.opportunity_id == opportunity_id,
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Opportunity not in watchlist")

    journey = db.query(OpportunityJourney).filter(
        OpportunityJourney.student_id == student_id,
        OpportunityJourney.opportunity_id == opportunity_id,
    ).first()
    if not journey:
        journey = OpportunityJourney(
            student_id=student_id,
            opportunity_id=opportunity_id,
        )
        db.add(journey)

    journey.stage = data.stage
    journey.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(journey)

    return {"stage": journey.stage, "updated_at": journey.updated_at.isoformat()}


@router.post("/email-report/{student_id}")
def send_email_report(student_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)

    if not email_configured():
        return {
            "success": False,
            "message": "Email is not set up on this server. Contact the administrator.",
        }

    data = compute_mission(student_id, student, db)
    ok, err = send_mission_report(student.email, student.first_name or student.email, data)

    if ok:
        return {"success": True, "message": f"Weekly report sent to {student.email}"}
    return {"success": False, "message": "Could not send the report. Please try again later."}


@router.post("/bot-poll")
def bot_poll(db: Session = Depends(get_db)):
    if not telegram_configured():
        return {"processed": 0, "configured": False}

    updates = get_pending_commands()
    processed = 0

    for update in updates:
        msg = update.get("message", {})
        text = (msg.get("text") or "").strip()
        chat_id = str(msg.get("chat", {}).get("id", ""))

        if not chat_id or not text.startswith("/"):
            continue

        pref = db.query(NotificationPreference).filter(
            NotificationPreference.telegram_chat_id == chat_id
        ).first()

        if not pref:
            send_telegram_message(
                chat_id,
                "⚠️ <b>Account not linked.</b>\n\nOpen Mentoria Hub, go to Guardian, and connect your Telegram to use bot commands.",
            )
            continue

        student = db.query(StudentProfile).filter(StudentProfile.id == pref.student_id).first()
        if not student:
            continue

        command = text.split()[0].lower().split("@")[0]
        name = student.first_name or "Student"

        if command in ("/today",):
            data = compute_mission(pref.student_id, student, db)
            reply = format_coach_today(name, data["missions"], data["guardian_score"])
        elif command in ("/deadlines",):
            data = compute_mission(pref.student_id, student, db)
            reply = format_coach_deadlines(name, data["watchlist"])
        elif command in ("/watchlist",):
            data = compute_mission(pref.student_id, student, db)
            reply = format_coach_watchlist(name, data["watchlist"])
        elif command in ("/score",):
            data = compute_mission(pref.student_id, student, db)
            reply = format_coach_score(name, data["guardian_score"], data["risk_status"])
        elif command in ("/courses",):
            data = compute_mission(pref.student_id, student, db)
            reply = format_coach_courses(name, data["course_progress"], data["incomplete_lessons"])
        elif command in ("/guardian",):
            data = compute_mission(pref.student_id, student, db)
            reply = format_coach_guardian(name, data)
        elif command in ("/help", "/start"):
            reply = format_coach_help()
        else:
            reply = f"Unknown command: <code>{command}</code>\n\nSend /help to see what I can do."

        send_telegram_message(chat_id, reply)
        processed += 1

    return {"processed": processed, "configured": True}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from pydantic import BaseModel

from ..database import get_db
from ..models import (
    StudentProfile, SavedOpportunity, NotificationPreference,
    OpportunityJourney, Opportunity, Enrollment,
)
from ..guardian_engine import compute_mission
from ..readiness_calculator import calculate_readiness
from ..email_service import send_mission_report, is_configured as email_configured
from ..telegram_service import (
    is_configured as telegram_configured,
    send_telegram_message,
    get_pending_commands,
    format_coach_today,
    format_coach_deadlines,
    format_coach_watchlist,
    format_coach_score,
    format_coach_courses,
    format_coach_guardian,
    format_coach_help,
)

router = APIRouter(prefix="/api/guardian", tags=["guardian"])

VALID_STAGES = {"discovered", "exploring", "preparing", "ready", "applied"}


class JourneyUpdate(BaseModel):
    stage: str


def _get_student_or_404(student_id: int, db: Session) -> StudentProfile:
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


def _score_opportunity(opp: Opportunity, interests: list, grade) -> int:
    score = 0
    tags = [t.strip().lower() for t in (opp.tags or "").split(",")]
    direction = (opp.direction or "").lower()
    for interest in interests:
        il = interest.lower()
        if il in direction:
            score += 3
        if any(il in t for t in tags):
            score += 2
    if grade and opp.grade_level:
        for gp in (opp.grade_level or "").split(","):
            gp = gp.strip()
            try:
                if "-" in gp:
                    lo, hi = gp.split("-")
                    if int(lo) <= grade <= int(hi):
                        score += 1
                        break
                elif int(gp) == grade:
                    score += 1
                    break
            except ValueError:
                pass
    return score


def _match_reason(opp: Opportunity, interests: list) -> str:
    for interest in interests:
        il = interest.lower()
        if il in (opp.direction or "").lower():
            return f"Matches your interest in {interest}"
        if any(il in t for t in (opp.tags or "").lower().split(",")):
            return f"Related to {interest}"
    if opp.deadline:
        days = (opp.deadline - date.today()).days
        if days <= 30:
            return "Closing soon — apply before the deadline"
    return "Recommended based on your profile"


def _build_watchlist_item(student_id: int, student: StudentProfile, opp: Opportunity, db: Session) -> dict:
    today = date.today()
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
    days_left = (opp.deadline - today).days if opp.deadline else None
    readiness_data = calculate_readiness(student, opp, enrollments, today)

    journey = db.query(OpportunityJourney).filter(
        OpportunityJourney.student_id == student_id,
        OpportunityJourney.opportunity_id == opp.id,
    ).first()
    if not journey:
        initial_stage = readiness_data["suggested_stage"] if readiness_data["suggested_stage"] != "discovered" else "discovered"
        journey = OpportunityJourney(
            student_id=student_id,
            opportunity_id=opp.id,
            readiness_score=readiness_data["readiness_score"],
            stage=initial_stage,
        )
        db.add(journey)
        db.commit()
        db.refresh(journey)
    elif journey.readiness_score != readiness_data["readiness_score"]:
        journey.readiness_score = readiness_data["readiness_score"]
        journey.updated_at = datetime.utcnow()
        db.commit()

    return {
        "opportunity_id": opp.id,
        "title": opp.title,
        "category": opp.category,
        "direction": opp.direction,
        "deadline": opp.deadline.isoformat() if opp.deadline else None,
        "days_left": days_left,
        "apply_url": opp.apply_url,
        "source_url": opp.source_url,
        "effective_url": opp.apply_url or opp.source_url,
        "readiness_score": readiness_data["readiness_score"],
        "factor_scores": readiness_data["factor_scores"],
        "missing_steps": readiness_data["missing_steps"],
        "next_action": readiness_data["next_action"],
        "next_action_impact": readiness_data["next_action_impact"],
        "stage": journey.stage,
        "suggested_stage": readiness_data["suggested_stage"],
    }


@router.get("/mission/{student_id}")
def get_mission(student_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)
    return compute_mission(student_id, student, db)


@router.get("/recommendations/{student_id}")
def get_recommendations(student_id: int, limit: int = 5, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)

    saved_ids = {
        s.opportunity_id
        for s in db.query(SavedOpportunity).filter(SavedOpportunity.student_id == student_id).all()
    }

    today = date.today()
    all_opps = db.query(Opportunity).filter(Opportunity.deadline >= today).all()
    unsaved = [o for o in all_opps if o.id not in saved_ids]

    interests = [i.strip() for i in (student.interests or "").split(",") if i.strip()]
    grade = student.grade

    scored = []
    for opp in unsaved:
        score = _score_opportunity(opp, interests, grade)
        reason = _match_reason(opp, interests)
        days = (opp.deadline - today).days if opp.deadline else None
        scored.append((score, days if days is not None else 9999, opp, reason))

    scored.sort(key=lambda x: (-x[0], x[1]))

    return [
        {
            "id": opp.id,
            "title": opp.title,
            "category": opp.category,
            "direction": opp.direction,
            "deadline": opp.deadline.isoformat() if opp.deadline else None,
            "days_left": days if days != 9999 else None,
            "description": (opp.description or "")[:150],
            "source_url": opp.source_url,
            "match_reason": reason,
        }
        for score, days, opp, reason in scored[:limit]
    ]


@router.post("/track/{student_id}/{opportunity_id}")
def track_opportunity(student_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)

    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.student_id == student_id,
        SavedOpportunity.opportunity_id == opportunity_id,
    ).first()
    if not existing:
        db.add(SavedOpportunity(student_id=student_id, opportunity_id=opportunity_id))
        db.commit()

    return _build_watchlist_item(student_id, student, opp, db)


@router.get("/readiness/{student_id}/{opportunity_id}")
def get_readiness(student_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)

    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.student_id == student_id,
        SavedOpportunity.opportunity_id == opportunity_id,
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Opportunity not in watchlist")

    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
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

    return {**result, "stage": journey.stage, "opportunity_title": saved.opportunity.title}


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
        journey = OpportunityJourney(student_id=student_id, opportunity_id=opportunity_id)
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
        return {"success": False, "message": "Email is not set up on this server."}

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

        if command == "/today":
            d = compute_mission(pref.student_id, student, db)
            reply = format_coach_today(name, d["missions"], d["guardian_score"])
        elif command == "/deadlines":
            d = compute_mission(pref.student_id, student, db)
            reply = format_coach_deadlines(name, d["watchlist"])
        elif command == "/watchlist":
            d = compute_mission(pref.student_id, student, db)
            reply = format_coach_watchlist(name, d["watchlist"])
        elif command == "/score":
            d = compute_mission(pref.student_id, student, db)
            reply = format_coach_score(name, d["guardian_score"], d["risk_status"])
        elif command == "/courses":
            d = compute_mission(pref.student_id, student, db)
            reply = format_coach_courses(name, d["course_progress"], d["incomplete_lessons"])
        elif command == "/guardian":
            d = compute_mission(pref.student_id, student, db)
            reply = format_coach_guardian(name, d)
        elif command in ("/help", "/start"):
            reply = format_coach_help()
        else:
            reply = f"Unknown command: <code>{command}</code>\n\nSend /help to see what I can do."

        send_telegram_message(chat_id, reply)
        processed += 1

    return {"processed": processed, "configured": True}

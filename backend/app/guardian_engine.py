from datetime import date, datetime
from sqlalchemy.orm import Session

from .models import (
    StudentProfile, SavedOpportunity, Enrollment, LessonProgress,
    OpportunityJourney, NotificationPreference,
)
from .readiness_calculator import calculate_readiness, calculate_guardian_score
from .email_service import is_configured as email_configured
from .telegram_service import is_configured as telegram_configured


def _build_missions(watchlist: list, course_progress: list, incomplete_count: int) -> list:
    missions = []

    urgent = next((w for w in watchlist if w["days_left"] is not None and 0 <= w["days_left"] <= 3), None)
    if urgent:
        if urgent["days_left"] == 0:
            label = "Due today"
        elif urgent["days_left"] == 1:
            label = "Due tomorrow"
        else:
            label = f"{urgent['days_left']} days left"
        missions.append({
            "priority": "urgent",
            "icon": "🔴",
            "title": urgent["title"],
            "action": urgent["next_action"] or f"Submit your application — {label}",
            "badge": label.upper(),
            "link": "/opportunities",
        })

    active_course = next((c for c in course_progress if 0 < c["progress"] < 100), None)
    if active_course and len(missions) < 3:
        missions.append({
            "priority": "learning",
            "icon": "📖",
            "title": active_course["title"],
            "action": f"Continue learning — you're {active_course['progress']:.0f}% done",
            "badge": f"{active_course['progress']:.0f}% COMPLETE",
            "link": "/courses",
        })

    low_readiness = next((
        w for w in watchlist
        if w["readiness_score"] < 60
        and (w["days_left"] is None or w["days_left"] > 3)
        and w["next_action"]
    ), None)
    if low_readiness and len(missions) < 3:
        missions.append({
            "priority": "prepare",
            "icon": "⚡",
            "title": low_readiness["title"],
            "action": low_readiness["next_action"],
            "badge": f"{low_readiness['readiness_score']}% READY",
            "link": "/guardian",
        })

    if not missions and incomplete_count > 0:
        missions.append({
            "priority": "learning",
            "icon": "📚",
            "title": "Pending Lessons",
            "action": f"Complete {incomplete_count} lesson{'s' if incomplete_count > 1 else ''} in your active courses",
            "badge": f"{incomplete_count} PENDING",
            "link": "/courses",
        })

    if not missions:
        missions.append({
            "priority": "explore",
            "icon": "🌟",
            "title": "Explore New Opportunities",
            "action": "Find opportunities that match your interests and goals",
            "badge": "RECOMMENDED",
            "link": "/opportunities",
        })

    return missions[:3]


def compute_mission(student_id: int, student: StudentProfile, db: Session) -> dict:
    today = date.today()

    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.student_id == student_id
    ).all()

    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == student_id
    ).all()

    all_lesson_ids = [
        lesson.id
        for e in enrollments
        for lesson in (e.course.lessons if e.course else [])
    ]
    completed_lesson_ids = {
        lp.lesson_id
        for lp in db.query(LessonProgress).filter(
            LessonProgress.student_id == student_id,
            LessonProgress.completed == True,
        ).all()
    }

    risk_status = "safe"
    watchlist = []
    journey_updated = False

    for s in saved:
        opp = s.opportunity
        if not opp:
            continue

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
            journey_updated = True
        elif journey.readiness_score != readiness_data["readiness_score"]:
            journey.readiness_score = readiness_data["readiness_score"]
            if journey.stage == "discovered" and readiness_data["suggested_stage"] != "discovered":
                journey.stage = readiness_data["suggested_stage"]
            journey.updated_at = datetime.utcnow()
            journey_updated = True

        if days_left is not None and days_left >= 0:
            if days_left <= 1:
                risk_status = "risk"
            elif days_left <= 7 and risk_status == "safe":
                risk_status = "attention"

        watchlist.append({
            "opportunity_id": opp.id,
            "title": opp.title,
            "category": opp.category,
            "direction": opp.direction,
            "deadline": opp.deadline.isoformat() if opp.deadline else None,
            "days_left": days_left,
            "apply_url": opp.apply_url,
            "readiness_score": readiness_data["readiness_score"],
            "factor_scores": readiness_data["factor_scores"],
            "missing_steps": readiness_data["missing_steps"],
            "next_action": readiness_data["next_action"],
            "next_action_impact": readiness_data["next_action_impact"],
            "stage": journey.stage,
            "suggested_stage": readiness_data["suggested_stage"],
        })

    if journey_updated:
        db.commit()

    watchlist.sort(key=lambda x: x["days_left"] if x["days_left"] is not None else 9999)

    guardian_score = calculate_guardian_score(watchlist)

    course_progress = [
        {
            "id": e.course.id,
            "title": e.course.title,
            "progress": e.progress,
            "completed": e.completed,
        }
        for e in enrollments
        if e.course
    ]

    incomplete_count = len([lid for lid in all_lesson_ids if lid not in completed_lesson_ids])
    missions = _build_missions(watchlist, course_progress, incomplete_count)

    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.student_id == student_id
    ).first()

    return {
        "guardian_score": guardian_score,
        "risk_status": risk_status,
        "watchlist": watchlist,
        "course_progress": course_progress,
        "incomplete_lessons": incomplete_count,
        "missions": missions,
        "alert_status": {
            "email_active": bool(prefs and prefs.email_enabled),
            "telegram_active": bool(prefs and prefs.telegram_enabled and prefs.telegram_chat_id),
            "email_available": email_configured(),
            "telegram_available": telegram_configured(),
        },
        "generated_at": datetime.utcnow().isoformat(),
    }

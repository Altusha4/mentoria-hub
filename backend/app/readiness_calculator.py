from datetime import date
from typing import Optional


STAGE_THRESHOLDS = [
    ("applied", 95),
    ("ready", 80),
    ("preparing", 50),
    ("exploring", 25),
    ("discovered", 0),
]


def _tags_set(raw: Optional[str]) -> set:
    if not raw:
        return set()
    return {t.strip().lower() for t in raw.split(",") if t.strip()}


def _parse_grade_level(grade_level: str) -> set:
    grades = set()
    if not grade_level:
        return grades
    for part in grade_level.split(","):
        part = part.strip()
        if "-" in part:
            try:
                lo, hi = part.split("-")
                grades.update(range(int(lo.strip()), int(hi.strip()) + 1))
            except ValueError:
                pass
        else:
            try:
                grades.add(int(part))
            except ValueError:
                pass
    return grades


def calculate_readiness(student, opportunity, enrollments, today: Optional[date] = None) -> dict:
    if today is None:
        today = date.today()

    missing_steps = []

    student_interests = _tags_set(student.interests)
    student_goals = _tags_set(student.goals)
    opp_tags = _tags_set(opportunity.tags)
    opp_direction = (opportunity.direction or "").strip().lower()

    profile_score = 0

    if student.grade and opportunity.grade_level:
        allowed = _parse_grade_level(opportunity.grade_level)
        if student.grade in allowed:
            profile_score += 50
        else:
            missing_steps.append(f"Grade requirement: {opportunity.grade_level}")
    else:
        profile_score += 30

    direction_match = bool(opp_direction and opp_direction in student_interests)
    tag_overlap = len((student_interests | student_goals) & opp_tags)

    if direction_match:
        profile_score += 50
    elif tag_overlap > 0:
        profile_score += min(50, tag_overlap * 15)
    else:
        if opp_direction:
            missing_steps.append(f"Add '{opportunity.direction}' to your profile interests")

    profile_score = min(100, profile_score)

    if opportunity.deadline:
        days_left = (opportunity.deadline - today).days
        if days_left < 0:
            deadline_score = 0
            missing_steps.insert(0, "This opportunity has passed its deadline")
        elif days_left == 0:
            deadline_score = 5
            missing_steps.insert(0, "Deadline is today — apply immediately")
        elif days_left == 1:
            deadline_score = 15
            missing_steps.insert(0, "Only 1 day left — apply today")
        elif days_left <= 3:
            deadline_score = 30
            missing_steps.insert(0, f"Only {days_left} days left — act now")
        elif days_left <= 7:
            deadline_score = 55
        elif days_left <= 14:
            deadline_score = 72
        elif days_left <= 30:
            deadline_score = 85
        else:
            deadline_score = 100
    else:
        days_left = None
        deadline_score = 70

    relevant_enrollments = []
    for enr in enrollments:
        course = enr.course
        if not course:
            continue
        course_tags = _tags_set(course.tags)
        course_lower = course.title.lower()
        if (
            (opp_direction and opp_direction in course_lower)
            or (opp_direction and opp_direction in course_tags)
            or bool(opp_tags & course_tags)
        ):
            relevant_enrollments.append(enr)

    if relevant_enrollments:
        avg_progress = sum(e.progress for e in relevant_enrollments) / len(relevant_enrollments)
        course_score = avg_progress
        incomplete = [e for e in relevant_enrollments if e.progress < 100]
        if incomplete and avg_progress < 80:
            missing_steps.append(f"Complete '{incomplete[0].course.title}' ({incomplete[0].progress:.0f}% done)")
    else:
        course_score = 50

    completeness = 0
    if student.motivation_letter:
        completeness += 35
    else:
        missing_steps.append("Write your motivation letter")
    if student.bio:
        completeness += 20
    else:
        missing_steps.append("Add a bio to your profile")
    if student.gpa:
        completeness += 20
    if student.activities:
        completeness += 15
    if student.skills:
        completeness += 10

    readiness = round(min(100, max(0,
        profile_score * 0.25
        + deadline_score * 0.25
        + course_score * 0.25
        + completeness * 0.25
    )))

    suggested_stage = "discovered"
    for stage, threshold in STAGE_THRESHOLDS:
        if readiness >= threshold:
            suggested_stage = stage
            break

    next_action = None
    next_action_impact = 0

    if not student.motivation_letter:
        next_action = "Write your motivation letter"
        next_action_impact = round(35 * 0.25)
    elif relevant_enrollments:
        incomplete = [e for e in relevant_enrollments if e.progress < 100]
        if incomplete:
            remaining = 100 - incomplete[0].progress
            next_action = f"Continue '{incomplete[0].course.title}'"
            next_action_impact = round(remaining * 0.25)
    elif not student.bio:
        next_action = "Add a bio to your profile"
        next_action_impact = round(20 * 0.25)
    elif missing_steps:
        next_action = missing_steps[0]
        next_action_impact = 5

    return {
        "readiness_score": readiness,
        "factor_scores": {
            "profile_match": round(profile_score),
            "deadline_safety": round(deadline_score),
            "course_progress": round(course_score),
            "profile_completeness": round(completeness),
        },
        "missing_steps": [s for s in missing_steps if s][:5],
        "next_action": next_action,
        "next_action_impact": next_action_impact,
        "suggested_stage": suggested_stage,
    }


def calculate_guardian_score(watchlist_items: list) -> int:
    if not watchlist_items:
        return 50

    total_weight = 0
    weighted_sum = 0.0

    for item in watchlist_items:
        days_left = item.get("days_left")
        if days_left is not None and days_left < 0:
            continue
        if days_left is None:
            weight = 1
        elif days_left <= 7:
            weight = 3
        elif days_left <= 30:
            weight = 2
        else:
            weight = 1

        weighted_sum += item["readiness_score"] * weight
        total_weight += weight

    if total_weight == 0:
        scores = [item["readiness_score"] for item in watchlist_items]
        return round(sum(scores) / len(scores)) if scores else 50

    return round(weighted_sum / total_weight)

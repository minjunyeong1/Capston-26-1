from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import FocusLog, InterventionLog, StudySession


def _ensure_aware(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def calculate_study_minutes(session: StudySession) -> int:
    """세션 시작/종료 시각으로 실제 학습 시간을 분 단위로 계산합니다."""
    start_time = _ensure_aware(session.start_time)
    end_time = _ensure_aware(session.end_time) or datetime.now(timezone.utc)
    if not start_time or end_time <= start_time:
        return 0
    return int((end_time - start_time).total_seconds() // 60)


def calculate_focus_percentage(db: Session, session_id: str) -> int:
    """FocusLog 중 focus 비율을 집중도로 계산합니다."""
    logs = db.query(FocusLog).filter(FocusLog.session_id == session_id).all()
    if not logs:
        return 0

    focus_count = sum(1 for log in logs if log.event_type == "focus")
    return round((focus_count / len(logs)) * 100)


def build_session_result(db: Session, session: StudySession) -> dict:
    focus_percentage = calculate_focus_percentage(db, session.session_id)
    intervention_count = db.query(InterventionLog).filter(
        InterventionLog.session_id == session.session_id
    ).count()
    return {
        "session_id": session.session_id,
        "status": session.status,
        "study_minutes": calculate_study_minutes(session),
        "focus_percentage": focus_percentage,
        "intervention_count": intervention_count,
        "achievement": session.achievement or "",
        "memo": session.memo or "",
    }


def build_dashboard(db: Session, user_id: str) -> dict:
    sessions = db.query(StudySession).filter(StudySession.user_id == user_id).all()
    session_ids = [session.session_id for session in sessions]

    logs_by_session: dict[str, list[FocusLog]] = defaultdict(list)
    intervention_counts_by_session: dict[str, int] = defaultdict(int)
    if session_ids:
        logs = db.query(FocusLog).filter(FocusLog.session_id.in_(session_ids)).all()
        for log in logs:
            logs_by_session[log.session_id].append(log)

        intervention_logs = db.query(InterventionLog).filter(
            InterventionLog.session_id.in_(session_ids)
        ).all()
        for intervention_log in intervention_logs:
            intervention_counts_by_session[intervention_log.session_id] += 1

    total_focus_count = 0
    total_log_count = 0
    total_intervention_count = 0
    daily_stats: dict[str, dict[str, int]] = defaultdict(
        lambda: {"study_minutes": 0, "focus_count": 0, "log_count": 0, "intervention_count": 0}
    )

    for session in sessions:
        session_date = (_ensure_aware(session.start_time) or datetime.now(timezone.utc)).date().isoformat()
        session_logs = logs_by_session[session.session_id]
        focus_count = sum(1 for log in session_logs if log.event_type == "focus")
        log_count = len(session_logs)

        daily_stats[session_date]["study_minutes"] += calculate_study_minutes(session)
        daily_stats[session_date]["focus_count"] += focus_count
        daily_stats[session_date]["log_count"] += log_count
        daily_stats[session_date]["intervention_count"] += intervention_counts_by_session[session.session_id]

        total_focus_count += focus_count
        total_log_count += log_count
        total_intervention_count += intervention_counts_by_session[session.session_id]

    dash_progress = []
    for date, stats in sorted(daily_stats.items()):
        log_count = stats["log_count"]
        daily_focus_percentage = round((stats["focus_count"] / log_count) * 100) if log_count else 0
        dash_progress.append(
            {
                "date": date,
                "study_minutes": stats["study_minutes"],
                "daily_focus_percentage": daily_focus_percentage,
                "intervention_count": stats["intervention_count"],
            }
        )

    dash_total_focus_percentage = round((total_focus_count / total_log_count) * 100) if total_log_count else 0
    return {
        "user_id": user_id,
        "dash_total_focus_percentage": dash_total_focus_percentage,
        "dash_total_intervention_count": total_intervention_count,
        "dash_progress": dash_progress,
    }

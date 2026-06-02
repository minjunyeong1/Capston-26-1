# app/services/router_logic.py

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import StudySession, FocusLog, InterventionLog
from app.core.config import VIDEO_POOL
from app.schemas import EventResponse
from fastapi import HTTPException, status

DEFAULT_IDLE_VIDEO_ID = "IDLE_LOOP"

SECOND_OR_LATER_VIDEO_IDS = {
    "MATH": {
        "looking_away": [
            "MATH_LOOKING_AWAY_01",
            "MATH_LOOKING_AWAY_02",
            "MATH_LOOKING_AWAY_03",
            "MATH_LOOKING_AWAY_04",
            "MATH_LOOKING_AWAY_05",
        ],
        "sleep": [
            "MATH_SLEEP_01",
            "MATH_SLEEP_02",
            "MATH_SLEEP_03",
            "MATH_SLEEP_04",
        ],
    },
    "THINK": {
        "looking_away": [
            "THINK_LOOKING_AWAY_01",
            "THINK_LOOKING_AWAY_02",
            "THINK_LOOKING_AWAY_03",
            "THINK_LOOKING_AWAY_04",
            "THINK_LOOKING_AWAY_05",
            "THINK_LOOKING_AWAY_06",
            "THINK_LOOKING_AWAY_07",
            "THINK_LOOKING_AWAY_08",
        ],
        "sleep": [
            "THINK_SLEEP_01",
            "THINK_SLEEP_02",
            "THINK_SLEEP_03",
        ],
    },
    "MEM": {
        "looking_away": [
            "MEM_LOOKING_AWAY_01",
            "MEM_LOOKING_AWAY_02",
            "MEM_LOOKING_AWAY_03",
            "MEM_LOOKING_AWAY_04",
            "MEM_LOOKING_AWAY_05",
            "MEM_LOOKING_AWAY_06",
            "MEM_LOOKING_AWAY_07",
        ],
        "sleep": [
            "MEM_SLEEP_01",
            "MEM_SLEEP_02",
            "MEM_SLEEP_03",
            "MEM_SLEEP_04",
        ],
    },
    "LANG": {
        "looking_away": [
            "LANG_LOOKING_AWAY_01",
            "LANG_LOOKING_AWAY_02",
            "LANG_LOOKING_AWAY_03",
            "LANG_LOOKING_AWAY_04",
            "LANG_LOOKING_AWAY_05",
            "LANG_LOOKING_AWAY_06",
            "LANG_LOOKING_AWAY_07",
            "LANG_LOOKING_AWAY_08",
        ],
        "sleep": [
            "LANG_SLEEP_01",
            "LANG_SLEEP_02",
            "LANG_SLEEP_03",
            "LANG_SLEEP_04",
        ],
    },
}


def select_intervention_video_id(subject: str, event_type: str, cumulative_count: int) -> str:
    """누적 감지 횟수, 과목, 이벤트 타입에 맞는 개입 영상 ID를 고릅니다."""
    if cumulative_count <= 0:
        return DEFAULT_IDLE_VIDEO_ID

    subject_routes = SECOND_OR_LATER_VIDEO_IDS.get(subject, SECOND_OR_LATER_VIDEO_IDS["MEM"])
    candidate_video_ids = subject_routes.get(event_type)
    if not candidate_video_ids:
        return SECOND_OR_LATER_VIDEO_IDS["MEM"]["looking_away"][0]

    # 2회차는 첫 번째 맞춤 영상부터 시작하고, 이후에는 같은 풀 안에서 순환합니다.
    video_index = (cumulative_count - 1) % len(candidate_video_ids)
    return candidate_video_ids[video_index]


def process_vision_event(db: Session, session_id: str, event_type: str, confidence_score: float = 0.9):
    """
    프론트엔드에서 넘어온 유저 상태를 DB에 기록하고, 
    상황에 맞는 AI 코치 개입 영상을 라우팅합니다.
    """
    
    # 1. 세션 존재 여부 및 현재 공부 중인 과목(subject) 확인
    session = db.query(StudySession).filter(StudySession.session_id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 스터디 세션입니다. 세션 ID를 확인해주세요."
        )
    
    current_subject = session.subject # 예: "MATH", "LANG"

    # 2. 모든 이벤트(focus 포함)는 무조건 FocusLog(CCTV)에 원시 데이터로 기록
    new_focus_log = FocusLog(
        session_id=session_id,
        event_type=event_type,
        confidence_score=confidence_score
    )
    db.add(new_focus_log)
    db.commit()

    # 3. 만약 '집중(focus)' 상태라면? -> 혼낼 필요 없으므로 대기 영상 유지
    if event_type == "focus":
        return EventResponse(
            status="success", 
            action="keep_focus", 
            routed_video=VIDEO_POOL[DEFAULT_IDLE_VIDEO_ID]
        )

    # 4. 딴짓(smartphone, drowsy 등) 감지 시: 해당 위반의 '누적 횟수' 조회
    # (과거에 이 세션에서 똑같은 이유로 몇 번 경고를 받았는지 DB에서 센다)
    # 15분 유효 윈도우 적용

    time_window_limit = datetime.now(timezone.utc) - timedelta(minutes=15)
    recent_warnings_count = db.query(InterventionLog).filter(
        InterventionLog.session_id == session_id,
        InterventionLog.trigger_event == event_type,
        InterventionLog.created_at >= time_window_limit
    ).count()
    
    current_count = recent_warnings_count + 1 # 이번이 몇 번째인지 계산
    # 5. [핵심 라우팅 알고리즘] 누적 횟수 & 과목 기반 분기 처리
    selected_video_id = select_intervention_video_id(
        subject=current_subject,
        event_type=event_type,
        cumulative_count=current_count,
    )

    # 6. 결정된 개입(Intervention) 내역을 DB에 저장 (경고장 발부 기록)
    new_intervention = InterventionLog(
        session_id=session_id,
        trigger_event=event_type,
        cumulative_count=current_count,
        played_video_id=selected_video_id
    )
    db.add(new_intervention)
    db.commit() # 실제 DB에 반영!

    # 7. 프론트엔드로 쏴줄 최종 결과 반환
    return EventResponse(
        status="success",
        action="intervention",
        routed_video=VIDEO_POOL[selected_video_id]
    )

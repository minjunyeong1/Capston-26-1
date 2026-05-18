# app/services/router_logic.py

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import StudySession, FocusLog, InterventionLog
from app.core.config import VIDEO_POOL
from app.schemas import EventResponse
from fastapi import HTTPException, status

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
            video_url=VIDEO_POOL["IDLE_LOOP"]
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
    selected_video_id = ""

    # 5. [핵심 라우팅 알고리즘] 누적 횟수 & 과목 기반 분기 처리
    if current_count == 1:
        # 1회차: 과목 상관없이 가벼운 헛기침
        selected_video_id = "ALERT_COUGH"
    ###########################################################
    #                   핵심 라우팅 로직                        #
    ###########################################################
    elif current_count >= 2:
        # 2회차 이상: 위반 종류와 과목에 맞춘 팩폭 영상
        if event_type == "looking_away":
            if current_subject == "MATH": selected_video_id = "look_2_MATH"
            elif current_subject == "THINK": selected_video_id = "look_2_THINK"
            elif current_subject == "MEM": selected_video_id = ""
            else: selected_video_id = "look_2_MEMO"
            
        elif event_type == "sleep":
            if current_subject == "ENG": selected_video_id = "DR_2_ENG"
            elif current_subject == "MATH": selected_video_id = "DR_2_MATH"
            else: selected_video_id = "DR_2_MEMO"
        
        # 자리 이탈 등 다른 케이스에 대한 기본값 폴백(Fallback)
        else:
            selected_video_id = "ALERT_COUGH"

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
        video_url=VIDEO_POOL[selected_video_id]
    )
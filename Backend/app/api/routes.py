from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from collections import Counter
import uuid

# 우리가 만든 모듈들 불러오기
from app.database import get_db
from app.models import StudySession, User, InterventionLog
from app.schemas import (
    EventPayload,
    EventResponse,
    LoginRequest,
    LoginResponse,
    DashboardItem,
    SessionEndResponse,
    SessionResultResponse,
    SessionResultSaveRequest,
    SessionStartRequest,
    SessionStartResponse,
)
from app.services.router_logic import process_vision_event
from app.services.stats_logic import build_dashboard, build_session_result, calculate_focus_percentage

# API 라우터 객체 생성 (이게 바로 접수 창구입니다)
router = APIRouter()

# ==========================================
# 0. 시연용 간단 로그인 API
# ==========================================
@router.post("/auth/login", response_model=LoginResponse)
@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """닉네임만으로 유저를 찾거나 생성합니다. 캡스톤 시연용 간단 로그인입니다."""
    username = request.username.strip()
    if not username:
        username = "guest"

    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)

    return LoginResponse(user_id=user.id, username=user.username)


# ==========================================
# 1. 스터디 세션 시작 API (프론트엔드에서 스터디 시작 버튼 누를 때 호출)
# ==========================================
@router.post("/sessions", response_model=SessionStartResponse)
def start_session(request: SessionStartRequest, db: Session = Depends(get_db)):
    """새로운 스터디 세션을 생성하고 DB에 저장합니다."""
    
    # 1. 고유 세션 ID 생성
    new_session_id = str(uuid.uuid4())
    user_id = request.user_id or "guest"
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, username=user_id)
        db.add(user)
        db.flush()

    # 2. DB 테이블(StudySession)에 새 세션 기록
    new_session = StudySession(
        session_id=new_session_id,
        user_id=user_id,
        subject=request.subject,
        target_duration_minutes=request.target_minutes
    )
    db.add(new_session)
    db.commit()
    
    # 3. 프론트엔드에 응답 반환
    return SessionStartResponse(session_id=new_session_id, status="active", message="스터디 세션이 성공적으로 생성되었습니다.")


# ==========================================
# 2. 실시간 비집중 이벤트 감지 API
# ==========================================
@router.post("/sessions/{session_id}/event", response_model=EventResponse)
def handle_vision_event(session_id: str, payload: EventPayload, db: Session = Depends(get_db)):
    """프론트엔드 비전 AI가 감지한 유저 상태를 받아 개입 영상을 라우팅합니다."""
    
    # 1. 스키마(EventPayload)를 무사히 통과한 깨끗한 데이터만 들어옵니다.
    # 2. 핵심 로직(router_logic.py)으로 데이터를 넘겨서 결과를 받아옵니다.
    result = process_vision_event(
        db=db,
        session_id=session_id,
        event_type=payload.event_type,
        # 프론트에서 신뢰도를 안 보내면 기본값 0.9 사용
        confidence_score=getattr(payload, 'confidence_score', 0.9) 
    )
    
    # 3. 결과 반환 (이 결과는 EventResponse 스키마 규격을 100% 만족함)
    return result

# ==========================================
# 3. 스터디 세션 종료 API
# ==========================================
@router.patch("/sessions/{session_id}/end", response_model=SessionEndResponse)
def end_session(session_id: str, db: Session = Depends(get_db)):
    """진행 중인 스터디 세션을 종료 상태로 변경합니다."""
    session = db.query(StudySession).filter(StudySession.session_id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 스터디 세션입니다."
        )

    if session.status != "closed":
        session.status = "closed"
        session.end_time = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)

    focus_score = calculate_focus_percentage(db, session_id)

    start_time = session.start_time.replace(tzinfo=timezone.utc) if session.start_time else None
    end_time = session.end_time.replace(tzinfo=timezone.utc) if session.end_time.tzinfo is None else session.end_time
    total_seconds = int((end_time - start_time).total_seconds()) if end_time > start_time else 0

    intervention_logs = db.query(InterventionLog).filter(InterventionLog.session_id == session_id).all()

    event_counts = Counter(log.trigger_event for log in intervention_logs)

    event_name_map = {
        "looking_away": "자리이탈/딴곳응시",
        "sleep": "졸음",
    }

    distractions = []
    for event_type, count in event_counts.items():
        korean_subject = event_name_map.get(event_type, event_type)
        distractions.append(DistractionStat(subject=korean_subject, count=count))

    return SessionEndResponse(
        session_id=session_id,
        status="closed",
        total_studied_seconds=total_seconds,
        focus_score=focus_score,
        distraction_stats=distractions
    )


# ==========================================
# 4. 세션 결과 저장 및 조회 API
# ==========================================
@router.post("/sessions/{session_id}/result", response_model=SessionResultResponse)
def save_session_result(
    session_id: str,
    request: SessionResultSaveRequest,
    db: Session = Depends(get_db),
):
    """세션 종료 후 사용자가 작성한 회고와 계산된 집중도 결과를 저장합니다."""
    session = db.query(StudySession).filter(StudySession.session_id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 스터디 세션입니다."
        )

    if session.status != "closed":
        session.status = "closed"
        session.end_time = datetime.now(timezone.utc)

    session.achievement = request.achievement
    session.memo = request.memo
    session.focus_percentage = calculate_focus_percentage(db, session_id)
    db.commit()
    db.refresh(session)

    return SessionResultResponse(**build_session_result(db, session))


@router.get("/sessions/{session_id}/result", response_model=SessionResultResponse)
def get_session_result(session_id: str, db: Session = Depends(get_db)):
    """저장된 세션 결과와 현재 로그 기준 집중도 결과를 조회합니다."""
    session = db.query(StudySession).filter(StudySession.session_id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 스터디 세션입니다."
        )

    return SessionResultResponse(**build_session_result(db, session))


# ==========================================
# 5. 대시보드 통계 조회 API
# ==========================================
@router.get("/dashboard/{user_id}", response_model=DashboardItem)
def get_dashboard(user_id: str, db: Session = Depends(get_db)):
    """유저의 일별 학습 시간과 집중도 추이를 조회합니다."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 유저입니다."
        )

    return DashboardItem(**build_dashboard(db, user_id))


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

# 우리가 만든 모듈들 불러오기
from app.database import get_db
from app.models import StudySession, User
from app.schemas import (
    EventPayload,
    EventResponse,
    LoginRequest,
    LoginResponse,
    SessionEndResponse,
    SessionStartRequest,
    SessionStartResponse,
)
from app.services.router_logic import process_vision_event

# API 라우터 객체 생성 (이게 바로 접수 창구입니다)
router = APIRouter()

# ==========================================
# 0. 시연용 간단 로그인 API
# ==========================================
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
@router.post("/sessions/start", response_model=SessionStartResponse)
def start_session(request: SessionStartRequest, db: Session = Depends(get_db)):
    """새로운 스터디 세션을 생성하고 DB에 저장합니다."""
    
    # 1. 고유 세션 ID 생성
    new_session_id = str(uuid.uuid4())
    user_id = request.user_id or "guest"
    target_duration_minutes = request.target_minutes or request.target_duration_minutes

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
        target_duration_minutes=target_duration_minutes
    )
    db.add(new_session)
    db.commit()
    
    # 3. 프론트엔드에 응답 반환
    return SessionStartResponse(session_id=new_session_id, status="active")


# ==========================================
# 2. 스터디 세션 종료 API
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

    if session.status == "closed":
        return SessionEndResponse(
            session_id=session_id,
            status="closed",
            message="이미 종료된 세션입니다."
        )

    session.status = "closed"
    session.end_time = datetime.now(timezone.utc)
    db.commit()

    return SessionEndResponse(
        session_id=session_id,
        status="closed",
        message="스터디 세션이 종료되었습니다."
    )


# ==========================================
# 3. 비전 AI 이벤트 수신 API (5~10초마다 계속 호출됨)
# ==========================================
@router.post("/events", response_model=EventResponse)
def handle_vision_event(payload: EventPayload, db: Session = Depends(get_db)):
    """프론트엔드 비전 AI가 감지한 유저 상태를 받아 개입 영상을 라우팅합니다."""
    
    # 1. 스키마(EventPayload)를 무사히 통과한 깨끗한 데이터만 들어옵니다.
    # 2. 핵심 로직(router_logic.py)으로 데이터를 넘겨서 결과를 받아옵니다.
    result = process_vision_event(
        db=db,
        session_id=payload.session_id,
        event_type=payload.event_type,
        # 프론트에서 신뢰도를 안 보내면 기본값 0.9 사용
        confidence_score=getattr(payload, 'confidence_score', 0.9) 
    )
    
    # 3. 결과 반환 (이 결과는 EventResponse 스키마 규격을 100% 만족함)
    return result

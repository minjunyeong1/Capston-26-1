from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from collections import Counter
import uuid

# 우리가 만든 모듈들 불러오기
from app.database import get_db
from app.models import StudySession, User, InterventionLog, Schedule, FocusLog
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
    SignupRequest,
    SignupResponse,
    ProfileResponse,
    ProfileUpdateRequest,
    PasswordUpdateRequest,
    ScheduleCreateRequest,
    ScheduleItem,
    MonitorStatusBatchRequest
)
from app.services.router_logic import process_vision_event
from app.services.stats_logic import build_dashboard, build_session_result, calculate_focus_percentage

# API 라우터 객체 생성 (이게 바로 접수 창구입니다)
router = APIRouter()

# ==========================================
# 0. 시연용 간단 로그인 API % 마이페이지 관리
# ==========================================
@router.post("/auth/login", response_model=LoginResponse)
@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """명세서 기반 로그인: 아이디(이메일 또는 닉네임)와 비밀번호를 확인합니다."""
    # 1. username 필드로 들어온 값이 이메일인지 닉네임인지 모두 검사
    user = db.query(User).filter(
        (User.email == request.username) | (User.username == request.username)
    ).first()

    # 2. 유저가 없거나 비밀번호가 틀리면 에러
    if not user or user.password != request.password:
        # 시연 중 막히지 않도록, 만약 DB에 아예 없는 유저면 임시로 통과시켜주는 방어 로직 (선택사항)
        if not user and request.username == "test": 
            return LoginResponse(user_id="test_user_123", username="test", token="dummy-token")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="아이디 또는 비밀번호가 일치하지 않습니다.")

    return LoginResponse(
        user_id=user.id, 
        username=user.username, 
        token=f"demo-token-{user.id}" # 명세서의 token 필드 지원
    )

@router.get("/users/{user_id}/profile", response_model=ProfileResponse)
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")
    return ProfileResponse(
        user_id=user.id,
        email=user.email,
        username=user.username,
        profile_image_url=None  # 시연용이므로 프로필 이미지 URL은 None으로 반환
    )

@router.put("/users/{user_id}/profile", response_model=ProfileResponse)
def update_user_profile(user_id: str, request: ProfileUpdateRequest, db: Session = Depends(get_db)):
    """마이페이지 프로필(닉네임, 이미지) 수정"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="유저를 찾을 수 없습니다.")
    
    user.username = request.username
    if request.profile_image_url is not None:
        user.profile_image_url = request.profile_image_url
        
    db.commit()
    db.refresh(user)
    
    return ProfileResponse(
        user_id=user.id, email=user.email, username=user.username, profile_image_url=user.profile_image_url
    )


@router.put("/users/{user_id}/password")
def update_password(user_id: str, request: PasswordUpdateRequest, db: Session = Depends(get_db)):
    """마이페이지 비밀번호 변경"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="유저를 찾을 수 없습니다.")
        
    if user.password != request.current_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="현재 비밀번호가 일치하지 않습니다.")
        
    user.password = request.new_password
    db.commit()
    
    return {"message": "비밀번호 변경 성공"}

@router.post("/auth/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """새로운 유저를 생성합니다."""

    existing_user = db.query(User).filter((User.email == request.email) | (User.username == request.username)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 이메일입니다."
        )

    new_user = User(
        email=request.email,
        password=request.password,  # 시연용이므로 평문 저장 실제로는 해싱된 비밀번호를 저장해야 합니다.
        username=request.username
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return SignupResponse(user_id=new_user.id, username=new_user.username)




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
        target_duration_minutes=request.target_minutes,
        is_phone_allowed=request.is_phone_allowed,
        is_book_allowed=request.is_book_allowed
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


@router.post("/sessions/{session_id}/status", status_code=status.HTTP_204_NO_CONTENT)
def process_status_batch(session_id: str, request: MonitorStatusBatchRequest, db: Session = Depends(get_db)):
    """프론트엔드가 10~30초간 모아서 보낸 실시간 상태 로그 배열을 한 번에 DB에 밀어 넣습니다."""
    session = db.query(StudySession).filter(StudySession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="존재하지 않는 스터디 세션입니다.")

    # 1. 뭉탱이(배치)로 들어온 로그들을 DB 추가 대기열에 올립니다.
    for log in request.logs:
        new_log = FocusLog(
            session_id=session_id,
            event_type=log.status,
            start_time=log.timestamp,
            confidence_score=log.confidence_score
        )
        db.add(new_log)
    
    # 2. [가장 중요] 반복문이 다 끝나고 나서 딱 한 번만 DB에 커밋(저장)합니다!
    # 이 한 줄 덕분에 서버 부하가 획기적으로 줄어듭니다.
    db.commit()

    # 3. 긴급한 개입(팩폭 영상)은 /event API가 담당하므로, 
    # 여기서는 데이터가 잘 저장되었다는 가벼운 응답만 넘겨줍니다.
    return


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


# ==========================================
# 6. 캘린더 개인 일정 관리 API (Schedules)
# ==========================================

@router.get("/users/{user_id}/schedules", response_model=list[ScheduleItem])
def get_user_schedules(user_id: str, year_month: str = None, db: Session = Depends(get_db)):
    """달력 - 월별/전체 개인 일정 조회"""
    query = db.query(Schedule).filter(Schedule.user_id == user_id)
    
    # 프론트엔드에서 특정 월(예: "2026-05")만 요청했다면 필터링
    if year_month:
        query = query.filter(Schedule.start_date.startswith(year_month))
        
    schedules = query.all()
    
    # DB 스네이크 케이스 -> 프론트엔드 카멜 케이스 매핑
    result = []
    for s in schedules:
        result.append(ScheduleItem(
            id=s.id,
            title=s.title,
            isAllDay=s.is_all_day,
            startDate=s.start_date,
            endDate=s.end_date,
            startTime=s.start_time,
            endTime=s.end_time,
            repeatType=s.repeat_type,
            repeatInterval=s.repeat_interval,
            color=s.color
        ))
    return result


@router.post("/users/{user_id}/schedules", response_model=ScheduleItem, status_code=201)
def create_schedule(user_id: str, request: ScheduleCreateRequest, db: Session = Depends(get_db)):
    """달력 - 새 개인 일정 추가"""
    # 프론트엔드 카멜 케이스 -> DB 스네이크 케이스 매핑 저장
    new_schedule = Schedule(
        user_id=user_id,
        title=request.title,
        is_all_day=request.isAllDay,
        start_date=request.startDate,
        end_date=request.endDate,
        start_time=request.startTime,
        end_time=request.endTime,
        repeat_type=request.repeatType,
        repeat_interval=request.repeatInterval,
        color=request.color
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    
    return ScheduleItem(
        id=new_schedule.id,
        title=new_schedule.title,
        isAllDay=new_schedule.is_all_day,
        startDate=new_schedule.start_date,
        endDate=new_schedule.end_date,
        startTime=new_schedule.start_time,
        endTime=new_schedule.end_time,
        repeatType=new_schedule.repeat_type,
        repeatInterval=new_schedule.repeat_interval,
        color=new_schedule.color
    )


@router.put("/schedules/{schedule_id}", response_model=ScheduleItem)
def update_schedule(schedule_id: str, request: ScheduleCreateRequest, db: Session = Depends(get_db)):
    """달력 - 개인 일정 수정"""
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")
        
    schedule.title = request.title
    schedule.is_all_day = request.isAllDay
    schedule.start_date = request.startDate
    schedule.end_date = request.endDate
    schedule.start_time = request.startTime
    schedule.end_time = request.endTime
    schedule.repeat_type = request.repeatType
    schedule.repeat_interval = request.repeatInterval
    schedule.color = request.color
    
    db.commit()
    db.refresh(schedule)
    
    return ScheduleItem(
        id=schedule.id,
        title=schedule.title,
        isAllDay=schedule.is_all_day,
        startDate=schedule.start_date,
        endDate=schedule.end_date,
        startTime=schedule.start_time,
        endTime=schedule.end_time,
        repeatType=schedule.repeat_type,
        repeatInterval=schedule.repeat_interval,
        color=schedule.color
    )


@router.delete("/schedules/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: str, db: Session = Depends(get_db)):
    """달력 - 개인 일정 삭제"""
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")
        
    db.delete(schedule)
    db.commit()
    return # 204 No Content는 본문 없이 리턴
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    profile_image_url = Column(String, nullable=True) # 향후 프로필 이미지 저장용 (현재는 사용 안 함)
    
    username = Column(String, nullable=False)

    # 이미지/비디오 경로 대신, 라우팅 시 참고할 코치의 '성향'만 저장합니다.
    coach_persona = Column(String, default='strict') 

class StudySession(Base):
    __tablename__ = 'study_sessions'
    session_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)

    subject = Column(String, default='MATH', nullable=False) 

    target_duration_minutes = Column(Integer, nullable=False)

    is_phone_allowed = Column(Boolean, nullable=False)
    is_book_allowed = Column(Boolean, nullable=False)

    status = Column(String, default='active') 
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)
    focus_percentage = Column(Integer, nullable=True)
    achievement = Column(Text, nullable=True)
    memo = Column(Text, nullable=True)

class FocusLog(Base):
    __tablename__ = 'focus_logs'
    log_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey('study_sessions.session_id', ondelete="CASCADE"), nullable=False)
    
    # 비집중 유형 (looking_away, sleep, focusw 등)
    event_type = Column(String, nullable=False) 
    confidence_score = Column(Float, nullable=True) # 하람님이 보내주시는 비전 AI 신뢰도
    
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)

class InterventionLog(Base):
    __tablename__ = 'intervention_logs'
    log_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey('study_sessions.session_id', ondelete="CASCADE"), nullable=False)
    
    trigger_event = Column(String, nullable=False) # 원인이 된 이벤트 (예: looking_away)
    cumulative_count = Column(Integer, nullable=False) # 이 세션에서 몇 번째 걸린 건지 (1회차/2회차)
    
    played_video_id = Column(String, nullable=False) # 예: 'ALERT_COUGH', 'SM_2_MATH'
    
    intervention_success = Column(Boolean, nullable=True) # 개입 후 다시 집중 상태로 돌아왔는지 여부
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Schedule(Base):
    __tablename__ = 'schedules'
    id = Column(String, primary_key=True, default=lambda: f"sched_{uuid.uuid4().hex[:8]}")
    user_id = Column(String, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False)
    is_all_day = Column(Boolean, default=False)
    
    # 날짜 및 시간 (프론트엔드 포맷 YYYY-MM-DD / HH:MM 형태를 쉽게 담기 위해 String 사용)
    start_date = Column(String, nullable=False) 
    end_date = Column(String, nullable=False)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    
    repeat_type = Column(String, default="none") # none, day, week, month, year
    repeat_interval = Column(Integer, default=1)
    color = Column(String, nullable=True) # 예: "#2196f3"
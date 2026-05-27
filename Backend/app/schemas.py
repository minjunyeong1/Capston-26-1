from pydantic import BaseModel, Field
from typing import Literal
from typing import Optional
from typing import List

# ==========================================
# 1. 스터디 세션 시작 (Session Start) 관련 스키마
# ==========================================
class SessionStartRequest(BaseModel):
    """스터디 시작 시 프론트엔드에서 보내는 요청 데이터"""
    user_id: Optional[str] = Field(
        default=None,
        description="유저 ID. 인증 기능이 붙기 전에는 생략하면 guest 유저로 처리합니다."
    )

    subject: Literal["MATH", "THINK", "MEM", "LANG"] = Field(
        default="MATH",
        description="현재 공부 중인 과목 카테고리 (MATH: 수학/코딩, THINK: 사고력, MEM: 암기, LANG: 언어)"
    )

    target_minutes: Optional[int] = Field(
        default=60,
        description="목표 학습 시간 (단위: 분)."
    )

    is_phone_allowed: bool = Field(..., description="휴대폰 허용 여부", example=True)
    is_book_allowed: bool = Field(..., description="책 허용 여부", example=False)

class SessionStartResponse(BaseModel):
    """세션 생성 성공 시 백엔드가 반환하는 응답 데이터"""
    session_id: str = Field(..., description="생성된 고유 세션 ID (UUID v4)")
    status: str = Field(default="active", description="현재 세션 상태")
    message: Optional[str] = Field(None, description="세션 생성 성공 메시지")


# ==========================================
# 2. 비집중 이벤트 감지 (Vision Event) 관련 스키마
# ==========================================
class EventPayload(BaseModel):
    """프론트엔드 비전 AI가 감지한 유저의 현재 상태 데이터"""
    session_id: str = Field(..., description="현재 활성화된 유저의 세션 ID")
    event_type: Literal["looking_away", "sleep", "focus"] = Field(
        ..., 
        description="감지된 비집중 이벤트 유형 (looking_away: 다른 곳 응시, sleep: 졸음)"
    )
    confidence_score: Optional[float] = Field(
        default=0.9,
        description="비전 AI 감지 신뢰도"
    )

class EventResponse(BaseModel):
    """이벤트 판단 후 프론트엔드로 전달할 영상 라우팅 정보"""
    status: str = Field(default="success", description="이벤트 처리 상태 (success/error)")
    action: str = Field(..., description="프론트엔드가 취해야 할 행동 (keep_focus, intervention)")
    routed_video: Optional[str] = Field(None, description="유저 상태에 맞춰 매핑된 사전 렌더링 영상 URL (focus 시에는 안 올 수도 있음)")

class LoginRequest(BaseModel):
    """로그인 요청 데이터"""
    username: str = Field(..., description="시연용 유저 이름 또는 닉네임")

class LoginResponse(BaseModel):
    """로그인 성공 시 반환되는 응답 데이터"""
    user_id: str = Field(..., description="유저 고유 ID")
    username: str = Field(..., description="유저 이름")

class DistractionStat(BaseModel):
    subject: str = Field(..., description="딴짓 항목 (예: 스마트폰, 자리이탈)")
    count: int = Field(..., description="적발 횟수")

class SessionEndResponse(BaseModel):
    """세션 종료 시 반환되는 응답 데이터"""
    session_id: str = Field(..., description="종료된 세션 ID")
    status: str = Field(default="closed", description="세션 종료 상태")
    total_studied_seconds: int = Field(default=0, description="총 학습 시간 (단위: 초)")
    focus_score: int = Field(default=0, description="집중도 점수 (0~100)")
    distraction_stats: List[DistractionStat] = Field(default_factory=list, description="비집중 이벤트별 통계 데이터")

class SessionResultSaveRequest(BaseModel):
    """세션 결과 저장 요청 데이터"""
    achievement: str = Field(default="", description="오늘 목표를 얼마나 달성했는지에 대한 회고")
    memo: str = Field(default="", description="오늘 공부에 대한 메모")

class SessionResultResponse(BaseModel):
    """세션 결과 저장/조회 응답 데이터"""
    session_id: str = Field(..., description="세션 ID")
    status: str = Field(..., description="세션 상태")
    study_minutes: int = Field(..., description="실제 학습 시간 (단위: 분)")
    focus_percentage: int = Field(..., description="FocusLog 기반 집중도 (단위: %)")
    intervention_count: int = Field(..., description="InterventionLog 기반 개입 횟수")
    achievement: str = Field(default="", description="저장된 목표 달성 회고")
    memo: str = Field(default="", description="저장된 공부 메모")

class DailyProgressItem(BaseModel):
    """일별 통계 항목"""
    date: str = Field(..., description="날짜 (YYYY-MM-DD)")
    study_minutes: int = Field(..., description="해당 날짜의 총 학습 시간 (단위: 분)")
    daily_focus_percentage: int = Field(..., description="해당 날짜의 평균 집중도 (단위: %)")
    intervention_count: int = Field(default=0, description="해당 날짜의 개입 횟수")

class DashboardItem(BaseModel):
    """대시보드에 표시할 통계 항목 데이터 모델"""
    user_id: str = Field(..., description="유저 고유 ID")
    dash_total_focus_percentage: int = Field(..., description="전체 기간 평균 집중도 (단위: %)")
    dash_total_intervention_count: int = Field(default=0, description="전체 기간 개입 횟수")
    dash_progress: List[DailyProgressItem] = Field(..., description="차트에 표기할 누적데이터")

from pydantic import BaseModel, Field
from typing import Literal
from typing import Optional

# ==========================================
# 1. 스터디 세션 시작 (Session Start) 관련 스키마
# ==========================================
class SessionStartRequest(BaseModel):
    """스터디 시작 시 프론트엔드에서 보내는 요청 데이터"""
    subject: Literal["MATH", "THINK", "MEM", "LANG"] = Field(
        default="MATH",
        description="현재 공부 중인 과목 카테고리 (MATH: 수학/코딩, THINK: 사고력, MEM: 암기, LANG: 언어)"
    )

    target_duration_minutes: int = Field(
        default=60,
        description="목표 학습 시간 (단위: 분)"
    )

class SessionStartResponse(BaseModel):
    """세션 생성 성공 시 백엔드가 반환하는 응답 데이터"""
    session_id: str = Field(..., description="생성된 고유 세션 ID (UUID v4)")
    status: str = Field(default="active", description="현재 세션 상태")


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

class EventResponse(BaseModel):
    """이벤트 판단 후 프론트엔드로 전달할 영상 라우팅 정보"""
    status: str = Field(default="success", description="이벤트 처리 상태 (success/error)")
    action: str = Field(..., descriptions="프론트엔드가 취해야 할 행동 (keep_focus, intervention)")
    routed_video: Optional[str] = Field(None, description="유저 상태에 맞춰 매핑된 사전 렌더링 영상 URL (focus 시에는 안 올 수도 있음)")
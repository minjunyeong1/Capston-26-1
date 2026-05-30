from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
# from app.api.ws import router as ws_router

from app.database import engine
from app.models import Base
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Study Mate Backend",
    description="바디 더블링 기반 AI 스터디 코치 동적 라우팅 서버",
    version="1.0.0"
)

# 프론트엔드 통신 허용 (CORS 설정)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 실제 배포 시에는 프론트엔드 도메인으로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록 (부서 연결)
app.include_router(api_router)
# app.include_router(ws_router)

# 서버 헬스체크용 기본 엔드포인트
@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "AI Study Mate Backend is running smoothly!"}

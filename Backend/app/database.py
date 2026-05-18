from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. PostgreSQL 연결 URL 설정
# 구조: postgresql://[유저네임]:[비밀번호]@[호스트]:[포트]/[데이터베이스이름]
# 예시: 로컬에 기본 세팅된 PostgreSQL을 쓸 경우 아래와 같이 작성합니다.
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost:5432/studymate"

# 2. 엔진 생성
# SQLite에서 쓰던 connect_args={"check_same_thread": False} 옵션은 제거합니다.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. API 의존성 주입을 위한 DB 세션 생성 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
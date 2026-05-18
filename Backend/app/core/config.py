# app/core/config.py

# 실제 서비스 시 AWS S3 주소나 헤이젠에서 뽑은 최종 MP4 링크로 교체하시면 됩니다.
VIDEO_POOL = {
    # 1. 대기 및 긍정 상태
    "IDLE_LOOP": "https://example.com/videos/idle_blink.mp4",
    "FOCUS_CHEER": "https://example.com/videos/focus_cheer.mp4", # (옵션) 칭찬 영상
    
    # 2. 1회차 공통 경고 (넛지)
    "ALERT_COUGH": "https://example.com/videos/alert_cough.mp4",
    
    # 3. 2회차 맞춤형 개입 (사고력/수학)
    "SM_2_MATH": "https://example.com/videos/sm_2_math.mp4",
    "DR_2_MATH": "https://example.com/videos/dr_2_math.mp4",
    
    # 4. 2회차 맞춤형 개입 (암기/공시/일반)
    "SM_2_MEMO": "https://example.com/videos/sm_2_memo.mp4",
    "DR_2_MEMO": "https://example.com/videos/dr_2_memo.mp4",
    
    # 5. 2회차 맞춤형 개입 (언어/영어)
    "SM_2_ENG": "https://example.com/videos/sm_2_eng.mp4",
    "DR_2_ENG": "https://example.com/videos/dr_2_eng.mp4",
}
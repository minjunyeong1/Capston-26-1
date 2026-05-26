# app/core/config.py

# 실제 서비스 시 AWS S3 주소나 헤이젠에서 뽑은 최종 MP4 링크로 교체하시면 됩니다.
VIDEO_POOL = {
    # 1. 대기 및 긍정 상태
    "IDLE_LOOP": "https://example.com/videos/idle_blink.mp4",
    "FOCUS_CHEER": "https://example.com/videos/focus_cheer.mp4", # (옵션) 칭찬 영상
    
    # 2. 1회차 공통 경고 (시각/청각 넛지)
    "ALERT_COUGH": "https://example.com/videos/alert_cough.mp4",

    # 3. 2회차 이상 맞춤형 개입: MATH / looking_away
    "MATH_LOOKING_AWAY_01": "https://example.com/videos/math_looking_away_01.mp4", # 혹시 풀다가 멈춘 거야?
    "MATH_LOOKING_AWAY_02": "https://example.com/videos/math_looking_away_02.mp4", # 방금까지 잘 했는데!
    "MATH_LOOKING_AWAY_03": "https://example.com/videos/math_looking_away_03.mp4", # 나중에 다시 보면 더 귀찮아지는데 지금 조금만 집중하자!
    "MATH_LOOKING_AWAY_04": "https://example.com/videos/math_looking_away_04.mp4", # 뭐해?
    "MATH_LOOKING_AWAY_05": "https://example.com/videos/math_looking_away_05.mp4", # 이어서 집중해보자

    # 4. 2회차 이상 맞춤형 개입: MATH / sleep
    "MATH_SLEEP_01": "https://example.com/videos/math_sleep_01.mp4", # 지금 눈 감은 거 아니야?
    "MATH_SLEEP_02": "https://example.com/videos/math_sleep_02.mp4", # 이 상태로 풀면 더 꼬여! 자면 안돼!
    "MATH_SLEEP_03": "https://example.com/videos/math_sleep_03.mp4", # 잠깐 잠 좀 깨고 다시 집중해보자!
    "MATH_SLEEP_04": "https://example.com/videos/math_sleep_04.mp4", # 눈 좀 뜨고 다시 이어가보자!

    # 5. 2회차 이상 맞춤형 개입: THINK / looking_away
    "THINK_LOOKING_AWAY_01": "https://example.com/videos/think_looking_away_01.mp4", # 지금 생각하다 멈춘 거야?
    "THINK_LOOKING_AWAY_02": "https://example.com/videos/think_looking_away_02.mp4", # 조금만 더 힘내보자
    "THINK_LOOKING_AWAY_03": "https://example.com/videos/think_looking_away_03.mp4", # 여기서 끊기면 다시 떠올리기 힘들다
    "THINK_LOOKING_AWAY_04": "https://example.com/videos/think_looking_away_04.mp4", # 조금만 더 생각해보면 될 것 같은데
    "THINK_LOOKING_AWAY_05": "https://example.com/videos/think_looking_away_05.mp4", # 생각 흐름이 끊긴 느낌인데
    "THINK_LOOKING_AWAY_06": "https://example.com/videos/think_looking_away_06.mp4", # 그냥 이어서 한 번만 더 밀어보자
    "THINK_LOOKING_AWAY_07": "https://example.com/videos/think_looking_away_07.mp4", # 여기서 포기하기 아깝지 않아?
    "THINK_LOOKING_AWAY_08": "https://example.com/videos/think_looking_away_08.mp4", # 잡생각 할수록 늦어져

    # 6. 2회차 이상 맞춤형 개입: THINK / sleep
    "THINK_SLEEP_01": "https://example.com/videos/think_sleep_01.mp4", # 지금 생각하다가 멍해진 거지?
    "THINK_SLEEP_02": "https://example.com/videos/think_sleep_02.mp4", # 눈 떠! 집중하고 다시 생각해보자!
    "THINK_SLEEP_03": "https://example.com/videos/think_sleep_03.mp4", # 지금 조금만 힘내보자! 다시 문제를 떠올려봐!

    # 7. 2회차 이상 맞춤형 개입: MEM / looking_away
    "MEM_LOOKING_AWAY_01": "https://example.com/videos/mem_looking_away_01.mp4", # 다른 생각해?
    "MEM_LOOKING_AWAY_02": "https://example.com/videos/mem_looking_away_02.mp4", # 지루해?
    "MEM_LOOKING_AWAY_03": "https://example.com/videos/mem_looking_away_03.mp4", # 잘 외우고 있어?
    "MEM_LOOKING_AWAY_04": "https://example.com/videos/mem_looking_away_04.mp4", # 좀만 더 집중해보자
    "MEM_LOOKING_AWAY_05": "https://example.com/videos/mem_looking_away_05.mp4", # 조금만 더 보면 기억 날 것 같은데
    "MEM_LOOKING_AWAY_06": "https://example.com/videos/mem_looking_away_06.mp4", # 지금 멈추면 다시 하기 싫어진다
    "MEM_LOOKING_AWAY_07": "https://example.com/videos/mem_looking_away_07.mp4", # 제대로 보고 있니?

    # 8. 2회차 이상 맞춤형 개입: MEM / sleep
    "MEM_SLEEP_01": "https://example.com/videos/mem_sleep_01.mp4", # 졸면서 보면 하나도 안 들어간다! 정신차려!
    "MEM_SLEEP_02": "https://example.com/videos/mem_sleep_02.mp4", # 지금 눈 반쯤 감겼는데? 일어나!
    "MEM_SLEEP_03": "https://example.com/videos/mem_sleep_03.mp4", # 이 상태로 외우면 다 날린다! 아깝잖아! 다시 해보자!
    "MEM_SLEEP_04": "https://example.com/videos/mem_sleep_04.mp4", # 잠깐 깨고 다시 외워보자!

    # 9. 2회차 이상 맞춤형 개입: LANG / looking_away
    "LANG_LOOKING_AWAY_01": "https://example.com/videos/lang_looking_away_01.mp4", # 방금 뭐 읽고 있었는지 기억나?
    "LANG_LOOKING_AWAY_02": "https://example.com/videos/lang_looking_away_02.mp4", # 다시 이어서 보자!
    "LANG_LOOKING_AWAY_03": "https://example.com/videos/lang_looking_away_03.mp4", # 지금 눈 딴 데 간 거 같은데?
    "LANG_LOOKING_AWAY_04": "https://example.com/videos/lang_looking_away_04.mp4", # 이거 끊기면 다시 읽어야 돼! 지금 보자!
    "LANG_LOOKING_AWAY_05": "https://example.com/videos/lang_looking_away_05.mp4", # 제대로 다시 읽어보자! 정신 차려!
    "LANG_LOOKING_AWAY_06": "https://example.com/videos/lang_looking_away_06.mp4", # 지금 집중하고 있어?
    "LANG_LOOKING_AWAY_07": "https://example.com/videos/lang_looking_away_07.mp4", # 읽던 흐름 다시 잡자!
    "LANG_LOOKING_AWAY_08": "https://example.com/videos/lang_looking_away_08.mp4", # 여기서 끊기면 좀 아깝다! 좀만 더 힘내자!

    # 10. 2회차 이상 맞춤형 개입: LANG / sleep
    "LANG_SLEEP_01": "https://example.com/videos/lang_sleep_01.mp4", # 지금 읽다가 졸고 있는 거 아냐?
    "LANG_SLEEP_02": "https://example.com/videos/lang_sleep_02.mp4", # 눈 감고 읽는 느낌인데! 일어나!
    "LANG_SLEEP_03": "https://example.com/videos/lang_sleep_03.mp4", # 이 상태면 다시 읽어야 돼! 다시 집중해보자!
    "LANG_SLEEP_04": "https://example.com/videos/lang_sleep_04.mp4", # 잠깐 깨고 다시 이어서 보자!
}

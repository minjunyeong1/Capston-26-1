// 핵심 랜드마크 인덱스 (MediaPipe 478점 기준)
export const KEY_POINTS = {
    r_eye: [33, 160, 159, 133, 145, 144], // outer, top1, top2, inner, bot2, bot1
    l_eye: [263, 387, 386, 362, 374, 373],
    irises: { l: 468, r: 473 },
    nose_tip: 1,
    head: { forehead: 10, chin: 152, l_cheek: 234, r_cheek: 454 }
};

export const TARGET_FPS = 5;
export const CALIBRATION_FRAMES = 30 * TARGET_FPS; // 150 프레임

// 판별 임계값
export const THRESHOLDS = {
    EAR_SLEEP_RATIO: 0.6,
    NOSE_DOWN: 0.05,
    YAW_AWAY: 0.15,
    YAW_SEVERE: 0.30,
    GAZE_DOWN_RATIO: 0.5,
    GAZE_LEFT_RATIO: 0.4,
    GAZE_RIGHT_RATIO: 0.6
};

export const WINDOW_FRAMES = 3 * TARGET_FPS; // 15프레임
export const CONFIRM_RATIO = 0.8;
import { THRESHOLDS, KEY_POINTS } from './config.js';
import { computeEar, computeHeadYaw, computeGazeX, computeGazeY } from './utils.js'; 

export function detectInstantState(landmarks, base) {
    const currentEar = (computeEar(landmarks, KEY_POINTS.r_eye) + computeEar(landmarks, KEY_POINTS.l_eye)) / 2;
    const currentYaw = computeHeadYaw(landmarks, KEY_POINTS.nose_tip, KEY_POINTS.head.l_cheek, KEY_POINTS.head.r_cheek);
    const noseY = landmarks[KEY_POINTS.nose_tip].y;

    
    const gazeX = (computeGazeX(landmarks, KEY_POINTS.irises.l, KEY_POINTS.l_eye[0], KEY_POINTS.l_eye[3]) + 
                   computeGazeX(landmarks, KEY_POINTS.irises.r, KEY_POINTS.r_eye[0], KEY_POINTS.r_eye[3])) / 2;
    // 1. 수면 판별
    if (base.normalEar > 0 && (currentEar / base.normalEar) < THRESHOLDS.EAR_SLEEP_RATIO) return 'SLEEP';

    // 2-a. 고개 심하게 돌림 (AWAY)
    if (Math.abs(currentYaw) > THRESHOLDS.YAW_SEVERE) return 'AWAY';


    const headTurned = Math.abs(currentYaw) > THRESHOLDS.YAW_AWAY;
    const gazeOffX = (gazeX < THRESHOLDS.GAZE_LEFT_RATIO || gazeX > THRESHOLDS.GAZE_RIGHT_RATIO);

    if (headTurned && gazeOffX) return 'AWAY';  // 고개도 돌아가고 시선도 딴 곳
    if (!headTurned && gazeOffX) return 'AWAY'; // 고개는 정면인데 시선만 딴 곳

    // 3. 고개 숙임 (AWAY)
    if ((noseY - base.baseNoseY) > THRESHOLDS.NOSE_DOWN) return 'LOOKING_DOWN';

    // 4. 시선 아래 (Gaze Y) (인덱스 1: 위쪽 눈꺼풀, 인덱스 4: 아래쪽 눈꺼풀)
    const gazeY = (computeGazeY(landmarks, KEY_POINTS.irises.l, KEY_POINTS.l_eye[1], KEY_POINTS.l_eye[2], KEY_POINTS.l_eye[5], KEY_POINTS.l_eye[4]) + 
                   computeGazeY(landmarks, KEY_POINTS.irises.r, KEY_POINTS.r_eye[1], KEY_POINTS.r_eye[2], KEY_POINTS.r_eye[5], KEY_POINTS.r_eye[4])) / 2;
    if (gazeY > THRESHOLDS.GAZE_DOWN_RATIO) return 'LOOKING_DOWN';

    return 'CENTER';
}
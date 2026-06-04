// app/(dashboard)/study/studying/face.worker.ts

import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;

async function initModel() {
    try {
        // 프로젝트에 설치된 npm 패키지를 직접 사용하여 훨씬 안정적입니다.
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: { 
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`, 
                delegate: "GPU"
            },
            runningMode: "VIDEO", 
            numFaces: 1
        });

        postMessage({ type: 'READY' });
    } catch (error: any) {
        console.error("Worker 내 AI 모델 로드 에러:", error);
        postMessage({ type: 'ERROR', message: error.message });
    }
}

initModel();

self.onmessage = (event: MessageEvent) => {
    if (!faceLandmarker) return;

    const { frame, timestamp } = event.data;

    try {
        const results = faceLandmarker.detectForVideo(frame, timestamp);
        postMessage({ 
            type: 'RESULT', 
            results: results 
        });
    } catch (error) {
        console.error("Worker 내 AI 분석 에러:", error);
    } finally {
        // 비트맵 메모리 해제
        if (frame && typeof frame.close === 'function') {
            frame.close(); 
        }
    }
};
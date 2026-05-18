import { Calibrator } from './calibrator.js';
import { SlidingWindow } from './state_queue.js';
import { detectInstantState } from './pattern_detector.js';
import { TARGET_FPS } from './config.js';

export class ConcentrationDetector {
    constructor() {
        this.calibrator = new Calibrator();
        this.slidingWindow = new SlidingWindow();


        this.lastProcessTime = 0;
        this.TARGET_FPS = TARGET_FPS; 
        this.FRAME_INTERVAL = 1000 / this.TARGET_FPS;


        this.lastResult = { phase: 'INITIALIZING', progress: 0 };
    }

    processFrame(landmarks) {
        const now = performance.now();
        
  
        if (now - this.lastProcessTime < this.FRAME_INTERVAL) {
            return this.lastResult;
        }

        // 계산 수행 시간 업데이트
        this.lastProcessTime = now;

        // 1. 캘리브레이션 단계
        if (!this.calibrator.isDone) {
            this.calibrator.addFrame(landmarks);
            this.lastResult = { 
                phase: 'CALIBRATING', 
                progress: this.calibrator.progress 
            };
            return this.lastResult;
        }

        // 2. 실제 분석 단계 (파이썬 로직과 동일)
        const instant = detectInstantState(landmarks, this.calibrator.results);
        const { state, confidence } = this.slidingWindow.add(instant);

        this.lastResult = { 
            phase: 'DETECTING', 
            instant, 
            confirmed: state, 
            confidence 
        };

        return this.lastResult;
    }

    reset() {
        this.calibrator.reset();
        this.slidingWindow.reset();
        this.lastProcessTime = 0; // 시간도 초기화
        this.lastResult = { phase: 'INITIALIZING', progress: 0 };
    }
}
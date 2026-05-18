import { CALIBRATION_FRAMES, KEY_POINTS } from './config.js';
import { computeEar } from './utils.js';

export class Calibrator {
    constructor() {
        this.earSamples = [];
        this.noseYSamples = [];
        this.isDone = false;
        this.results = { normalEar: 0, baseNoseY: 0 };
    }

    addFrame(landmarks) {
        if (this.isDone) return;

        const ear = (computeEar(landmarks, KEY_POINTS.r_eye) + computeEar(landmarks, KEY_POINTS.l_eye)) / 2;
        const noseY = landmarks[KEY_POINTS.nose_tip].y;

        if (ear > 0.05) {
            this.earSamples.push(ear);
            this.noseYSamples.push(noseY);
        }

        if (this.earSamples.length >= CALIBRATION_FRAMES) {
            this.results.normalEar = this.earSamples.reduce((a, b) => a + b) / this.earSamples.length;
            this.results.baseNoseY = this.noseYSamples.reduce((a, b) => a + b) / this.noseYSamples.length;
            this.isDone = true;
        }
    }

    get progress() { return Math.min(this.earSamples.length / CALIBRATION_FRAMES, 1.0); }
    reset() { this.earSamples = []; this.noseYSamples = []; this.isDone = false; }
}
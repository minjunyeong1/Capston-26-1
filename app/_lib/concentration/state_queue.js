import { WINDOW_FRAMES, CONFIRM_RATIO } from './config.js';

export class SlidingWindow {
    constructor() {
        this.window = [];
    }

    add(state) {
        this.window.push(state);
        if (this.window.length > WINDOW_FRAMES) this.window.shift();
        return this.getConfirmed();
    }

    getConfirmed() {
        if (this.window.length < WINDOW_FRAMES) return { state: 'CENTER', confidence: this.window.length / WINDOW_FRAMES };

        const counts = {};
        this.window.forEach(s => counts[s] = (counts[s] || 0) + 1);

        for (const s of ['SLEEP', 'AWAY','LOOKING_DOWN']) {
            const ratio = (counts[s] || 0) / WINDOW_FRAMES;
            if (ratio >= CONFIRM_RATIO) return { state: s, confidence: ratio };
        }

        const centerRatio = (counts['CENTER'] || 0) / WINDOW_FRAMES;
        return { state: 'CENTER', confidence: centerRatio };
    }

    reset() { this.window = []; }
}
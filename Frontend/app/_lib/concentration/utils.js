export function getDist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function computeEar(landmarks, indices) {
    const [outer, t1, t2, inner, b2, b1] = indices.map(i => landmarks[i]);
    const vert1 = getDist(t1, b1);
    const vert2 = getDist(t2, b2);
    const horiz = getDist(outer, inner);
    return horiz === 0 ? 0 : (vert1 + vert2) / (2 * horiz);
}

export function computeHeadYaw(landmarks, noseIdx, lIdx, rIdx) {
    const nose = landmarks[noseIdx];
    const lc = landmarks[lIdx];
    const rc = landmarks[rIdx];
    const center_x = (lc.x + rc.x) / 2;
    const width = Math.abs(rc.x - lc.x);
    return width === 0 ? 0 : (nose.x - center_x) / width;
}


export function computeGazeY(landmarks, irisIdx, topIdx1, topIdx2, botIdx1, botIdx2) {
    const iris = landmarks[irisIdx];
    const topY = Math.min(landmarks[topIdx1].y, landmarks[topIdx2].y);
    const botY = Math.max(landmarks[botIdx1].y, landmarks[botIdx2].y);
    const height = botY - topY;
    
    if (height <= 0) return 0.5;
    const ratio = (iris.y - topY) / height;
    return Math.max(0.0, Math.min(1.0, ratio)); // 0~1 범위를 벗어나지 않도록 제한
}


export function computeGazeX(landmarks, irisIdx, outerIdx, innerIdx) {
    const iris = landmarks[irisIdx];
    const outerX = landmarks[outerIdx].x;
    const innerX = landmarks[innerIdx].x;
    
    const minX = Math.min(outerX, innerX);
    const maxX = Math.max(outerX, innerX);
    const width = maxX - minX;
    
    if (width <= 0) return 0.5;
    const ratio = (iris.x - minX) / width;
    return Math.max(0.0, Math.min(1.0, ratio)); // 0~1 범위를 벗어나지 않도록 제한
}
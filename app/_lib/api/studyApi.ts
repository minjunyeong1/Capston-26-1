// app/_lib/api/studyApi.ts

const BASE_URL = "http://localhost:8000"; // 백엔드 서버 주소 (배포 시 수정 필요)

export const studyApi = {
    // 1. 세션 시작
    startSession: async (userId: number, subject: string, targetMinutes: number) => {
        const res = await fetch(`${BASE_URL}/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                subject: subject,
                target_minutes: targetMinutes,
                is_phone_allowed: false, // 필요에 따라 UI에서 상태로 관리
                is_book_allowed: true,
            }),
        });
        if (!res.ok) throw new Error("세션 시작 실패");
        return res.json();
    },

    // 2. 캘리브레이션 완료 전송
    sendCalibration: async (sessionId: number, baseEar: number, baseNoseY: number) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/calibrate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base_ear: baseEar, base_nose_y: baseNoseY }),
        });
        if (!res.ok) throw new Error("캘리브레이션 전송 실패");
        return res.json();
    },

    // 3. 실시간 상태 로그 전송 (배치)
    sendBatchLogs: async (sessionId: number, logs: { timestamp: string; status: string }[]) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logs }),
        });
        if (!res.ok) throw new Error("로그 배치 전송 실패");
        return res.json();
    },

    // 4. 세션 종료
    endSession: async (sessionId: number) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/end`, {
            method: "PATCH",
        });
        if (!res.ok) throw new Error("세션 종료 실패");
        return res.json();
    },
};
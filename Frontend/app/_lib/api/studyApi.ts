// app/_lib/api/studyApi.ts

const BASE_URL = "http://localhost:8000"; // 백엔드 서버 주소

export const studyApi = {
    // ==========================================
    // 0. 인증 (시연용 유저 식별 데이터 가져오기)
    // ==========================================
    login: async (username: string, password: string = "1234") => {
        // 백엔드는 username 필드로 이메일 또는 닉네임을 받습니다.
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error("로그인 실패");
        return res.json(); // { user_id: string, username: string, token: string } 반환
    },

    signup: async (email: string, username: string, password: string = "1234") => {
        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }),
        });
        if (!res.ok) throw new Error("회원가입 실패");
        return res.json();
    },

    // ==========================================
    // 1. 세션 관리 및 통신
    // ==========================================
    // 1-1. 세션 시작 (userId, sessionId는 백엔드에서 string(UUID) 타입입니다)
    startSession: async (userId: string, subject: string, targetMinutes: number, isPhoneAllowed: boolean, isBookAllowed: boolean) => {
        const res = await fetch(`${BASE_URL}/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                subject: subject,
                target_minutes: targetMinutes,
                is_phone_allowed: isPhoneAllowed,
                is_book_allowed: isBookAllowed,
            }),
        });
        if (!res.ok) throw new Error("세션 시작 실패");
        return res.json(); // { session_id: string, status: string, message: string } 반환
    },

    // 1-2. 단건 이벤트 전송 (프론트에서 비집중 감지 시 아바타 라우팅용)
    sendEvent: async (sessionId: string, eventType: "looking_away" | "sleep" | "focus", confidenceScore: number = 0.9) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                session_id: sessionId, 
                event_type: eventType, 
                confidence_score: confidenceScore 
            }),
        });
        if (!res.ok) throw new Error("이벤트 처리 실패");
        return res.json(); // { status, action, routed_video } 반환
    },

    // 1-3. 캘리브레이션 완료 전송 (API 명세서 기준)
    sendCalibration: async (sessionId: string, baseEar: number, baseNoseY: number) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/calibrate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base_ear: baseEar, base_nose_y: baseNoseY }),
        });
        if (!res.ok) throw new Error("캘리브레이션 전송 실패");
        return res.json();
    },

    // 1-4. 실시간 상태 로그 전송 (배치 처리용 - API 명세서 기준)
    sendBatchLogs: async (sessionId: string, logs: { timestamp: string; status: string; current_ear?: number }[]) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logs }),
        });
        if (!res.ok) throw new Error("로그 배치 전송 실패");
        return res.json();
    },

    // 1-5. 세션 종료
    endSession: async (sessionId: string) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/end`, {
            method: "PATCH",
        });
        if (!res.ok) throw new Error("세션 종료 실패");
        return res.json(); // 집중도 점수, 딴짓 통계 등 반환
    },

    // ==========================================
    // 2. 결과 및 통계 조회
    // ==========================================
    // 2-1. 세션 결과(메모 및 회고) 저장
    saveSessionResult: async (sessionId: string, achievement: number, memo: string) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/result`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                achievement_percentage: achievement, 
                memo: memo 
            }),
        });
        if (!res.ok) throw new Error("회고 저장 실패");
        return res.json();
    },

    // 2-2. 대시보드 누적 통계 조회
    getDashboard: async (userId: string) => {
        const res = await fetch(`${BASE_URL}/dashboard/${userId}`, {
            method: "GET",
        });
        if (!res.ok) throw new Error("대시보드 조회 실패");
        return res.json();
    },
    // ==========================================
    // 3. 캘린더 일정 관리 API
    // ==========================================
    getSchedules: async (userId: string, yearMonth?: string) => {
        const url = yearMonth ? `${BASE_URL}/users/${userId}/schedules?year_month=${yearMonth}` : `${BASE_URL}/users/${userId}/schedules`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("일정 조회 실패");
        return res.json();
    },
    createSchedule: async (userId: string, scheduleData: any) => {
        const res = await fetch(`${BASE_URL}/users/${userId}/schedules`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scheduleData),
        });
        if (!res.ok) throw new Error("일정 생성 실패");
        return res.json();
    },
    updateSchedule: async (scheduleId: string, scheduleData: any) => {
        const res = await fetch(`${BASE_URL}/schedules/${scheduleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scheduleData),
        });
        if (!res.ok) throw new Error("일정 수정 실패");
        return res.json();
    },
    deleteSchedule: async (scheduleId: string) => {
        const res = await fetch(`${BASE_URL}/schedules/${scheduleId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("일정 삭제 실패");
        return res.json();
    },
    // 세션 통계 및 결과 조회 (GET)
    getSessionResult: async (sessionId: string) => {
        const res = await fetch(`${BASE_URL}/sessions/${sessionId}/result`, {
            method: "GET",
        });
        if (!res.ok) throw new Error("세션 결과 조회 실패");
        return res.json();
    },
    
};

// app/_lib/api/studyApi.ts (기존 studyApi 객체 아래에 추가하세요)

export const calendarApi = {
    // 1. 일정 조회 (GET)
    getSchedules: async (userId: string) => {
        const res = await fetch(`${BASE_URL}/users/${userId}/schedules`);
        if (!res.ok) throw new Error("일정 불러오기 실패");
        return res.json();
    },

    // 2. 일정 추가 (POST)
    createSchedule: async (userId: string, data: any) => {
        const res = await fetch(`${BASE_URL}/users/${userId}/schedules`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("일정 추가 실패");
        return res.json();
    },

    // 3. 일정 수정 (PUT)
    updateSchedule: async (scheduleId: string, data: any) => {
        const res = await fetch(`${BASE_URL}/schedules/${scheduleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("일정 수정 실패");
        return res.json();
    },

    // 4. 일정 삭제 (DELETE)
    deleteSchedule: async (scheduleId: string) => {
        const res = await fetch(`${BASE_URL}/schedules/${scheduleId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("일정 삭제 실패");
        // 204 No Content 이므로 json() 파싱 안함
        return true; 
    },
    getSessionResults: async (userId: string) => {
        const res = await fetch(`${BASE_URL}/users/${userId}/sessions`);
        if (!res.ok) throw new Error("공부 기록 불러오기 실패");
        return res.json();
    },
};
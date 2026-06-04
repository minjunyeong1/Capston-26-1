"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { studyApi } from "@/app/_lib/api/studyApi";

export function useStudyTimer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL에서 세션 ID와 목표 시간 가져오기
    const sessionId = searchParams.get("session_id") || "";
    const targetTimeMinutes = parseInt(searchParams.get("targetTime") || "60", 10);

    const [timeLeft, setTimeLeft] = useState(targetTimeMinutes * 60);
    const [isPaused, setIsPaused] = useState(false);

    // 공부 종료 및 결과 페이지 이동 로직
    const handleEndSession = async () => {
        if (sessionId) {
            try {
                await studyApi.endSession(sessionId);
            } catch (error) {
                console.error("세션 종료 실패:", error);
            }
        }
        router.push(`/study/result?session_id=${sessionId}`);
    };

    // 1초씩 줄어드는 타이머 로직
    useEffect(() => {
        if (isPaused || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [isPaused, timeLeft]);

    // 🌟 시간 초과 시 자동 종료
    useEffect(() => {
        if (timeLeft === 0) {
            alert("목표 시간을 모두 채웠습니다! 고생하셨습니다 🎉");
            handleEndSession();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // UI에 바로 뿌릴 수 있게 시, 분, 초 단위로 포맷팅해서 내보냅니다!
    const h = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
    const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');

    return {
        sessionId,
        timeLeft,
        isPaused,
        setIsPaused,
        handleEndSession,
        h, m, s
    };
}
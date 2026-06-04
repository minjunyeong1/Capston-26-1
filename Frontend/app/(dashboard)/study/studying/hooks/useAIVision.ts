"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation"; 
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { ConcentrationDetector } from "@/app/_lib/concentration/detector";

// 🌟 Props에 setPendingWarning 추가
interface UseAIVisionProps {
    isPaused: boolean;
    setPendingWarning: (videoPath: string | null) => void;
}

export function useAIVision({ isPaused, setPendingWarning }: UseAIVisionProps) {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id") || ""; // 현재 스터디 세션 ID

    const videoRef = useRef<HTMLVideoElement>(null);
    
    const [statusText, setStatusText] = useState("로딩 중...");
    const [progress, setProgress] = useState(0);
    const [statusClass, setStatusClass] = useState("text-gray-500"); 
    
    const detectorRef = useRef(new ConcentrationDetector());
    const requestRef = useRef<number>();
    const lastVideoTimeRef = useRef(-1); 
    const isProcessing = useRef(false);
    const isPausedRef = useRef(isPaused);

    // 🌟 [추가] 백엔드 API 폭주를 막기 위한 상태 추적 변수
    const lastEventRef = useRef<string>('CENTER'); 
    const isFetchingEvent = useRef<boolean>(false);

    // 🌟 [추가] 백엔드로 이벤트를 쏘고 개입 영상을 받아오는 함수
    const triggerBackendEvent = async (eventType: string, confidence: number) => {
        if (!sessionId) return;
        
        try {
            // studyApi 모듈이 있다면 studyApi.sendEvent()로 대체하셔도 좋습니다.
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/sessions/${sessionId}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    event_type: eventType,
                    confidence_score: confidence
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // 백엔드가 "개입해!" 라고 판정하고 영상을 골라줬다면?
                if (data.action === "intervention" && data.routed_video) {
                    console.log("🔥 AI 코치 개입 작동:", data.routed_video);
                    setPendingWarning(data.routed_video); // 🌟 백엔드가 골라준 영상을 재생!
                }
            }
        } catch (err) {
            console.error("백엔드 이벤트 전송 실패:", err);
        }
    };

    useEffect(() => {
        isPausedRef.current = isPaused;
        if (videoRef.current) {
            if (isPaused) videoRef.current.pause();
            else videoRef.current.play().catch(e => console.log("재생 대기중", e));
        }
    }, [isPaused]);

    useEffect(() => {
        let isComponentMounted = true;
        let faceLandmarker: FaceLandmarker;

        async function initWebcamAndAI() {
            try {
                setStatusText("AI 모델 불러오는 중...");
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

                setStatusText("카메라 권한 요청 중...");
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                
                if (videoRef.current && isComponentMounted) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => predictLoop();
                }
            } catch (error) {
                console.error(error);
                setStatusText("카메라를 켤 수 없습니다.");
            }
        }

        const predictLoop = () => {
            if (!videoRef.current || !faceLandmarker || isProcessing.current || isPausedRef.current) {
                requestRef.current = requestAnimationFrame(predictLoop);
                return;
            }

            if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = videoRef.current.currentTime;
                isProcessing.current = true; 
                
                try {
                    const results = faceLandmarker.detectForVideo(videoRef.current, performance.now());
                    
                    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                        const res = detectorRef.current.processFrame(results.faceLandmarks[0]);
                        
                        if (res.phase === 'CALIBRATING') {
                            setStatusText(`자세 보정 중... ${(res.progress * 100).toFixed(0)}%`);
                            setProgress(res.progress * 100);
                            setStatusClass("text-blue-500");
                        } else {
                            setStatusText(`상태: ${res.confirmed} (${(res.confidence * 100).toFixed(0)}%)`);
                            setProgress(res.confidence * 100);
                            
                            if (res.confirmed === 'CENTER') setStatusClass("text-green-600");
                            else if (res.confirmed === 'SLEEP') setStatusClass("text-red-600");
                            else setStatusClass("text-orange-500");

                            // [중요] 새로운 이벤트가 감지되었고, 이전 이벤트와 다르며, 현재 백엔드 요청이 진행 중이 아니라면
                            if (res.confirmed !== 'CENTER' && res.confirmed !== lastEventRef.current && !isFetchingEvent.current) {
                                lastEventRef.current = res.confirmed; // 상태 갱신
                                isFetchingEvent.current = true;

                                // 백엔드가 인식하는 포맷(sleep, looking_away)으로 변환
                                const backendEventType = res.confirmed === 'SLEEP' ? 'sleep' : 'looking_away';

                                // 백엔드에 이벤트를 쏘고 결과를 받아 비디오를 재생합니다.
                                triggerBackendEvent(backendEventType, res.confidence).finally(() => {
                                    isFetchingEvent.current = false;
                                });
                            } 
                            // 정상 상태('CENTER')로 돌아오면, 다음 딴짓 때 다시 API를 쏠 수 있도록 리셋
                            else if (res.confirmed === 'CENTER') {
                                lastEventRef.current = 'CENTER';
                            }
                            // =========================================================
                        }
                    } else {
                        setStatusText("얼굴을 찾을 수 없습니다.");
                        setStatusClass("text-gray-500");
                    }
                } catch (err) {
                    console.error("AI 분석 에러:", err);
                } finally {
                    isProcessing.current = false;
                }
            }
            requestRef.current = requestAnimationFrame(predictLoop);
        };

        initWebcamAndAI();

        return () => {
            isComponentMounted = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop()); 
            }
        };
    }, [sessionId]); 


    useEffect(() => {
        if (!sessionId || isPaused) return;

        let logsBuffer: any[] = [];

        // 1. 2초마다 현재 유저의 상태를 버퍼(배열)에 기록
        const collectInterval = setInterval(() => {
            const currentStatus = lastEventRef.current;
            
            // 프론트엔드 상태를 백엔드 규격(focus, sleep, looking_away)에 맞게 변환
            let mappedStatus = 'focus';
            if (currentStatus === 'SLEEP') mappedStatus = 'sleep';
            else if (currentStatus !== 'CENTER') mappedStatus = 'looking_away';

            logsBuffer.push({
                timestamp: new Date().toISOString(),
                status: mappedStatus,
                confidence_score: 0.9 // 비전 AI 신뢰도 임의값 (필요시 실제값 연동)
            });
        }, 2000);

        // 2. 10초마다 버퍼에 모인 로그들을 백엔드(/status)로 일괄 전송
        const sendInterval = setInterval(async () => {
            if (logsBuffer.length === 0) return;

            const logsToSend = [...logsBuffer];
            logsBuffer = []; // 전송할 데이터는 빼두고, 다음 수집을 위해 버퍼 비우기

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                await fetch(`${apiUrl}/sessions/${sessionId}/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ logs: logsToSend }) // 백엔드 스키마에 맞춰 'logs' 배열로 감싸서 전송
                });
                console.log("📊 상태 로그 배치 전송 완료:", logsToSend.length, "건");
            } catch (err) {
                console.error("상태 로그 전송 실패:", err);
            }
        }, 10000);

        return () => {
            clearInterval(collectInterval);
            clearInterval(sendInterval);
        };
    }, [sessionId, isPaused]);

    const resetDetector = () => {
        detectorRef.current.reset();
    };

    return {
        videoRef,
        statusText,
        progress,
        statusClass,
        resetDetector
    };
}
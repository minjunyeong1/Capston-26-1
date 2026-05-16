"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { ConcentrationDetector } from "@/app/_lib/concentration/detector";

export default function StudyingPage() {
    const router = useRouter();

    // 🌟 [UI 상태 관리]
    const [timeLeft, setTimeLeft] = useState(3600); // 임시: 60분 (3600초)
    const [isPaused, setIsPaused] = useState(false);

    // 🌟 [AI & 카메라 상태 관리]
    const videoRef = useRef<HTMLVideoElement>(null);
    const [statusText, setStatusText] = useState("로딩 중...");
    const [progress, setProgress] = useState(0);
    const [statusClass, setStatusClass] = useState("text-gray-500"); 
    
    const detectorRef = useRef(new ConcentrationDetector());
    const requestRef = useRef<number>();
    const lastVideoTimeRef = useRef(-1); 
    const isProcessing = useRef(false);
    
    const isPausedRef = useRef(isPaused);

    // ==========================================
    // 1. 타이머 및 일시정지 동기화 로직
    // ==========================================
    useEffect(() => {
        isPausedRef.current = isPaused;
        if (videoRef.current) {
            if (isPaused) videoRef.current.pause();
            else videoRef.current.play().catch(e => console.log("재생 대기중", e));
        }
    }, [isPaused]);

    useEffect(() => {
        if (isPaused || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [isPaused, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0) {
            alert("목표 시간을 모두 채웠습니다! 고생하셨습니다 🎉");
            router.push('/study/result');
        }
    }, [timeLeft, router]);

    // ==========================================
    // 2. 웹캠 및 MediaPipe AI 초기화 로직
    // ==========================================
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
    }, []);

    // ==========================================
    // 3. 헬퍼 함수 (타이머 문자열 추출)
    // ==========================================
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <div className="flex w-full h-[calc(100vh-80px)] p-6 gap-6 bg-white text-black">
            
            {/* 🌟 1. 좌측: AI 아바타 영역 (회색 박스) */}
            <div className="flex-1 bg-[#e2e2e2] rounded-2xl flex flex-col items-center justify-center border border-gray-300">
                <span className="text-gray-500 text-2xl font-bold">AI 아바타 화면 영역</span>
                <span className="text-gray-400 mt-2">나중에 여기에 3D 모델이나 이미지가 들어갑니다.</span>
            </div>

            {/* 🌟 2. 우측: 컨트롤 및 카메라 영역 */}
            <div className="w-[360px] flex flex-col gap-4">
                
                {/* 타이머 및 일시정지 버튼 */}
                <div className="flex items-center justify-between">
                    {/* 타이머 (네모 박스 4개) */}
                    <div className="flex items-center gap-1.5 text-3xl font-bold">
                        <div className="w-14 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-white">{m[0]}</div>
                        <div className="w-14 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-white">{m[1]}</div>
                        <span className="mx-1 pb-1">:</span>
                        <div className="w-14 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-white">{s[0]}</div>
                        <div className="w-14 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-white">{s[1]}</div>
                    </div>
                    
                    {/* 일시정지 버튼 (동그라미) */}
                    <button 
                        onClick={() => setIsPaused(true)}
                        className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition-colors"
                    >
                        {/* 일시정지(⏸) 아이콘을 두 개의 선으로 예쁘게 표현 */}
                        <div className="flex gap-1.5">
                            <div className="w-2 h-6 bg-black rounded-sm"></div>
                            <div className="w-2 h-6 bg-black rounded-sm"></div>
                        </div>
                    </button>
                </div>

                {/* 사용자 카메라 (파란 박스 위치) */}
                <div className="w-full aspect-[4/3] bg-[#4a86e8] rounded-xl overflow-hidden relative border-2 border-black shadow-sm">
                    <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover transform -scale-x-100" 
                        autoPlay playsInline muted
                    ></video>
                </div>

                {/* 분석 상태 텍스트 & 프로그래스 바 */}
                <div className="flex flex-col gap-2 mt-2 px-1">
                    <div className="flex justify-between items-center">
                        <span className={`text-sm font-bold ${statusClass}`}>{statusText}</span>
                        <button onClick={() => detectorRef.current.reset()} className="text-xs text-gray-500 hover:text-black font-semibold transition-colors">
                            🔄 다시 보정하기
                        </button>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* 🌟 3. 일시정지 풀스크런 모달 (회색 반투명) */}
            {isPaused && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">공부 일시정지</h2>
                        
                        <div className="flex flex-col gap-4 w-full">
                            <button 
                                onClick={() => setIsPaused(false)}
                                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors text-lg"
                            >
                                ▶ 다시 시작하기
                            </button>
                            <button 
                                onClick={() => router.push('/study/result')}
                                className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-colors text-lg"
                            >
                                ⏹ 지금 끝내기
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
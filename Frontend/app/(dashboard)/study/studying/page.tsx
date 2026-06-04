// app/(dashboard)/study/studying/page.tsx
"use client";

import { useStudyTimer } from "./hooks/useStudyTimer";
import { useAvatarVideo } from "./hooks/useAvatarVideo";
import { useAIVision } from "./hooks/useAIVision";
import { AvatarScreen } from "./components/AvatarScreen";

export default function StudyingPage() {
    // 🧩 1. 타이머 블록
    const { isPaused, setIsPaused, handleEndSession, h, m, s } = useStudyTimer();

    // 🧩 2. 아바타 비디오 블록
    const avatarProps = useAvatarVideo();

    // 🧩 3. AI 비전 카메라 블록 (카메라가 딴짓을 감지하면 avatarProps.setPendingWarning 에 전달!)
    const { videoRef, statusText, progress, statusClass, resetDetector } = useAIVision({ 
        isPaused,
        // 🚨 주의: useAIVision 훅 내부에서 AI가 "sleep" 등을 감지하면 setPendingWarning("/videos/...mp4") 를 호출하도록 연결해주셔야 합니다!
        setPendingWarning: avatarProps.setPendingWarning 
    });

    return (
        <div className="flex w-full h-[calc(100vh-80px)] p-6 gap-6 bg-white text-black">
            
            {/* 🖥️ 좌측: 아바타 스크린 (컴포넌트로 분리 완료!) */}
            <AvatarScreen videoProps={avatarProps} />

            {/* 🎛️ 우측: 컨트롤 패널 */}
            <div className="w-[360px] flex flex-col gap-4">
                
                {/* 타이머 시계 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-3xl font-bold">
                        <div className="w-14 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-white">{h[0]}</div>
                        <div className="w-14 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-white">{h[1]}</div>
                        <span className="mx-1 pb-1">:</span>
                        <div className="w-14 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-white">{m[0]}</div>
                        <div className="w-14 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-white">{m[1]}</div>
                    </div>
                    
                    <button onClick={() => setIsPaused(true)} className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition-colors">
                        <div className="flex gap-1.5">
                            <div className="w-2 h-6 bg-black rounded-sm"></div>
                            <div className="w-2 h-6 bg-black rounded-sm"></div>
                        </div>
                    </button>
                </div>

                {/* 내 얼굴 웹캠 */}
                <div className="w-full aspect-[4/3] bg-[#4a86e8] rounded-xl overflow-hidden relative border-2 border-black shadow-sm">
                    <video ref={videoRef} className="w-full h-full object-cover transform -scale-x-100" autoPlay playsInline muted />
                </div>

                {/* AI 상태 텍스트 */}
                <div className="flex flex-col gap-2 mt-2 px-1">
                    <div className="flex justify-between items-center">
                        <span className={`text-sm font-bold ${statusClass}`}>{statusText}</span>
                        <button onClick={resetDetector} className="text-xs text-gray-500 hover:text-black font-semibold transition-colors">🔄 다시 보정하기</button>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            {/* 🛑 일시정지 모달 */}
            {isPaused && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">공부 일시정지</h2>
                        <div className="flex flex-col gap-4 w-full">
                            <button onClick={() => setIsPaused(false)} className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors text-lg">▶ 다시 시작하기</button>
                            <button onClick={handleEndSession} className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-colors text-lg">⏹ 지금 끝내기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 강제 테스트 패널 (디버깅용) */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 p-3 rounded-xl shadow-lg border border-gray-300 z-40 flex gap-2">
                <div className="text-xs font-bold text-gray-500 mr-2 flex items-center">🔧 강제 테스트:</div>
                <button onClick={avatarProps.resetToDefault} className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition">기본</button>
                <button onClick={() => avatarProps.setPendingWarning("/videos/MATH/MATHSleep_1.mp4")} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs font-bold transition">졸음</button>
                <button onClick={() => avatarProps.setPendingWarning("/videos/MATH/MATHLooking_away_1.mp4")} className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded text-xs font-bold transition">딴짓</button>
            </div>

        </div>
    );
}
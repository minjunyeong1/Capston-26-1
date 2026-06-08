"use client";

import { useEffect, useRef, useState } from "react";
import { VIDEO_TIMING_CONFIG } from "../videoConfig";

export const DEFAULT_VIDEO = "/videos/DEFAULT/default.mp4";

export function useAvatarVideo() {
    const videoRefA = useRef<HTMLVideoElement>(null);
    const videoRefB = useRef<HTMLVideoElement>(null);

    const [activeVideo, setActiveVideo] = useState<'A' | 'B'>('A');
    
    const [srcA, setSrcA] = useState<string | undefined>(DEFAULT_VIDEO);
    const [srcB, setSrcB] = useState<string | undefined>(DEFAULT_VIDEO); 

    const isPlayingWarningRef = useRef<boolean>(false);
    const pendingWarningRef = useRef<string | null>(null);
    
    // 🌟 대기 시간 타이머를 저장할 Ref 추가
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null); 

    // 첫 렌더링 시 A 비디오 자동 재생 및 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        if (videoRefA.current && activeVideo === 'A') {
            videoRefA.current.play().catch(e => console.log("자동재생 대기", e));
        }
        return () => {
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        };
    }, []);

    // 1. 경고 영상 예약 (소스만 몰래 변경)
    const setPendingWarning = (videoPath: string | null) => {
        if (!videoPath || isPlayingWarningRef.current) return; 
        
        pendingWarningRef.current = videoPath;
        if (activeVideo === 'A') setSrcB(videoPath); 
        else setSrcA(videoPath); 
    };

    // 2. 비디오 로드 완료 시 (디폴트 -> 지적 영상 교체)
    const handleVideoReady = async (videoKey: 'A' | 'B') => {
        if (activeVideo !== videoKey && pendingWarningRef.current) {
            const hiddenRef = videoKey === 'A' ? videoRefA : videoRefB;
            const activeRef = activeVideo === 'A' ? videoRefA : videoRefB;

            if (hiddenRef.current && activeRef.current) {
                
                // ⏱️ 1. 대기 시간 계산 로직
                const currentTime = activeRef.current.currentTime;
                const duration = 10.0; // 디폴트 영상 길이 (10초 고정)
                const config = VIDEO_TIMING_CONFIG[pendingWarningRef.current] || { trigger: 0, return: 0 };
                const triggerTime = config.trigger;

                let waitTime = 0;
                if (triggerTime >= currentTime) {
                    waitTime = triggerTime - currentTime;
                } else {
                    waitTime = (duration - currentTime) + triggerTime;
                }

                // 🎬 2. 실제 화면 전환을 수행하는 내부 함수
                const executeSwitch = async () => {
                    try {
                        hiddenRef.current!.currentTime = 0;
                        await hiddenRef.current!.play(); 
                        
                        setTimeout(() => {
                            setActiveVideo(videoKey); 
                            isPlayingWarningRef.current = true;
                            pendingWarningRef.current = null;

                            if (activeRef.current) activeRef.current.pause();
                        }, 50); 
                    } catch (error) {
                        console.error("경고 영상 재생 실패:", error);
                        pendingWarningRef.current = null;
                        isPlayingWarningRef.current = false;
                    }
                };

                // 🚦 3. 2초 임계값 분기 처리
                if (waitTime <= 2.0 && waitTime > 0) {
                    // 2초 이내면 자연스러운 연결을 위해 타이머 설정
                    console.log(`[싱크 조절] ${waitTime.toFixed(2)}초 뒤에 개입합니다.`);
                    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
                    warningTimeoutRef.current = setTimeout(executeSwitch, waitTime * 1000);
                } else {
                    // 2초 초과면 기다리지 않고 즉시 딴짓 개입
                    console.log(`[즉시 개입] 대기 시간(${waitTime.toFixed(2)}초) 초과로 즉시 영상을 틉니다.`);
                    executeSwitch();
                }
            }
        }
    };

    // 3. 경고 영상 종료 시 (지적 영상 -> 디폴트 복귀)
    const handleVideoEnd = async (endedSrc: string | undefined) => {
        if (endedSrc && endedSrc !== DEFAULT_VIDEO) {
            const config = VIDEO_TIMING_CONFIG[endedSrc] || { trigger: 0, return: 0 };
            const nextActive = activeVideo === 'A' ? 'B' : 'A';
            const hiddenRef = nextActive === 'A' ? videoRefA : videoRefB;
            const oldRef = activeVideo === 'A' ? videoRefA : videoRefB; 
            
            if (hiddenRef.current) {
                try {
                    hiddenRef.current.currentTime = config.return;
                    await hiddenRef.current.play(); 
                    
                    setTimeout(() => {
                        setActiveVideo(nextActive); 
                        isPlayingWarningRef.current = false;
                        
                        if (oldRef.current) oldRef.current.pause();
                        
                        if (nextActive === 'A') setSrcB(DEFAULT_VIDEO); 
                        else setSrcA(DEFAULT_VIDEO);
                    }, 50); 
                    
                } catch (e) {
                    console.error("복귀 재생 실패", e);
                    isPlayingWarningRef.current = false;
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        // 필요 시 타임바 진행도 업데이트 로직
    };

    const togglePIP = async () => {
        try {
            const activeRef = activeVideo === 'A' ? videoRefA.current : videoRefB.current;
            if (activeRef) {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await activeRef.requestPictureInPicture();
                }
            }
        } catch (err) {
            console.error("PIP 오류:", err);
        }
    };
    
    // 강제 초기화 버튼용
    const resetToDefault = () => {
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current); // 타이머 안전 제거
        isPlayingWarningRef.current = false;
        pendingWarningRef.current = null;
        setActiveVideo('A');
        setSrcA(DEFAULT_VIDEO);
        setSrcB(DEFAULT_VIDEO);
        if (videoRefA.current) videoRefA.current.play().catch(e => console.log(e));
    };

    useEffect(() => {
            const activeRef = activeVideo === 'A' ? videoRefA.current : videoRefB.current;
            const hiddenRef = activeVideo === 'A' ? videoRefB.current : videoRefA.current;

            if (document.pictureInPictureElement && document.pictureInPictureElement === hiddenRef) {
                activeRef?.requestPictureInPicture().catch(err => {
                    console.error("PIP 스위칭 실패:", err);
                });
            }
        }, [activeVideo]);

    return {
        videoRefA, videoRefB, srcA, srcB, activeVideo,
        handleTimeUpdate, handleVideoEnd, togglePIP, setPendingWarning, resetToDefault,
        handleVideoReady
    };
}

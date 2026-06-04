"use client";

import { useEffect, useRef, useState } from "react";
import { VIDEO_TIMING_CONFIG } from "../videoConfig";

export const DEFAULT_VIDEO = "/videos/DEFAULT/default.mp4";

export function useAvatarVideo() {
    const videoRefA = useRef<HTMLVideoElement>(null);
    const videoRefB = useRef<HTMLVideoElement>(null);

    const [activeVideo, setActiveVideo] = useState<'A' | 'B'>('A');
    
    // 🌟 처음부터 두 비디오 모두 디폴트 영상으로 꽉 채워서 장전해 둡니다.
    const [srcA, setSrcA] = useState<string | undefined>(DEFAULT_VIDEO);
    const [srcB, setSrcB] = useState<string | undefined>(DEFAULT_VIDEO); 

    const isPlayingWarningRef = useRef<boolean>(false);
    const pendingWarningRef = useRef<string | null>(null);

    // 첫 렌더링 시 A 비디오 자동 재생
    useEffect(() => {
        if (videoRefA.current && activeVideo === 'A') {
            videoRefA.current.play().catch(e => console.log("자동재생 대기", e));
        }
    }, []);

    // 1. 경고 영상 예약 (소스만 몰래 변경하고 화면은 바꾸지 않음)
    const setPendingWarning = (videoPath: string | null) => {
        if (!videoPath || isPlayingWarningRef.current) return; 
        
        pendingWarningRef.current = videoPath;
        if (activeVideo === 'A') setSrcB(videoPath); 
        else setSrcA(videoPath); 
    };

// 2. 비디오 로드 완료 시 (디폴트 -> A영상 교체)
    const handleVideoReady = async (videoKey: 'A' | 'B') => {
        if (activeVideo !== videoKey && pendingWarningRef.current) {
            const hiddenRef = videoKey === 'A' ? videoRefA : videoRefB;
            const activeRef = activeVideo === 'A' ? videoRefA : videoRefB;

            if (hiddenRef.current) {
                try {
                    hiddenRef.current.currentTime = 0;
                    // 🌟 1. 일단 안 보이는 뒤쪽에서 영상을 재생시켜 버림!
                    await hiddenRef.current.play(); 
                    
                    // 🌟 2. 첫 프레임이 렌더링될 시간 0.05초(50ms) 확보
                    setTimeout(() => {
                        // 3. 0.05초 뒤에 앞 영상을 팍! 내려버림 (Hard Cut)
                        setActiveVideo(videoKey); 
                        isPlayingWarningRef.current = true;
                        pendingWarningRef.current = null;

                        // 화면에서 내려간 예전 영상 정지
                        if (activeRef.current) activeRef.current.pause();
                    }, 50); // <- 0.05초 딜레이

                } catch (error) {
                    console.error("경고 영상 재생 실패:", error);
                    pendingWarningRef.current = null;
                    isPlayingWarningRef.current = false;
                }
            }
        }
    };

    // 3. 경고 영상 종료 시 (A영상 -> 디폴트 복귀)
    const handleVideoEnd = async (endedSrc: string | undefined) => {
        if (endedSrc && endedSrc !== DEFAULT_VIDEO) {
            const config = VIDEO_TIMING_CONFIG[endedSrc] || { trigger: 0, return: 0 };
            const nextActive = activeVideo === 'A' ? 'B' : 'A';
            const hiddenRef = nextActive === 'A' ? videoRefA : videoRefB;
            const oldRef = activeVideo === 'A' ? videoRefA : videoRefB; 
            
            if (hiddenRef.current) {
                try {
                    hiddenRef.current.currentTime = config.return;
                    // 🌟 1. 끝난 A영상은 마지막 화면을 띄워둔 채로, 뒤에서 디폴트 영상부터 재생!
                    await hiddenRef.current.play(); 
                    
                    // 🌟 2. 0.05초 대기 (디폴트 영상 장전)
                    setTimeout(() => {
                        // 3. 0.05초 뒤에 멈춰있던 A영상을 치워버리고 디폴트 노출
                        setActiveVideo(nextActive); 
                        isPlayingWarningRef.current = false;
                        
                        if (oldRef.current) oldRef.current.pause();
                        
                        // 복귀 완료 후 소스 초기화
                        if (nextActive === 'A') setSrcB(DEFAULT_VIDEO); 
                        else setSrcA(DEFAULT_VIDEO);
                    }, 50); // <- 0.05초 딜레이
                    
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
        isPlayingWarningRef.current = false;
        pendingWarningRef.current = null;
        setActiveVideo('A');
        setSrcA(DEFAULT_VIDEO);
        setSrcB(DEFAULT_VIDEO);
        if (videoRefA.current) videoRefA.current.play().catch(e=>console.log(e));
    };

    return {
        videoRefA, videoRefB, srcA, srcB, activeVideo,
        handleTimeUpdate, handleVideoEnd, togglePIP, setPendingWarning, resetToDefault,
        handleVideoReady // 👈 AvatarScreen 컴포넌트로 넘겨줌
    };
}
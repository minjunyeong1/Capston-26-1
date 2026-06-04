// app/(dashboard)/study/studying/components/AvatarScreen.tsx
import { DEFAULT_VIDEO } from "../hooks/useAvatarVideo";
import { SyntheticEvent } from "react"; 

export function AvatarScreen({ videoProps }: { videoProps: any }) {
    const {
        videoRefA, videoRefB, srcA, srcB, activeVideo,
        handleTimeUpdate, handleVideoEnd, togglePIP,
        handleVideoReady
    } = videoProps;

    const preventPauseInPIP = (e: SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (document.pictureInPictureElement === video) {
            video.play().catch(err => console.log("PIP 강제 재생 에러:", err));
        }
    };

    return (
        <div className="flex-1 bg-black rounded-2xl flex flex-col items-center justify-center border border-gray-300 relative overflow-hidden group">
            {/* 🌟 transition, duration 싹 빼고 즉각적인 스위칭(Cut)으로 변경 */}
            <video 
                ref={videoRefA} src={srcA || undefined} loop={srcA === DEFAULT_VIDEO} playsInline
                onTimeUpdate={activeVideo === 'A' ? handleTimeUpdate : undefined}
                onEnded={() => handleVideoEnd(srcA)}
                onLoadedData={() => handleVideoReady('A')} 
                onPause={preventPauseInPIP} 
                className={`absolute inset-0 w-full h-full object-contain ${activeVideo === 'A' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
            />
            <video 
                ref={videoRefB} src={srcB || undefined} loop={srcB === DEFAULT_VIDEO} playsInline
                onTimeUpdate={activeVideo === 'B' ? handleTimeUpdate : undefined}
                onEnded={() => handleVideoEnd(srcB)}
                onLoadedData={() => handleVideoReady('B')} 
                onPause={preventPauseInPIP} 
                className={`absolute inset-0 w-full h-full object-contain ${activeVideo === 'B' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
            />
            
            <button 
                onClick={togglePIP}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-lg backdrop-blur-sm transition opacity-0 group-hover:opacity-100 text-white text-sm z-50"
            >
                PIP 모드
            </button>
        </div>
    );
}
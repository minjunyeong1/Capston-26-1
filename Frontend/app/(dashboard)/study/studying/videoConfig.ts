// app/(dashboard)/study/studying/videoConfig.ts

export interface VideoTiming {
  trigger: number; // 디폴트 영상에서 개입 영상이 틀어지는 시점(초)
  return: number;  // 개입 영상이 끝난 후 돌아올 디폴트 영상의 시점(초)
}

// 🌟 회원님이 정리해주신 기획안을 바탕으로 매핑된 시간표
export const VIDEO_TIMING_CONFIG: Record<string, VideoTiming> = {
  // ==================== [ MATH ] ====================
  "/videos/MATH/MATHLooking_away_1.mp4": { trigger: 1.0, return: 1.0 },
  "/videos/MATH/MATHLooking_away_2.mp4": { trigger: 2.0, return: 2.0 },
  "/videos/MATH/MATHLooking_away_3.mp4": { trigger: 3.0, return: 3.0 },
  "/videos/MATH/MATHLooking_away_4.mp4": { trigger: 1.0, return: 2.0 },
  "/videos/MATH/MATHLooking_away_5.mp4": { trigger: 2.0, return: 2.0 },
  
  "/videos/MATH/MATHSleep_1.mp4": { trigger: 3.0, return: 1.0 },
  "/videos/MATH/MATHSleep_2.mp4": { trigger: 2.0, return: 1.0 },
  "/videos/MATH/MATHSleep_3.mp4": { trigger: 3.0, return: 0.0 },
  "/videos/MATH/MATHSleep_4.mp4": { trigger: 1.0, return: 1.0 },

  // ==================== [ THINK ] ====================
  "/videos/THINK/THINKLooking_away_1.mp4": { trigger: 3.0, return: 0.0 },
  "/videos/THINK/THINKLooking_away_2.mp4": { trigger: 1.0, return: 2.0 },
  "/videos/THINK/THINKLooking_away_3.mp4": { trigger: 2.0, return: 0.0 },
  "/videos/THINK/THINKLooking_away_4.mp4": { trigger: 1.0, return: 4.0 },
  "/videos/THINK/THINKLooking_away_5.mp4": { trigger: 2.0, return: 2.0 },
  "/videos/THINK/THINKLooking_away_6.mp4": { trigger: 2.0, return: 2.0 }, 
  "/videos/THINK/THINKLooking_away_7.mp4": { trigger: 1.0, return: 2.0 },
  "/videos/THINK/THINKLooking_away_8.mp4": { trigger: 3.0, return: 0.0 },

  "/videos/THINK/THINKSleep_1.mp4": { trigger: 2.0, return: 0.0 },
  "/videos/THINK/THINKSleep_2.mp4": { trigger: 1.0, return: 1.0 },
  "/videos/THINK/THINKSleep_3.mp4": { trigger: 2.0, return: 1.0 },

  // ==================== [ MEM ] ====================
  "/videos/MEM/MEMLooking_away_1.mp4": { trigger: 1.0, return: 2.0 },
  "/videos/MEM/MEMLooking_away_2.mp4": { trigger: 2.0, return: 2.0 },
  "/videos/MEM/MEMLooking_away_3.mp4": { trigger: 3.0, return: 2.0 },
  "/videos/MEM/MEMLooking_away_4.mp4": { trigger: 1.0, return: 1.0 },
  "/videos/MEM/MEMLooking_away_5.mp4": { trigger: 1.0, return: 3.0 },
  "/videos/MEM/MEMLooking_away_6.mp4": { trigger: 2.0, return: 2.0 },
  "/videos/MEM/MEMLooking_away_7.mp4": { trigger: 3.0, return: 2.0 },

  "/videos/MEM/MEMSleep_1.mp4": { trigger: 2.0, return: 1.0 },
  "/videos/MEM/MEMSleep_2.mp4": { trigger: 1.0, return: 1.0 },
  "/videos/MEM/MEMSleep_3.mp4": { trigger: 3.0, return: 3.0 },
  "/videos/MEM/MEMSleep_4.mp4": { trigger: 1.0, return: 0.0 },

  // ==================== [ LANG ] ====================
  "/videos/LANG/LANGLooking_away_1.mp4": { trigger: 3.0, return: 2.0 },
  "/videos/LANG/LANGLooking_away_2.mp4": { trigger: 3.0, return: 2.0 },
  "/videos/LANG/LANGLooking_away_3.mp4": { trigger: 3.0, return: 2.0 },
  "/videos/LANG/LANGLooking_away_4.mp4": { trigger: 1.0, return: 8.0 }, 
  "/videos/LANG/LANGLooking_away_5.mp4": { trigger: 3.0, return: 0.0 },
  "/videos/LANG/LANGLooking_away_6.mp4": { trigger: 3.0, return: 2.0 },
  "/videos/LANG/LANGLooking_away_7.mp4": { trigger: 3.0, return: 1.0 },
  "/videos/LANG/LANGLooking_away_8.mp4": { trigger: 0.0, return: 0.0 },

  "/videos/LANG/LANGSleep_1.mp4": { trigger: 3.0, return: 3.0 },
  "/videos/LANG/LANGSleep_2.mp4": { trigger: 1.0, return: 2.0 },
  "/videos/LANG/LANGSleep_3.mp4": { trigger: 4.0, return: 6.0 },
  "/videos/LANG/LANGSleep_4.mp4": { trigger: 1.0, return: 0.0 },
};
// app/(dashboard)/study/studying/videoConfig.ts

export interface VideoTiming {
  trigger: number; 
  return: number;  
}

export const VIDEO_TIMING_CONFIG: Record<string, VideoTiming> = {
  // ==================== [ MATH ] ====================
  "/videos/MATH/MATHLooking_away_1.mp4": { trigger: 1.0, return: 1.0 },
  "/videos/MATH/MATHLooking_away_2.mp4": { trigger: 1.86, return: 1.0 },
  "/videos/MATH/MATHLooking_away_3.mp4": { trigger: 1.6, return: 3.0 },
  "/videos/MATH/MATHLooking_away_4.mp4": { trigger: 1.0, return: 2.2 },
  "/videos/MATH/MATHLooking_away_5.mp4": { trigger: 2.0, return: 1.6 },
  
  "/videos/MATH/MATHSleep_1.mp4": { trigger: 3.0, return: 1.0 },
  "/videos/MATH/MATHSleep_2.mp4": { trigger: 1.0, return: 1.0 },
  "/videos/MATH/MATHSleep_3.mp4": { trigger: 1.0, return: 0.0 },
  "/videos/MATH/MATHSleep_4.mp4": { trigger: 1.85, return: 1.0 },

  // ==================== [ THINK ] ====================
  "/videos/THINK/THINKLooking_away_1.mp4": { trigger: 1.87, return: 0.0 },
  "/videos/THINK/THINKLooking_away_2.mp4": { trigger: 2.0, return: 1.5 },
  "/videos/THINK/THINKLooking_away_3.mp4": { trigger: 1.7, return: 0.0 },
  "/videos/THINK/THINKLooking_away_4.mp4": { trigger: 1.0, return: 2.6 },
  "/videos/THINK/THINKLooking_away_5.mp4": { trigger: 1.6, return: 1.6 },
  "/videos/THINK/THINKLooking_away_6.mp4": { trigger: 1.6, return: 1.6 }, 
  "/videos/THINK/THINKLooking_away_7.mp4": { trigger: 1.0, return: 1.6 },
  "/videos/THINK/THINKLooking_away_8.mp4": { trigger: 1.6, return: 1.6 },

  "/videos/THINK/THINKSleep_1.mp4": { trigger: 1.6, return: 2.0 },
  "/videos/THINK/THINKSleep_2.mp4": { trigger: 1.0, return: 1.6 },
  "/videos/THINK/THINKSleep_3.mp4": { trigger: 1.6, return: 1.6 },

  // ==================== [ MEM ] ====================
  "/videos/MEM/MEMLooking_away_1.mp4": { trigger: 1.0, return: 1.9 },
  "/videos/MEM/MEMLooking_away_2.mp4": { trigger: 2.0, return: 1.6 },
  "/videos/MEM/MEMLooking_away_3.mp4": { trigger: 3.0, return: 1.6 },
  "/videos/MEM/MEMLooking_away_4.mp4": { trigger: 1.0, return: 1.6 },
  "/videos/MEM/MEMLooking_away_5.mp4": { trigger: 2.0, return: 1.6 },
  "/videos/MEM/MEMLooking_away_6.mp4": { trigger: 2.0, return: 1.8 },
  "/videos/MEM/MEMLooking_away_7.mp4": { trigger: 3.0, return: 2.0 },

  "/videos/MEM/MEMSleep_1.mp4": { trigger: 1.6, return: 1.6 },
  "/videos/MEM/MEMSleep_2.mp4": { trigger: 1.6, return: 1.6 },
  "/videos/MEM/MEMSleep_3.mp4": { trigger: 1.6, return: 2.0 },
  "/videos/MEM/MEMSleep_4.mp4": { trigger: 1.9, return: 1.6 },

  // ==================== [ LANG ] ====================
  "/videos/LANG/LANGLooking_away_1.mp4": { trigger: 1.6, return: 1.6 },
  "/videos/LANG/LANGLooking_away_2.mp4": { trigger: 1.6, return: 1.6 },
  "/videos/LANG/LANGLooking_away_3.mp4": { trigger: 1.6, return: 1.9 },
  "/videos/LANG/LANGLooking_away_4.mp4": { trigger: 1.8, return: 1.6 }, 
  "/videos/LANG/LANGLooking_away_5.mp4": { trigger: 1.8, return: 1.6 },
  "/videos/LANG/LANGLooking_away_6.mp4": { trigger: 1.6, return: 1.6 },
  "/videos/LANG/LANGLooking_away_7.mp4": { trigger: 1.8, return: 1.6 },
  "/videos/LANG/LANGLooking_away_8.mp4": { trigger: 2.0, return: 1.6 },

  "/videos/LANG/LANGSleep_1.mp4": { trigger: 1.6, return: 1.6 },
  "/videos/LANG/LANGSleep_2.mp4": { trigger: 2.0, return: 1.6 },
  "/videos/LANG/LANGSleep_3.mp4": { trigger: 1.6, return: 1.6 },
  "/videos/LANG/LANGSleep_4.mp4": { trigger: 1.6, return: 1.6 },
};
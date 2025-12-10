// ========================================
// TODAY FEATURE TYPES
// ========================================

export type IsoDateString = string; // '2025-12-09'

export interface DailyInputs {
  date: IsoDateString;
  workoutCompletion: number;
  mealsLoggedCompletion: number;
  hydrationCompletion: number;
  moodScore: number;
  sleepCompletion: number;
  recoveryModifier?: number;
}

export interface DailyScoreResult {
  date: IsoDateString;
  rawScore: number;
  score: number; // 0-100
  breakdown: {
    workout: number;
    meals: number;
    hydration: number;
    mood: number;
    sleep: number;
    recoveryModifier?: number;
  };
}

export interface DailyHistoryScore {
  date: string;
  score: number;
  frozenDay?: boolean; // true if streak freeze was used
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  freezesUsed: number;
  freezesRemaining: number;
  lastActiveDate: string | null;
}

export type NudgeType = "info" | "warning" | "success" | "reminder";

export interface NudgeMessage {
  type: NudgeType;
  message: string;
}

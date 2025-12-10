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
  scoreVersion: number; // Algorithm version (currently 1)
  dataCoverage: number; // 0-1 representing how much data we had
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

// Re-export SubscriptionTier from subscription hook for convenience
export type { SubscriptionTier } from "@/hooks/subscription/useSubscription";

// ---------- ONBOARDING CHALLENGE TYPES ----------

export interface OnboardingChallengeStatus {
  isInOnboardingWindow: boolean; // true = user is in their first 7 active days
  currentDayIndex: number;       // 0..6 within the window
  completedDays: number;         // # of days with score >= threshold
  requiredDaysToWin: number;     // threshold to "win" onboarding (e.g. 5 of 7)
  isCompleted: boolean;          // true if challenge won
  isFailed: boolean;             // true if window passed & not completed
  thresholdScore: number;        // min score to count as a "good" day
}

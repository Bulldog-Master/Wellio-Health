// ========================================
// DERIVE ONBOARDING CHALLENGE STATUS
// Computed from behavior history only - no new tables required
// ========================================

import type { DailyHistoryScore, OnboardingChallengeStatus } from "../types";

interface DeriveOnboardingChallengeOptions {
  history: DailyHistoryScore[];
  todayIso: string; // yyyy-mm-dd
  thresholdScore?: number;      // default 50
  requiredDaysToWin?: number;   // default 5
}

/**
 * Derives onboarding challenge status from history.
 * "Onboarding window" = first 7 days where the user has any scores.
 * No database flags needed - computed purely from behavior.
 */
export function deriveOnboardingChallengeStatus({
  history,
  todayIso,
  thresholdScore = 50,
  requiredDaysToWin = 5,
}: DeriveOnboardingChallengeOptions): OnboardingChallengeStatus {
  // No history = day 0 of onboarding
  if (!history || history.length === 0) {
    return {
      isInOnboardingWindow: true,
      currentDayIndex: 0,
      completedDays: 0,
      requiredDaysToWin,
      isCompleted: false,
      isFailed: false,
      thresholdScore,
    };
  }

  // Find first day where user has any score (assume history sorted oldest → newest)
  const firstActiveDate = history[0].date;
  const todayDate = new Date(todayIso + "T00:00:00");
  const firstDate = new Date(firstActiveDate + "T00:00:00");

  const diffMs = todayDate.getTime() - firstDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const windowLength = 7;
  const isInOnboardingWindow = diffDays < windowLength;

  // Get days within the onboarding window [firstActiveDate, firstActiveDate+6]
  const windowDays: DailyHistoryScore[] = history.filter((h) => {
    const d = new Date(h.date + "T00:00:00");
    const offset = Math.floor(
      (d.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return offset >= 0 && offset < windowLength;
  });

  const completedDays = windowDays.filter(
    (h) => h.score >= thresholdScore
  ).length;

  const isCompleted = completedDays >= requiredDaysToWin;
  const isFailed = !isInOnboardingWindow && !isCompleted;

  const currentDayIndex = Math.max(0, Math.min(diffDays, windowLength - 1));

  return {
    isInOnboardingWindow,
    currentDayIndex,
    completedDays,
    requiredDaysToWin,
    isCompleted,
    isFailed,
    thresholdScore,
  };
}

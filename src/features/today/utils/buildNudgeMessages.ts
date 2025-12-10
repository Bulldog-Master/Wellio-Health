// ========================================
// BUILD NUDGE MESSAGES - Behavioral micro-notifications
// ========================================

import type { DailyScoreResult, DailyHistoryScore, StreakInfo, NudgeMessage } from "../types";

interface BuildNudgeMessagesOptions {
  todayScore: DailyScoreResult;
  history: DailyHistoryScore[];
  streakInfo: StreakInfo;
  minScoreForStreak: number;
}

export function buildNudgeMessages({
  todayScore,
  history,
  streakInfo,
  minScoreForStreak,
}: BuildNudgeMessagesOptions): NudgeMessage[] {
  const nudges: NudgeMessage[] = [];
  const { score, breakdown } = todayScore;
  const { currentStreak, freezesRemaining } = streakInfo;

  // 1. Streak at risk
  if (score < minScoreForStreak && currentStreak > 0) {
    const pointsNeeded = minScoreForStreak - score;
    nudges.push({
      type: "warning",
      message: `Your streak is at risk! ${pointsNeeded} more points needed to keep your ${currentStreak}-day streak alive.`,
    });
  }

  // 2. Streak milestone celebration
  if (currentStreak === 7) {
    nudges.push({
      type: "success",
      message: "Amazing! You've hit a 7-day streak! Keep the momentum going! 🔥",
    });
  } else if (currentStreak === 14) {
    nudges.push({
      type: "success",
      message: "Two weeks strong! Your consistency is paying off! 💪",
    });
  } else if (currentStreak === 30) {
    nudges.push({
      type: "success",
      message: "30-day streak achieved! You're building lasting habits! 🏆",
    });
  }

  // 3. Low category suggestions
  if (breakdown.workout < 0.5) {
    nudges.push({
      type: "reminder",
      message: "Haven't logged a workout today. Even 10 minutes counts!",
    });
  }

  if (breakdown.meals < 0.33) {
    nudges.push({
      type: "reminder",
      message: "Log your meals to track nutrition and boost your score.",
    });
  }

  if (breakdown.hydration < 0.5) {
    nudges.push({
      type: "info",
      message: "Remember to stay hydrated! Log your water intake.",
    });
  }

  // 4. Freeze reminder
  if (score < minScoreForStreak && freezesRemaining > 0 && currentStreak > 2) {
    nudges.push({
      type: "info",
      message: `If you can't complete today, you have ${freezesRemaining} streak freeze${freezesRemaining > 1 ? "s" : ""} available.`,
    });
  }

  // 5. Trend-based nudges
  if (history.length >= 3) {
    const recent3 = history.slice(-3);
    const avgRecent = recent3.reduce((sum, h) => sum + h.score, 0) / 3;
    const older = history.slice(0, -3);
    
    if (older.length > 0) {
      const avgOlder = older.reduce((sum, h) => sum + h.score, 0) / older.length;
      
      if (avgRecent > avgOlder + 10) {
        nudges.push({
          type: "success",
          message: "Your scores are trending up! Great progress this week!",
        });
      } else if (avgRecent < avgOlder - 15) {
        nudges.push({
          type: "info",
          message: "Your scores dipped recently. Small steps today can turn it around.",
        });
      }
    }
  }

  // 6. Perfect day celebration
  if (score >= 90) {
    nudges.push({
      type: "success",
      message: "Outstanding day! You're crushing it! 🌟",
    });
  }

  // Limit to 3 nudges max to avoid overwhelm
  return nudges.slice(0, 3);
}

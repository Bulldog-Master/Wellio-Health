// ========================================
// BUILD NUDGE MESSAGES - Behavioral micro-notifications
// Now tier-aware with onboarding support
// ========================================

import type { 
  DailyScoreResult, 
  DailyHistoryScore, 
  StreakInfo, 
  NudgeMessage,
  OnboardingChallengeStatus,
  SubscriptionTier,
} from "../types";

interface BuildNudgeMessagesOptions {
  todayScore: DailyScoreResult;
  history: DailyHistoryScore[];
  streakInfo: StreakInfo;
  minScoreForStreak: number;
  subscriptionTier?: SubscriptionTier;
  onboardingStatus?: OnboardingChallengeStatus;
}

export function buildNudgeMessages({
  todayScore,
  history,
  streakInfo,
  minScoreForStreak,
  subscriptionTier = "free",
  onboardingStatus,
}: BuildNudgeMessagesOptions): NudgeMessage[] {
  const nudges: NudgeMessage[] = [];
  const { score, breakdown } = todayScore;
  const { currentStreak, freezesRemaining } = streakInfo;

  // Calculate 7-day average and trend
  const last7Avg =
    history.length === 0
      ? score
      : Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length);

  const trend =
    history.length >= 2 &&
    history[history.length - 1].score > history[0].score
      ? "up"
      : history.length >= 2 &&
        history[history.length - 1].score < history[0].score
      ? "down"
      : "flat";

  // 1. Onboarding nudges (first 7 active days)
  if (onboardingStatus && onboardingStatus.isInOnboardingWindow) {
    if (onboardingStatus.completedDays === 0) {
      nudges.push({
        type: "info",
        message: "This week is about starting, not perfection. One small action today completes your first step.",
      });
    } else if (!onboardingStatus.isCompleted) {
      nudges.push({
        type: "success",
        message: `You've already banked ${onboardingStatus.completedDays} good day${
          onboardingStatus.completedDays === 1 ? "" : "s"
        } in your first week. Let's add one more today.`,
      });
    } else {
      nudges.push({
        type: "success",
        message: "You nailed your first-week challenge — now we shift to longer streaks at your pace.",
      });
    }
  }

  // 2. Streak-related nudges
  if (currentStreak >= 3) {
    nudges.push({
      type: "success",
      message: `You're on a ${currentStreak}-day streak. Protect it with one small win today.`,
    });
  } else if (currentStreak === 1) {
    nudges.push({
      type: "info",
      message: "Nice start — day 1 is always the hardest. Let's build on it.",
    });
  } else if (currentStreak === 0) {
    nudges.push({
      type: "info",
      message: "No streak yet — one tiny action today is enough to begin.",
    });
  }

  // Streak milestone celebrations
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

  // 3. Streak at risk warning
  if (score < minScoreForStreak && currentStreak > 0) {
    const pointsNeeded = minScoreForStreak - score;
    nudges.push({
      type: "warning",
      message: `Your streak is at risk! ${pointsNeeded} more points needed to keep your ${currentStreak}-day streak alive.`,
    });
  }

  // 4. Freeze reminder
  if (score < minScoreForStreak && freezesRemaining > 0 && currentStreak > 2) {
    nudges.push({
      type: "info",
      message: `If you can't complete today, you have ${freezesRemaining} streak freeze${freezesRemaining > 1 ? "s" : ""} available.`,
    });
  }

  // 5. Score-level nudges
  if (score >= 90) {
    nudges.push({
      type: "success",
      message: "Outstanding day! You're crushing it! 🌟",
    });
  } else if (score >= 80) {
    nudges.push({
      type: "success",
      message: "You're having a strong day. Great time to push a little further.",
    });
  } else if (score >= 60) {
    nudges.push({
      type: "info",
      message: "Solid work today — a couple of small actions can push this into a great day.",
    });
  } else if (score <= 40) {
    nudges.push({
      type: "info",
      message: "Today looks a bit rough, and that's okay. One simple action (walk, water, or meal) is enough.",
    });
  }

  // 6. Low category suggestions
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

  // 7. Trend-based nudges (Pro gets more depth)
  if (trend === "up" && last7Avg >= minScoreForStreak) {
    nudges.push({
      type: "success",
      message: subscriptionTier === "free"
        ? "Your recent momentum is strong — consistency like this really pays off."
        : "Your 7-day trend is climbing. Pro insights can help fine-tune which habits deliver the biggest gains.",
    });
  } else if (trend === "down") {
    nudges.push({
      type: "info",
      message: subscriptionTier === "free"
        ? "Scores are dipping a bit — focus on one easy win to turn it around."
        : "Scores have slipped slightly. Pro mode can suggest which habit to prioritize to bounce back fastest.",
    });
  }

  // 8. Pro-only deeper nudges (natural upsell without being pushy)
  if (subscriptionTier === "pro" || subscriptionTier === "enterprise") {
    nudges.push({
      type: "info",
      message: "Pro gives you richer insight into which habits are moving your score most — you're already using that edge.",
    });
  } else if (subscriptionTier === "free" && currentStreak >= 3) {
    // Only show upsell hint to users who have proven consistency
    nudges.push({
      type: "info",
      message: "Pro unlocks deeper pattern analysis and tailored planning — consider it once your streak feels solid.",
    });
  }

  // De-duplicate while preserving order
  const seen = new Set<string>();
  const unique = nudges.filter((n) => {
    if (seen.has(n.message)) return false;
    seen.add(n.message);
    return true;
  });

  // Limit to 3 nudges max to avoid overwhelm
  return unique.slice(0, 3);
}

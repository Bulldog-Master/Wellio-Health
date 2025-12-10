/**
 * Functional Wellness Index (FWI) Engine
 * Shared utility for calculating wellness scores and adherence metrics
 * Used by both individual user app and clinician/coach dashboards
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DailyInputs {
  workoutCompleted: boolean;
  workoutDurationMinutes?: number;
  hydrationOz: number;
  moodScore: number; // 1-5
  sleepHours: number;
  mealsLogged: number;
}

export interface FWIResult {
  score: number; // 0-100
  breakdown: {
    workout: number;
    hydration: number;
    mood: number;
    sleep: number;
  };
  coverage: number; // 0-1 data completeness
}

export interface AdherenceMetrics {
  sleepAdherence: number; // 0-1
  hydrationAdherence: number; // 0-1
  mealsAdherence: number; // 0-1
  activityAdherence: number; // 0-1
  moodAdherence: number; // 0-1
}

export interface AdherenceFlags {
  lowSleep: boolean;
  lowHydration: boolean;
  lowMeals: boolean;
  lowActivity: boolean;
  lowMood: boolean;
}

export interface TrendData {
  direction: 'improving' | 'declining' | 'stable';
  percentChange: number;
  recentAvg: number;
  previousAvg: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  freezeUsed: boolean;
  strictStreak: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const FWI_WEIGHTS = {
  workout: 0.40,
  hydration: 0.20,
  mood: 0.25,
  sleep: 0.15,
} as const;

export const ADHERENCE_THRESHOLDS = {
  sleep: { good: 7, minimum: 5 },
  hydration: { good: 64, minimum: 32 }, // oz
  meals: { good: 3, minimum: 1 },
  workout: { goodMinutes: 30, minimum: 1 }, // boolean or minutes
  mood: { good: 4, minimum: 2 },
} as const;

export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  poor: 0,
} as const;

// ============================================================================
// CORE CALCULATIONS
// ============================================================================

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate workout score (0-100)
 */
export function calculateWorkoutScore(completed: boolean, durationMinutes?: number): number {
  if (!completed) return 0;
  if (!durationMinutes) return 70; // Completed but no duration = partial credit
  
  // 30+ minutes = 100%, scale down from there
  return clamp((durationMinutes / 30) * 100, 0, 100);
}

/**
 * Calculate hydration score (0-100)
 */
export function calculateHydrationScore(oz: number): number {
  const { good, minimum } = ADHERENCE_THRESHOLDS.hydration;
  if (oz >= good) return 100;
  if (oz <= 0) return 0;
  return clamp((oz / good) * 100, 0, 100);
}

/**
 * Calculate mood score (0-100)
 */
export function calculateMoodScore(rating: number): number {
  // Convert 1-5 scale to 0-100
  return clamp(((rating - 1) / 4) * 100, 0, 100);
}

/**
 * Calculate sleep score (0-100)
 */
export function calculateSleepScore(hours: number): number {
  const { good, minimum } = ADHERENCE_THRESHOLDS.sleep;
  
  // Optimal is 7-9 hours
  if (hours >= 7 && hours <= 9) return 100;
  if (hours < minimum) return clamp((hours / minimum) * 50, 0, 50);
  if (hours > 9) return clamp(100 - ((hours - 9) * 10), 70, 100);
  
  return clamp((hours / good) * 100, 0, 100);
}

/**
 * Calculate data coverage (how complete is today's data)
 */
export function calculateCoverage(inputs: Partial<DailyInputs>): number {
  const fields = [
    inputs.workoutCompleted !== undefined,
    inputs.hydrationOz !== undefined && inputs.hydrationOz > 0,
    inputs.moodScore !== undefined && inputs.moodScore > 0,
    inputs.sleepHours !== undefined && inputs.sleepHours > 0,
  ];
  
  const filledFields = fields.filter(Boolean).length;
  return filledFields / fields.length;
}

/**
 * Calculate the complete Functional Wellness Index
 */
export function calculateFWI(inputs: DailyInputs): FWIResult {
  const breakdown = {
    workout: calculateWorkoutScore(inputs.workoutCompleted, inputs.workoutDurationMinutes),
    hydration: calculateHydrationScore(inputs.hydrationOz),
    mood: calculateMoodScore(inputs.moodScore),
    sleep: calculateSleepScore(inputs.sleepHours),
  };
  
  const score = clamp(
    breakdown.workout * FWI_WEIGHTS.workout +
    breakdown.hydration * FWI_WEIGHTS.hydration +
    breakdown.mood * FWI_WEIGHTS.mood +
    breakdown.sleep * FWI_WEIGHTS.sleep,
    0,
    100
  );
  
  const coverage = calculateCoverage(inputs);
  
  return {
    score: Math.round(score),
    breakdown,
    coverage,
  };
}

// ============================================================================
// ADHERENCE CALCULATIONS
// ============================================================================

/**
 * Calculate adherence metrics from daily scores data
 */
export function calculateAdherence(dailyScores: Array<{
  sleep_completion?: number | null;
  hydration_completion?: number | null;
  meals_completion?: number | null;
  workout_completion?: number | null;
  mood_score?: number | null;
}>): AdherenceMetrics {
  if (dailyScores.length === 0) {
    return {
      sleepAdherence: 0,
      hydrationAdherence: 0,
      mealsAdherence: 0,
      activityAdherence: 0,
      moodAdherence: 0,
    };
  }

  const sum = (arr: (number | null | undefined)[]) => 
    arr.reduce((acc: number, val) => acc + (val ?? 0), 0);
  
  const count = dailyScores.length;

  return {
    sleepAdherence: clamp(sum(dailyScores.map(s => s.sleep_completion)) / count / 100, 0, 1),
    hydrationAdherence: clamp(sum(dailyScores.map(s => s.hydration_completion)) / count / 100, 0, 1),
    mealsAdherence: clamp(sum(dailyScores.map(s => s.meals_completion)) / count / 100, 0, 1),
    activityAdherence: clamp(sum(dailyScores.map(s => s.workout_completion)) / count / 100, 0, 1),
    moodAdherence: clamp(sum(dailyScores.map(s => s.mood_score)) / count / 5, 0, 1),
  };
}

/**
 * Generate adherence flags based on thresholds
 */
export function generateAdherenceFlags(metrics: AdherenceMetrics): AdherenceFlags {
  const threshold = 0.5; // Below 50% triggers a flag
  
  return {
    lowSleep: metrics.sleepAdherence < threshold,
    lowHydration: metrics.hydrationAdherence < threshold,
    lowMeals: metrics.mealsAdherence < threshold,
    lowActivity: metrics.activityAdherence < threshold,
    lowMood: metrics.moodAdherence < threshold,
  };
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Calculate trend direction by comparing recent vs previous period
 */
export function calculateTrend(
  scores: number[],
  recentDays: number = 7,
  previousDays: number = 7
): TrendData {
  if (scores.length === 0) {
    return {
      direction: 'stable',
      percentChange: 0,
      recentAvg: 0,
      previousAvg: 0,
    };
  }

  const recentScores = scores.slice(0, recentDays);
  const previousScores = scores.slice(recentDays, recentDays + previousDays);

  const recentAvg = recentScores.length > 0
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    : 0;
  
  const previousAvg = previousScores.length > 0
    ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length
    : recentAvg;

  const percentChange = previousAvg > 0
    ? ((recentAvg - previousAvg) / previousAvg) * 100
    : 0;

  let direction: 'improving' | 'declining' | 'stable';
  if (percentChange > 5) {
    direction = 'improving';
  } else if (percentChange < -5) {
    direction = 'declining';
  } else {
    direction = 'stable';
  }

  return {
    direction,
    percentChange: Math.round(percentChange * 10) / 10,
    recentAvg: Math.round(recentAvg),
    previousAvg: Math.round(previousAvg),
  };
}

// ============================================================================
// STREAK CALCULATIONS
// ============================================================================

/**
 * Calculate streak data with freeze support
 */
export function calculateStreak(
  dailyScores: Array<{ score: number; streak_frozen?: boolean }>,
  goodScoreThreshold: number = SCORE_THRESHOLDS.good
): StreakData {
  let currentStreak = 0;
  let strictStreak = 0;
  let freezeUsed = false;
  let longestStreak = 0;

  // Calculate current streak (with freeze)
  for (let i = 0; i < dailyScores.length; i++) {
    const day = dailyScores[i];
    const isGoodDay = day.score >= goodScoreThreshold;
    const isFrozen = day.streak_frozen === true;

    if (isGoodDay) {
      currentStreak++;
      strictStreak++;
    } else if (isFrozen && currentStreak > 0) {
      currentStreak++; // Freeze protects the streak
      freezeUsed = true;
      // Strict streak breaks
    } else {
      break;
    }
  }

  // Calculate longest streak from historical data
  let tempStreak = 0;
  for (const day of dailyScores) {
    if (day.score >= goodScoreThreshold || day.streak_frozen) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    freezeUsed,
    strictStreak,
  };
}

// ============================================================================
// NUDGE GENERATION
// ============================================================================

export interface Nudge {
  type: 'celebration' | 'encouragement' | 'gentle' | 'tip';
  message: string;
  priority: number;
}

/**
 * Generate contextual nudges based on current state
 */
export function generateNudges(
  todayScore: number,
  streak: StreakData,
  trend: TrendData,
  maxNudges: number = 3
): Nudge[] {
  const nudges: Nudge[] = [];

  // Streak-based nudges
  if (streak.currentStreak >= 7) {
    nudges.push({
      type: 'celebration',
      message: `🔥 ${streak.currentStreak} day streak! You're on fire!`,
      priority: 1,
    });
  } else if (streak.currentStreak >= 3) {
    nudges.push({
      type: 'encouragement',
      message: `${streak.currentStreak} days strong! Keep it going!`,
      priority: 2,
    });
  } else if (streak.currentStreak === 1) {
    nudges.push({
      type: 'gentle',
      message: 'Day 1 of your new streak. Every journey starts somewhere.',
      priority: 3,
    });
  }

  // Freeze used
  if (streak.freezeUsed) {
    nudges.push({
      type: 'gentle',
      message: 'Your freeze saved your streak. Resilience is part of the journey.',
      priority: 4,
    });
  }

  // Score-based nudges
  if (todayScore >= SCORE_THRESHOLDS.excellent) {
    nudges.push({
      type: 'celebration',
      message: `Score of ${todayScore}! Outstanding day!`,
      priority: 1,
    });
  } else if (todayScore >= SCORE_THRESHOLDS.good) {
    nudges.push({
      type: 'encouragement',
      message: `Solid ${todayScore} today. You're building momentum.`,
      priority: 2,
    });
  } else if (todayScore < SCORE_THRESHOLDS.fair) {
    nudges.push({
      type: 'gentle',
      message: 'Tough day? Tomorrow is a fresh start.',
      priority: 5,
    });
  }

  // Trend-based nudges
  if (trend.direction === 'improving') {
    nudges.push({
      type: 'celebration',
      message: `Trending up ${trend.percentChange}% from last week!`,
      priority: 2,
    });
  } else if (trend.direction === 'declining') {
    nudges.push({
      type: 'tip',
      message: 'Small dip this week. Focus on one thing tomorrow.',
      priority: 4,
    });
  }

  // Sort by priority and limit
  return nudges
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxNudges);
}

// ============================================================================
// CLINICIAN VIEW HELPERS
// ============================================================================

/**
 * Format adherence metrics for clinician dashboard display
 */
export function formatAdherenceForClinician(metrics: AdherenceMetrics): {
  label: string;
  value: number;
  status: 'good' | 'warning' | 'concern';
}[] {
  const format = (label: string, value: number) => ({
    label,
    value: Math.round(value * 100),
    status: value >= 0.7 ? 'good' as const : value >= 0.5 ? 'warning' as const : 'concern' as const,
  });

  return [
    format('Sleep', metrics.sleepAdherence),
    format('Hydration', metrics.hydrationAdherence),
    format('Meals', metrics.mealsAdherence),
    format('Activity', metrics.activityAdherence),
    format('Mood', metrics.moodAdherence),
  ];
}

/**
 * Get score status label
 */
export function getScoreStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= SCORE_THRESHOLDS.excellent) return 'excellent';
  if (score >= SCORE_THRESHOLDS.good) return 'good';
  if (score >= SCORE_THRESHOLDS.fair) return 'fair';
  return 'poor';
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: 'excellent' | 'good' | 'fair' | 'poor' | 'warning' | 'concern'): string {
  const colors = {
    excellent: 'text-green-500',
    good: 'text-emerald-500',
    fair: 'text-yellow-500',
    poor: 'text-red-500',
    warning: 'text-yellow-500',
    concern: 'text-red-500',
  };
  return colors[status];
}

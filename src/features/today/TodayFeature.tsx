// ========================================
// WELLIO HEALTH - TODAY FEATURE MODULE
// COMPLETE HABIT LOOP IMPLEMENTATION
// ========================================

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useDailyHistoryScores, TodayHistoryCard } from "./TodayHistoryFeature";
import { StreakGoalCard, TodayNudgesCard, OnboardingChallengeCard } from "./components";
import { buildNudgeMessages, deriveOnboardingChallengeStatus } from "./utils";
import { useSubscription } from "@/hooks/subscription";
import { CareTeamBanner } from "@/features/care-team/CareTeamBanner";
import type { DailyInputs, DailyScoreResult, IsoDateString, SubscriptionTier } from "./types";

// Re-export types
export type { DailyInputs, DailyScoreResult, IsoDateString };

// ---------- SCORE COMPUTATION -----------

const WEIGHTS = {
  workout: 0.35,
  meals: 0.20,
  hydration: 0.15,
  mood: 0.20,
  sleep: 0.10,
} as const;

// Current scoring algorithm version
const SCORE_VERSION = 1;

export function computeDailyScore(inputs: DailyInputs): DailyScoreResult {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const w = WEIGHTS;

  const weighted =
    clamp(inputs.workoutCompletion) * w.workout +
    clamp(inputs.mealsLoggedCompletion) * w.meals +
    clamp(inputs.hydrationCompletion) * w.hydration +
    clamp(inputs.moodScore) * w.mood +
    clamp(inputs.sleepCompletion) * w.sleep;

  const modified = clamp(weighted + (inputs.recoveryModifier ?? 0));

  // Calculate data coverage: count how many behaviors have meaningful data (> 0)
  const behaviors = [
    inputs.workoutCompletion,
    inputs.mealsLoggedCompletion,
    inputs.hydrationCompletion,
    inputs.moodScore,
    inputs.sleepCompletion,
  ];
  const totalBehaviors = behaviors.length;
  const coveredBehaviors = behaviors.filter(v => v > 0).length;
  const dataCoverage = coveredBehaviors / totalBehaviors;

  return {
    date: inputs.date,
    rawScore: modified,
    score: Math.round(modified * 100),
    scoreVersion: SCORE_VERSION,
    dataCoverage,
    breakdown: {
      workout: clamp(inputs.workoutCompletion),
      meals: clamp(inputs.mealsLoggedCompletion),
      hydration: clamp(inputs.hydrationCompletion),
      mood: clamp(inputs.moodScore),
      sleep: clamp(inputs.sleepCompletion),
      recoveryModifier: inputs.recoveryModifier ?? 0,
    },
  };
}

// ---------- SUPABASE QUERY HOOK ---------

export function useTodayStats(userId: string, today: IsoDateString) {
  return useQuery({
    queryKey: ["todayStats", today, userId],
    enabled: !!userId,
    queryFn: async (): Promise<DailyInputs> => {
      const { data: workouts } = await supabase
        .from("activity_logs")
        .select("id")
        .eq("user_id", userId)
        .gte("logged_at", `${today}T00:00:00`)
        .lte("logged_at", `${today}T23:59:59`);

      const workoutCompletion = (workouts?.length ?? 0) > 0 ? 1 : 0;

      const { data: meals } = await supabase
        .from("nutrition_logs")
        .select("id")
        .eq("user_id", userId)
        .gte("logged_at", `${today}T00:00:00`)
        .lte("logged_at", `${today}T23:59:59`);

      const MEAL_TARGET = 3;
      const mealsLoggedCompletion = Math.min(1, (meals?.length ?? 0) / MEAL_TARGET);

      // TODO: Populate from hydration_logs, mood_logs, sleep_logs tables
      const hydrationCompletion = 0;
      const moodScore = 0.6;
      const sleepCompletion = 0;
      const recoveryModifier = 0;

      return {
        date: today,
        workoutCompletion,
        mealsLoggedCompletion,
        hydrationCompletion,
        moodScore,
        sleepCompletion,
        recoveryModifier,
      };
    },
  });
}

// ---------- UI COMPONENTS ---------------

export function TodayScoreCard({ score }: { score: DailyScoreResult }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-2">
      <p className="text-xs uppercase text-muted-foreground">Today&apos;s Score</p>
      <p className="text-4xl font-semibold">{score.score}</p>
      <Progress value={score.score} />
    </div>
  );
}

function ActionRow({
  label,
  desc,
  progress,
  onClick,
}: {
  label: string;
  desc: string;
  progress: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="w-full flex items-center justify-between border rounded-lg px-3 py-2 text-left hover:bg-accent/40"
      onClick={onClick}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <p className="text-xs">{progress}</p>
    </button>
  );
}

export function TodayActionsList(props: DailyInputs) {
  const fmt = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">Your actions today</h2>
      <ActionRow label="Workout" desc="Daily plan" progress={fmt(props.workoutCompletion)} />
      <ActionRow label="Meals" desc="Log meals" progress={fmt(props.mealsLoggedCompletion)} />
      <ActionRow label="Hydration" desc="Stay hydrated" progress={fmt(props.hydrationCompletion)} />
      <ActionRow label="Mood / Energy" desc="Self check-in" progress={fmt(props.moodScore)} />
      <ActionRow label="Sleep" desc="Last night vs goal" progress={fmt(props.sleepCompletion)} />
    </div>
  );
}

export function TodayAiInsightCard({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="rounded-xl border bg-muted/40 p-3 space-y-2">
      <p className="text-xs uppercase text-muted-foreground">AI Insight</p>
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ---------- AI PROMPT BUILDER ------------

export function buildAiInsightPrompt(score: DailyScoreResult): string {
  const b = score.breakdown;
  return `
You are a wellness coach. The data below represents a user's behavioral day summary.

Score: ${score.score}/100
Workout: ${(b.workout * 100).toFixed(0)}%
Meals Logged: ${(b.meals * 100).toFixed(0)}%
Hydration: ${(b.hydration * 100).toFixed(0)}%
Mood/Energy: ${(b.mood * 100).toFixed(0)}%
Sleep: ${(b.sleep * 100).toFixed(0)}%
${b.recoveryModifier ? `Recovery Modifier: ${b.recoveryModifier}` : ""}

Give 1–2 actionable suggestions under 80 words. No medical claims. No identity references.
`.trim();
}

// ---------- MAIN TODAY SCREEN ------------

const MIN_SCORE_FOR_STREAK = 60;

export function TodayScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  
  // Get subscription tier for tier-aware nudges
  const { tier } = useSubscription();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const { data, isLoading } = useTodayStats(user?.id ?? "", today);
  const score = useMemo(() => (data ? computeDailyScore(data) : null), [data]);
  const [aiText] = useState<string | null>(null);

  const {
    data: historyData,
    isLoading: isHistoryLoading,
  } = useDailyHistoryScores({ 
    userId: user?.id ?? "", 
    days: 7, 
    minScoreForStreak: MIN_SCORE_FOR_STREAK,
  });

  // Derive onboarding challenge status from history
  const onboardingStatus = useMemo(() => {
    if (!historyData || !score) return undefined;
    return deriveOnboardingChallengeStatus({
      history: historyData.history,
      todayIso: today,
      thresholdScore: 50,
      requiredDaysToWin: 5,
    });
  }, [historyData, score, today]);

  // Build nudge messages with tier awareness and onboarding context
  const nudgeMessages = useMemo(() => {
    if (!score || !historyData) return [];
    return buildNudgeMessages({
      todayScore: score,
      history: historyData.history,
      streakInfo: historyData.streakInfo,
      minScoreForStreak: MIN_SCORE_FOR_STREAK,
      subscriptionTier: (tier ?? "free") as SubscriptionTier,
      onboardingStatus,
    });
  }, [score, historyData, tier, onboardingStatus]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!user) return <div className="p-4">Please log in</div>;
  if (isLoading || !data || !score) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Care Team Banner - shown when connected to coach/clinician */}
      <CareTeamBanner />
      
      {/* 1. Score - "How am I doing today?" */}
      <TodayScoreCard score={score} />

      {/* 2. Actions list - "What should I do?" */}
      <TodayActionsList {...data} />

      {/* 3. Onboarding challenge - shown during first 7 active days */}
      {onboardingStatus && onboardingStatus.isInOnboardingWindow && (
        <OnboardingChallengeCard status={onboardingStatus} />
      )}

      {!isHistoryLoading && historyData && (
        <>
          {/* 4. Streak goal - "What am I working toward?" */}
          <StreakGoalCard streakInfo={historyData.streakInfo} goalDays={7} />

          {/* 5. History chart - "How have I been doing?" */}
          <TodayHistoryCard
            history={historyData.history}
            streakInfo={historyData.streakInfo}
            minScoreForStreak={MIN_SCORE_FOR_STREAK}
          />
        </>
      )}

      {/* 6. Nudges - "What's the gentle push today?" (now tier-aware) */}
      <TodayNudgesCard messages={nudgeMessages} />

      {/* 7. AI insight - "What does my private coach think?" */}
      <TodayAiInsightCard text={aiText} />
    </div>
  );
}

// ========================================
// END OF TODAY FEATURE MODULE
// ========================================

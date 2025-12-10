// ========================================
// WELLIO HEALTH - TODAY FEATURE MODULE
// ONE FILE DROP-IN VERSION
// ========================================

// This file contains:
// - Types
// - Daily Score computation
// - Supabase query hook
// - UI components (Score Card, Actions List, AI Insight card)
// - Main TodayScreen
// - AI insight prompt builder
// ========================================

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useDailyHistoryScores, TodayHistoryCard } from "./TodayHistoryFeature";

// ---------- TYPES -----------------------

export type IsoDateString = string; // '2025-12-09'

export interface DailyInputs {
  date: IsoDateString;

  workoutCompletion: number;     
  mealsLoggedCompletion: number;
  hydrationCompletion: number;   
  moodScore: number;             
  sleepCompletion: number;       

  recoveryModifier?: number;     // optional wearable boost
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

// ---------- SCORE COMPUTATION -----------

const WEIGHTS = {
  workout: 0.35,
  meals: 0.20,
  hydration: 0.15,
  mood: 0.20,
  sleep: 0.10,
} as const;

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

  return {
    date: inputs.date,
    rawScore: modified,
    score: Math.round(modified * 100),
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
      const clamp = (v: number) => Math.max(0, Math.min(1, v));

      // Workout logs - using activity_logs table (exists in schema)
      const { data: workouts } = await supabase
        .from("activity_logs")
        .select("id")
        .eq("user_id", userId)
        .gte("logged_at", `${today}T00:00:00`)
        .lte("logged_at", `${today}T23:59:59`);

      // Consider workout complete if at least one activity logged
      const workoutCompletion = (workouts?.length ?? 0) > 0 ? 1 : 0;

      // Meals - using nutrition_logs table (exists in schema)
      const { data: meals } = await supabase
        .from("nutrition_logs")
        .select("id")
        .eq("user_id", userId)
        .gte("logged_at", `${today}T00:00:00`)
        .lte("logged_at", `${today}T23:59:59`);

      const MEAL_TARGET = 3;
      const mealsLoggedCompletion = Math.min(
        1,
        (meals?.length ?? 0) / MEAL_TARGET
      );

      // TODO: These tables need to be created via migration:
      // - hydration_logs (date, user_id, total_ml, target_ml)
      // - mood_logs (date, user_id, mood_score 1-5)
      // - sleep_logs (date, user_id, hours_slept, hours_target)
      // - recovery_metrics (date, user_id, recovery_modifier)
      
      // For now, use sensible defaults
      const hydrationCompletion = 0;
      const moodScore = 0.6; // neutral default
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

export function TodayScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

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
  const [aiText] = useState<string | null>(null); // plug your AI response here

  if (loading) return <div className="p-4">Loading…</div>;
  if (!user) return <div className="p-4">Please log in</div>;
  if (isLoading || !data || !score) return <div className="p-4">Loading…</div>;

  const { data: historyData } = useDailyHistoryScores({ userId: user.id });

  return (
    <div className="p-4 space-y-4">
      <TodayScoreCard score={score} />
      {historyData && (
        <TodayHistoryCard 
          history={historyData.history} 
          streakCount={historyData.streakCount} 
        />
      )}
      <TodayActionsList {...data} />
      <TodayAiInsightCard text={aiText} />
    </div>
  );
}

// ========================================
// END OF SINGLE-FILE TODAY FEATURE MODULE
// ========================================

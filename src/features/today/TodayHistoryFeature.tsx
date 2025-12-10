// ========================================
// WELLIO HEALTH - TODAY HISTORY FEATURE
// STREAKS + 7-DAY TREND (ONE-FILE MODULE)
// ========================================

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeDailyScore, type DailyInputs } from "./TodayFeature";

export interface DailyHistoryScore {
  date: string; // ISO
  score: number; // 0-100
}

// ---------- HOOK: LAST N DAYS SCORES ----

interface UseDailyHistoryScoresOptions {
  userId: string;
  days?: number; // default 7
  minScoreForStreak?: number; // default 60
}

export function useDailyHistoryScores({
  userId,
  days = 7,
  minScoreForStreak = 60,
}: UseDailyHistoryScoresOptions) {
  return useQuery({
    queryKey: ["dailyHistoryScores", userId, days],
    enabled: !!userId,
    queryFn: async (): Promise<{
      history: DailyHistoryScore[];
      streakCount: number;
    }> => {
      // 1) Compute date range
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - (days - 1));

      const fromStr = from.toISOString().slice(0, 10);
      const toStr = today.toISOString().slice(0, 10);

      // 2) Fetch all logs in range per table
      // TODO: Create hydration_logs, mood_logs, sleep_logs, recovery_metrics tables via migration
      // For now, using activity_logs and nutrition_logs which exist

      const [workouts, meals] = await Promise.all([
        supabase
          .from("activity_logs")
          .select("logged_at, duration_minutes, user_id")
          .eq("user_id", userId)
          .gte("logged_at", fromStr)
          .lte("logged_at", toStr + "T23:59:59"),
        supabase
          .from("nutrition_logs")
          .select("logged_at, id, user_id")
          .eq("user_id", userId)
          .gte("logged_at", fromStr)
          .lte("logged_at", toStr + "T23:59:59"),
      ]);

      // Stubbed queries for non-existent tables
      const hydration = { error: null, data: [] as any[] };
      const mood = { error: null, data: [] as any[] };
      const sleep = { error: null, data: [] as any[] };
      const recovery = { error: null, data: [] as any[] };

      const clamp = (v: number) => Math.max(0, Math.min(1, v));

      // Index by date to build DailyInputs per day
      const map = new Map<string, Partial<DailyInputs>>();

      function ensureDay(date: string) {
        if (!map.has(date)) {
          map.set(date, {
            date,
            workoutCompletion: 0,
            mealsLoggedCompletion: 0,
            hydrationCompletion: 0,
            moodScore: 0.6, // neutral-ish
            sleepCompletion: 0,
            recoveryModifier: 0,
          });
        }
        return map.get(date)!;
      }

      // 2a) workouts - using activity_logs
      if (!workouts.error && workouts.data) {
        const byDate = new Map<string, number>();
        for (const w of workouts.data) {
          const d = w.logged_at ? w.logged_at.slice(0, 10) : null;
          if (d) {
            byDate.set(d, (byDate.get(d) ?? 0) + 1);
          }
        }
        for (const [date, count] of byDate.entries()) {
          const day = ensureDay(date);
          // Consider workout complete if at least one activity logged
          (day as any).workoutCompletion = count > 0 ? 1 : 0;
        }
      }

      // 2b) meals - using nutrition_logs
      if (!meals.error && meals.data) {
        const countByDate = new Map<string, number>();
        for (const m of meals.data) {
          const d = m.logged_at ? m.logged_at.slice(0, 10) : null;
          if (d) {
            countByDate.set(d, (countByDate.get(d) ?? 0) + 1);
          }
        }
        for (const [date, count] of countByDate.entries()) {
          const day = ensureDay(date);
          const MEAL_TARGET = 3;
          (day as any).mealsLoggedCompletion = clamp(count / MEAL_TARGET);
        }
      }

      // 2c) hydration (stubbed)
      if (!hydration.error && hydration.data) {
        for (const h of hydration.data) {
          const day = ensureDay(h.date);
          const consumed = h.total_ml ?? 0;
          const target = h.target_ml ?? 2000;
          (day as any).hydrationCompletion =
            target > 0 ? clamp(consumed / target) : 0;
        }
      }

      // 2d) mood (stubbed)
      if (!mood.error && mood.data) {
        for (const m of mood.data) {
          const day = ensureDay(m.date);
          const raw = m.mood_score ?? 3;
          (day as any).moodScore = clamp((raw - 1) / 4);
        }
      }

      // 2e) sleep (stubbed)
      if (!sleep.error && sleep.data) {
        for (const s of sleep.data) {
          const day = ensureDay(s.date);
          const slept = s.hours_slept ?? 0;
          const target = s.hours_target ?? 8;
          (day as any).sleepCompletion =
            target > 0 ? clamp(slept / target) : 0;
        }
      }

      // 2f) recovery (stubbed)
      if (!recovery.error && recovery.data) {
        for (const r of recovery.data) {
          const day = ensureDay(r.date);
          (day as any).recoveryModifier = r.recovery_modifier ?? 0;
        }
      }

      // 3) Build a full continuous range from fromStr → toStr
      const daysArray: string[] = [];
      for (let d = new Date(from); d <= today; d.setDate(d.getDate() + 1)) {
        daysArray.push(d.toISOString().slice(0, 10));
      }

      const history: DailyHistoryScore[] = daysArray.map((date) => {
        const base = ensureDay(date);
        const inputs: DailyInputs = {
          date,
          workoutCompletion: base.workoutCompletion ?? 0,
          mealsLoggedCompletion: base.mealsLoggedCompletion ?? 0,
          hydrationCompletion: base.hydrationCompletion ?? 0,
          moodScore: base.moodScore ?? 0.6,
          sleepCompletion: base.sleepCompletion ?? 0,
          recoveryModifier: base.recoveryModifier ?? 0,
        };
        const score = computeDailyScore(inputs);
        return { date, score: score.score };
      });

      // 4) Compute streak from history (from most recent backwards)
      let streakCount = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].score >= minScoreForStreak) streakCount++;
        else break;
      }

      return { history, streakCount };
    },
  });
}

// ---------- UI: STREAK + TREND CARD -------

function formatDateLabel(iso: string) {
  // returns e.g. "S", "M", "T" for day of week
  const d = new Date(iso + "T00:00:00");
  return "SMTWTFS"[d.getDay()];
}

export function TodayHistoryCard(props: {
  history: DailyHistoryScore[];
  streakCount: number;
}) {
  const maxScore = useMemo(
    () =>
      props.history.reduce((max, h) => (h.score > max ? h.score : max), 0) ||
      100,
    [props.history]
  );

  return (
    <div className="rounded-xl border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Streak</p>
          <p className="text-2xl font-semibold">
            {props.streakCount} day
            {props.streakCount === 1 ? "" : "s"}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Days with score ≥ 60 count towards your streak.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Last {props.history.length} days
        </p>
        <div className="flex items-end gap-1 h-16">
          {props.history.map((h) => {
            const height = (h.score / maxScore) * 100;
            return (
              <div
                key={h.date}
                className="flex flex-col items-center justify-end gap-1 flex-1"
              >
                <div
                  className="w-full rounded-t-md bg-primary/70"
                  style={{ height: `${height || 4}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {formatDateLabel(h.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========================================
// END TODAY HISTORY FEATURE
// ========================================

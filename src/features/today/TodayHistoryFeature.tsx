// ========================================
// WELLIO HEALTH - TODAY HISTORY FEATURE
// STREAKS + 7-DAY TREND (ONE-FILE MODULE)
// ========================================

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeDailyScore } from "./TodayFeature";
import type { DailyInputs, DailyHistoryScore, StreakInfo } from "./types";
import { Snowflake } from "lucide-react";

// ---------- HOOK: LAST N DAYS SCORES ----

interface UseDailyHistoryScoresOptions {
  userId: string;
  days?: number; // default 7
  minScoreForStreak?: number; // default 60
}

interface HistoryResult {
  history: DailyHistoryScore[];
  streakInfo: StreakInfo;
}

export function useDailyHistoryScores({
  userId,
  days = 7,
  minScoreForStreak = 60,
}: UseDailyHistoryScoresOptions) {
  return useQuery({
    queryKey: ["dailyHistoryScores", userId, days],
    enabled: !!userId,
    queryFn: async (): Promise<HistoryResult> => {
      // 1) Compute date range
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - (days - 1));

      const fromStr = from.toISOString().slice(0, 10);
      const toStr = today.toISOString().slice(0, 10);

      // 2) Fetch all logs in range per table
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
            moodScore: 0.6,
            sleepCompletion: 0,
            recoveryModifier: 0,
          });
        }
        return map.get(date)!;
      }

      // 2a) workouts
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
          (day as any).workoutCompletion = count > 0 ? 1 : 0;
        }
      }

      // 2b) meals
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

      // 2c-f) hydration, mood, sleep, recovery (stubbed)
      // These will be populated when tables are created

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
        const scoreResult = computeDailyScore(inputs);
        return { 
          date, 
          score: scoreResult.score,
          frozenDay: false, // TODO: fetch from streak_freezes table when created
        };
      });

      // 4) Compute streak info
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let freezesUsed = 0;
      let lastActiveDate: string | null = null;
      const freezesRemaining = 1; // Default 1 freeze per week

      for (let i = history.length - 1; i >= 0; i--) {
        const day = history[i];
        if (day.score >= minScoreForStreak) {
          currentStreak++;
          lastActiveDate = day.date;
        } else if (day.frozenDay) {
          freezesUsed++;
          // Frozen day doesn't break streak
        } else {
          break;
        }
      }

      // Calculate longest streak
      for (const day of history) {
        if (day.score >= minScoreForStreak || day.frozenDay) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      const streakInfo: StreakInfo = {
        currentStreak,
        longestStreak,
        freezesUsed,
        freezesRemaining: Math.max(0, freezesRemaining - freezesUsed),
        lastActiveDate,
      };

      return { history, streakInfo };
    },
  });
}

// ---------- UI: STREAK + TREND CARD -------

function formatDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return "SMTWTFS"[d.getDay()];
}

interface TodayHistoryCardProps {
  history: DailyHistoryScore[];
  streakInfo: StreakInfo;
  minScoreForStreak: number;
}

export function TodayHistoryCard({ 
  history, 
  streakInfo,
  minScoreForStreak,
}: TodayHistoryCardProps) {
  const maxScore = useMemo(
    () => history.reduce((max, h) => (h.score > max ? h.score : max), 0) || 100,
    [history]
  );

  return (
    <div className="rounded-xl border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Streak</p>
          <p className="text-2xl font-semibold">
            {streakInfo.currentStreak} day
            {streakInfo.currentStreak === 1 ? "" : "s"}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Score ≥ {minScoreForStreak} keeps your streak.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Last {history.length} days
        </p>
        <div className="flex items-end gap-1 h-16">
          {history.map((h) => {
            const height = (h.score / maxScore) * 100;
            const isAboveThreshold = h.score >= minScoreForStreak;
            
            return (
              <div
                key={h.date}
                className="flex flex-col items-center justify-end gap-1 flex-1"
              >
                <div className="relative w-full">
                  {h.frozenDay && (
                    <Snowflake className="absolute -top-4 left-1/2 -translate-x-1/2 h-3 w-3 text-blue-400" />
                  )}
                  <div
                    className={`w-full rounded-t-md ${
                      h.frozenDay 
                        ? "bg-blue-400/50" 
                        : isAboveThreshold 
                          ? "bg-primary/70" 
                          : "bg-muted-foreground/30"
                    }`}
                    style={{ height: `${height || 4}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatDateLabel(h.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {streakInfo.freezesUsed > 0 && (
        <p className="text-xs text-blue-400 flex items-center gap-1">
          <Snowflake className="h-3 w-3" />
          {streakInfo.freezesUsed} freeze{streakInfo.freezesUsed > 1 ? "s" : ""} used
        </p>
      )}
    </div>
  );
}

// ========================================
// END TODAY HISTORY FEATURE
// ========================================

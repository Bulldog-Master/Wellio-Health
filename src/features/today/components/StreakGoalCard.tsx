// ========================================
// STREAK GOAL CARD - Shows progress toward streak goal
// ========================================

import { Flame, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { StreakInfo } from "../types";

interface StreakGoalCardProps {
  streakInfo: StreakInfo;
  goalDays?: number;
}

export function StreakGoalCard({ streakInfo, goalDays = 7 }: StreakGoalCardProps) {
  const { currentStreak, freezesUsed, freezesRemaining } = streakInfo;
  const progress = Math.min(100, (currentStreak / goalDays) * 100);
  const daysRemaining = Math.max(0, goalDays - currentStreak);

  return (
    <div className="rounded-xl border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">Streak Goal</p>
        </div>
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-semibold">{currentStreak} days</span>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentStreak} / {goalDays} days</span>
          {daysRemaining > 0 ? (
            <span>{daysRemaining} more to reach goal</span>
          ) : (
            <span className="text-green-500 font-medium">Goal reached! 🎉</span>
          )}
        </div>
      </div>

      {(freezesUsed > 0 || freezesRemaining > 0) && (
        <div className="flex items-center justify-between text-xs pt-2 border-t">
          <span className="text-muted-foreground">
            Streak freezes: {freezesRemaining} remaining
          </span>
          {freezesUsed > 0 && (
            <span className="text-blue-400">
              {freezesUsed} used this week
            </span>
          )}
        </div>
      )}
    </div>
  );
}

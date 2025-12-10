// ========================================
// ONBOARDING CHALLENGE CARD - 7-day first week challenge
// ========================================

import { Trophy, Sparkles, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { OnboardingChallengeStatus } from "../types";

interface OnboardingChallengeCardProps {
  status: OnboardingChallengeStatus;
}

export function OnboardingChallengeCard({ status }: OnboardingChallengeCardProps) {
  // Hide if onboarding window passed and user didn't complete
  if (!status.isInOnboardingWindow && !status.isCompleted) {
    return null;
  }

  const dayLabel = `Day ${status.currentDayIndex + 1} of 7`;
  const progress = Math.min(100, (status.completedDays / status.requiredDaysToWin) * 100);

  let headline: string;
  let subtext: string;
  let Icon = Zap;
  let iconColor = "text-primary";

  if (status.isCompleted) {
    headline = "Onboarding challenge complete 🎉";
    subtext = "You've hit enough solid days in your first week. From here, consistency is your superpower.";
    Icon = Trophy;
    iconColor = "text-amber-500";
  } else if (status.isFailed) {
    headline = "First week was bumpy — that's normal.";
    subtext = "You can always start another 7-day streak. One small win today is enough to restart.";
    Icon = Sparkles;
    iconColor = "text-muted-foreground";
  } else {
    headline = "7-Day First Week Challenge";
    subtext = `Hit at least ${status.requiredDaysToWin} good days (score ≥ ${status.thresholdScore}) in your first week.`;
    Icon = Zap;
    iconColor = "text-primary";
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <p className="text-xs uppercase text-muted-foreground font-medium">
            Onboarding Challenge
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{dayLabel}</p>
      </div>

      <div>
        <p className="text-sm font-medium">{headline}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{status.completedDays} / {status.requiredDaysToWin} successful days</span>
          {!status.isCompleted && !status.isFailed && (
            <span>
              {Math.max(0, status.requiredDaysToWin - status.completedDays)} more to win
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

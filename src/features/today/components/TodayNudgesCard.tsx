// ========================================
// TODAY NUDGES CARD - Micro-notifications/gentle prompts
// ========================================

import { Bell, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import type { NudgeMessage } from "../types";

interface TodayNudgesCardProps {
  messages: NudgeMessage[];
}

const iconMap = {
  info: Lightbulb,
  warning: AlertCircle,
  success: TrendingUp,
  reminder: Bell,
} as const;

const colorMap = {
  info: "text-blue-400",
  warning: "text-amber-400",
  success: "text-green-400",
  reminder: "text-primary",
} as const;

export function TodayNudgesCard({ messages }: TodayNudgesCardProps) {
  if (!messages.length) return null;

  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs uppercase text-muted-foreground font-medium">
          Nudges
        </p>
      </div>

      <div className="space-y-2">
        {messages.map((nudge, idx) => {
          const Icon = iconMap[nudge.type] || Lightbulb;
          const colorClass = colorMap[nudge.type] || "text-muted-foreground";

          return (
            <div
              key={idx}
              className="flex items-start gap-2 text-sm p-2 rounded-lg bg-background/50"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${colorClass}`} />
              <span>{nudge.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

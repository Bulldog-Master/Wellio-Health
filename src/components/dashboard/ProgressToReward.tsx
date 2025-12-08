import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

interface ProgressToRewardProps {
  currentPoints: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const REWARD_TIERS = [
  { points: 100, name: "Verified Badge" },
  { points: 200, name: "Profile Boost" },
  { points: 500, name: "1 Month Pro" },
  { points: 1000, name: "3 Months Pro" },
  { points: 2000, name: "Community Leader Badge" },
  { points: 2500, name: "6 Months Pro" },
  { points: 5000, name: "1 Year Pro" },
];

export const ProgressToReward = ({ currentPoints, size = "md", showLabel = true }: ProgressToRewardProps) => {
  // Find next reward tier
  const nextReward = REWARD_TIERS.find(tier => tier.points > currentPoints);
  
  if (!nextReward) {
    // User has reached max tier
    return (
      <div className="space-y-2">
        {showLabel && (
          <div className="flex items-center gap-2 justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Gift className="w-4 h-4 text-primary" />
              Max Level Reached!
            </span>
            <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-accent/20">
              {currentPoints} pts
            </Badge>
          </div>
        )}
        <Progress value={100} className={size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3"} />
        <p className="text-xs text-muted-foreground">You've unlocked all milestone rewards! 🎉</p>
      </div>
    );
  }

  const previousTier = REWARD_TIERS[REWARD_TIERS.indexOf(nextReward) - 1];
  const previousPoints = previousTier?.points || 0;
  const pointsNeeded = nextReward.points - currentPoints;
  const progressRange = nextReward.points - previousPoints;
  const currentProgress = currentPoints - previousPoints;
  const progressPercent = Math.min(100, Math.max(0, (currentProgress / progressRange) * 100));

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center gap-2 justify-between">
          <span className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium flex items-center gap-1`}>
            <Gift className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} text-primary`} />
            Next: {nextReward.name}
          </span>
          <Badge variant="secondary" className="text-xs">
            {pointsNeeded} more
          </Badge>
        </div>
      )}
      <Progress 
        value={progressPercent} 
        className={size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3"}
      />
      {showLabel && (
        <p className="text-xs text-muted-foreground">
          {currentPoints} / {nextReward.points} points
        </p>
      )}
    </div>
  );
};

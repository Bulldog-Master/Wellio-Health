import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";

export function OnboardingStep4() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Target className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Get Free Pro!</h2>
        <p className="text-muted-foreground">
          Earn points by inviting friends and unlock premium rewards
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-semibold mb-3 text-lg">🎁 How It Works</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Share Your Link</p>
                <p className="text-muted-foreground">Get 50 points when someone signs up</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">They Complete Onboarding</p>
                <p className="text-muted-foreground">Earn 100 more points (150 total!)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Redeem Rewards</p>
                <p className="text-muted-foreground">500 pts = 1 Month Pro FREE</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold mb-2">✨ What You Can Earn</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 rounded bg-background/50">
              <p className="font-medium">1 Month Pro</p>
              <p className="text-xs text-muted-foreground">500 points</p>
            </div>
            <div className="p-2 rounded bg-background/50">
              <p className="font-medium">Verified Badge</p>
              <p className="text-xs text-muted-foreground">100 points</p>
            </div>
            <div className="p-2 rounded bg-background/50">
              <p className="font-medium">6 Months Pro</p>
              <p className="text-xs text-muted-foreground">2,500 points</p>
            </div>
            <div className="p-2 rounded bg-background/50">
              <p className="font-medium">& Much More!</p>
              <p className="text-xs text-muted-foreground">Keep sharing</p>
            </div>
          </div>
        </Card>

        <div className="text-xs text-center text-muted-foreground bg-primary/5 p-3 rounded">
          🎯 Just 4 referrals = 1 Month Free Pro!
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, X } from "lucide-react";

interface ReferralCelebrationProps {
  points: number;
  description: string;
  onClose: () => void;
}

export const ReferralCelebration = ({ points, description, onClose }: ReferralCelebrationProps) => {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="relative max-w-md w-full p-8 text-center animate-scale-in shadow-2xl border-primary/20">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
          <Gift className="w-8 h-8 text-primary-foreground" />
        </div>

        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          +{points} Points!
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {description}
        </p>

        <div className="space-y-2 text-sm text-muted-foreground mb-6">
          <p>🎉 Keep sharing to earn more rewards!</p>
          <p className="font-semibold">500 points = 1 Month Pro FREE</p>
        </div>

        <Button onClick={onClose} className="w-full">
          Awesome!
        </Button>
      </Card>
    </div>
  );
};

export default ReferralCelebration;
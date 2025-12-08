import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Zap, Clock } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  ringType: 'move' | 'exercise' | 'stand';
  value: number;
  goal: number;
}

export const Celebration = ({ isOpen, onClose, ringType, value, goal }: CelebrationProps) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

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

      // Auto close after celebration
      const timeout = setTimeout(() => {
        onClose();
      }, 3500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, onClose]);

  const getRingColor = () => {
    switch (ringType) {
      case 'move': return '#FF006E';
      case 'exercise': return '#00F5FF';
      case 'stand': return '#BFFF00';
    }
  };

  const getRingIcon = () => {
    switch (ringType) {
      case 'move': return <Flame className="w-16 h-16" />;
      case 'exercise': return <Zap className="w-16 h-16" />;
      case 'stand': return <Clock className="w-16 h-16" />;
    }
  };

  const getRingLabel = () => {
    switch (ringType) {
      case 'move': return 'Move';
      case 'exercise': return 'Exercise';
      case 'stand': return 'Stand';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center animate-scale-in">
            <div
              className="p-6 rounded-full"
              style={{ 
                backgroundColor: `${getRingColor()}20`,
                color: getRingColor()
              }}
            >
              <Trophy className="w-20 h-20" />
            </div>
          </div>

          <div className="space-y-2 animate-fade-in">
            <h2 className="text-3xl font-bold">Goal Achieved! 🎉</h2>
            <p className="text-lg text-muted-foreground">
              You completed your {getRingLabel()} goal!
            </p>
          </div>

          <div
            className="flex items-center justify-center gap-3 p-4 rounded-lg animate-fade-in"
            style={{ backgroundColor: `${getRingColor()}10` }}
          >
            <div style={{ color: getRingColor() }}>
              {getRingIcon()}
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold" style={{ color: getRingColor() }}>
                {value}
              </div>
              <div className="text-sm text-muted-foreground">
                Goal: {goal}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground italic">
            Keep up the amazing work! 💪
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Celebration;
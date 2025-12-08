import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TimerInterval } from "@/types/timer.types";

interface TimerPlaybackControlsProps {
  intervals: TimerInterval[];
  currentIntervalIndex: number;
  currentRepeat: number;
  repeatCount: number;
  isRunning: boolean;
  remainingSeconds: number;
  isSessionComplete: boolean;
  formatTime: (seconds: number) => string;
  calculateTotalRemainingTime: () => number;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlayPause: () => void;
  onReset: () => void;
}

const TimerPlaybackControls = ({
  intervals,
  currentIntervalIndex,
  currentRepeat,
  repeatCount,
  isRunning,
  remainingSeconds,
  isSessionComplete,
  formatTime,
  calculateTotalRemainingTime,
  onPrevious,
  onNext,
  onTogglePlayPause,
  onReset,
}: TimerPlaybackControlsProps) => {
  const { t } = useTranslation(['timer']);
  const currentInterval = intervals[currentIntervalIndex];

  if (intervals.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t('select_timer_to_start')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Current interval display */}
      <div 
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: currentInterval?.color || 'hsl(var(--primary)/0.1)' }}
      >
        <p className="text-lg text-foreground/80 mb-2">
          {currentInterval?.name || t('interval')}
        </p>
        <p className="text-6xl font-bold text-foreground">
          {formatTime(remainingSeconds)}
        </p>
        <p className="text-sm text-foreground/60 mt-2">
          {t('round')} {currentRepeat}/{repeatCount}
        </p>
      </div>

      {/* Total remaining time */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{t('total_remaining')}</p>
        <p className="text-2xl font-semibold text-foreground">
          {formatTime(calculateTotalRemainingTime())}
        </p>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={onPrevious}
          disabled={isSessionComplete}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          size="icon"
          className="h-20 w-20 rounded-full"
          onClick={onTogglePlayPause}
          disabled={isSessionComplete}
        >
          {isRunning ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={onNext}
          disabled={isSessionComplete}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Reset button */}
      {(isSessionComplete || remainingSeconds < intervals[currentIntervalIndex]?.duration) && (
        <div className="text-center">
          <Button variant="ghost" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t('reset')}
          </Button>
        </div>
      )}

      {/* Session complete message */}
      {isSessionComplete && (
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <p className="text-lg font-semibold text-primary">{t('session_complete')}</p>
        </div>
      )}

      {/* Interval progress indicators */}
      <div className="flex justify-center gap-2 flex-wrap">
        {intervals.map((interval, idx) => (
          <div
            key={interval.id}
            className={`h-2 w-8 rounded-full transition-colors ${
              idx === currentIntervalIndex
                ? 'bg-primary'
                : idx < currentIntervalIndex
                ? 'bg-primary/40'
                : 'bg-muted'
            }`}
            style={{
              backgroundColor: idx === currentIntervalIndex ? interval.color : undefined
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TimerPlaybackControls;

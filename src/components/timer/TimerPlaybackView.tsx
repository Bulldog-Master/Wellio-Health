import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TimerInterval, TimerSettings } from "@/types/timer.types";

interface TimerPlaybackViewProps {
  timerName: string;
  intervals: TimerInterval[];
  currentIntervalIndex: number;
  remainingSeconds: number;
  isRunning: boolean;
  currentRepeat: number;
  repeatCount: number;
  isSessionComplete: boolean;
  timerSettings: TimerSettings;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlayPause: () => void;
  onReset: () => void;
  formatTime: (seconds: number) => string;
  calculateTotalRemainingTime: () => number;
}

const TimerPlaybackView = ({
  timerName,
  intervals,
  currentIntervalIndex,
  remainingSeconds,
  isRunning,
  currentRepeat,
  repeatCount,
  isSessionComplete,
  timerSettings,
  onBack,
  onPrevious,
  onNext,
  onTogglePlayPause,
  onReset,
  formatTime,
  calculateTotalRemainingTime,
}: TimerPlaybackViewProps) => {
  const { t } = useTranslation(['timer']);
  const currentInterval = intervals[currentIntervalIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back_to_library')}
        </Button>
        <h1 className="text-lg font-semibold">{timerName}</h1>
        <div className="w-24" />
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {isSessionComplete ? (
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-primary">{t('session_complete')}</h2>
            <p className="text-muted-foreground">{t('great_job')}</p>
            <Button onClick={onReset} size="lg">
              <RotateCcw className="h-5 w-5 mr-2" />
              {t('restart')}
            </Button>
          </div>
        ) : (
          <>
            {/* Current Interval Info */}
            <div 
              className="w-full max-w-md rounded-2xl p-8 mb-8 text-center"
              style={{ backgroundColor: currentInterval?.color || 'transparent' }}
            >
              <p className="text-sm opacity-75 mb-2">
                {t('interval')} {currentIntervalIndex + 1} / {intervals.length}
              </p>
              <h2 className="text-2xl font-bold text-white mb-4">
                {currentInterval?.name || t('ready')}
              </h2>
              <div className="text-7xl font-mono font-bold text-white">
                {formatTime(remainingSeconds)}
              </div>
            </div>

            {/* Repeat Counter */}
            {repeatCount > 1 && (
              <p className="text-muted-foreground mb-4">
                {t('round')} {currentRepeat} / {repeatCount}
              </p>
            )}

            {/* Total Remaining */}
            {timerSettings.showElapsedTime && (
              <p className="text-sm text-muted-foreground mb-8">
                {t('total_remaining')}: {formatTime(calculateTotalRemainingTime())}
              </p>
            )}

            {/* Controls */}
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-full"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button 
                size="icon" 
                className="h-20 w-20 rounded-full"
                onClick={onTogglePlayPause}
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
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Reset Button */}
            <Button 
              variant="ghost" 
              className="mt-8"
              onClick={onReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('reset')}
            </Button>
          </>
        )}
      </div>

      {/* Interval List Preview */}
      <div className="border-t border-border p-4 max-h-48 overflow-y-auto">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {intervals.map((interval, index) => (
            <div
              key={interval.id}
              className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
                index === currentIntervalIndex 
                  ? 'ring-2 ring-primary' 
                  : index < currentIntervalIndex 
                    ? 'opacity-50' 
                    : ''
              }`}
              style={{ backgroundColor: interval.color }}
            >
              <p className="text-xs text-white/75">{index + 1}</p>
              <p className="text-sm font-medium text-white truncate max-w-[100px]">
                {interval.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimerPlaybackView;
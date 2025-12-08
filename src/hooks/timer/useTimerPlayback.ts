import { useState, useEffect, useCallback } from "react";
import type { TimerInterval, TimerSettings } from "@/types/timer.types";

interface UseTimerPlaybackProps {
  intervals: TimerInterval[];
  repeatCount: number;
  timerSettings: TimerSettings;
}

export const useTimerPlayback = ({ intervals, repeatCount, timerSettings }: UseTimerPlaybackProps) => {
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const playSound = useCallback((soundId: string) => {
    console.log('Playing sound:', soundId);
    
    let ctx = audioContext;
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
    
    const playSingleBeep = (frequency: number, startTime: number, duration: number) => {
      try {
        const osc = ctx!.createOscillator();
        const gain = ctx!.createGain();
        
        osc.connect(gain);
        gain.connect(ctx!.destination);
        
        osc.frequency.setValueAtTime(frequency, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      } catch (e) {
        console.error('Error playing beep:', e);
      }
    };
    
    const now = ctx!.currentTime;
    
    switch(soundId) {
      case 'beep':
        playSingleBeep(800, now, 0.15);
        break;
      case 'doublebeep':
        playSingleBeep(800, now, 0.1);
        playSingleBeep(800, now + 0.15, 0.1);
        break;
      case 'triplet':
        playSingleBeep(800, now, 0.08);
        playSingleBeep(800, now + 0.12, 0.08);
        playSingleBeep(800, now + 0.24, 0.08);
        break;
      case 'om':
        playSingleBeep(200, now, 0.8);
        break;
      case 'alert':
        playSingleBeep(1000, now, 0.1);
        playSingleBeep(800, now + 0.15, 0.1);
        break;
      case 'pipes':
        playSingleBeep(600, now, 0.3);
        playSingleBeep(700, now + 0.1, 0.3);
        break;
      case 'pluck':
        playSingleBeep(1200, now, 0.05);
        break;
      case 'flourish':
        playSingleBeep(600, now, 0.1);
        playSingleBeep(800, now + 0.1, 0.1);
        playSingleBeep(1000, now + 0.2, 0.15);
        break;
      case 'sonar':
        playSingleBeep(400, now, 0.3);
        break;
      case 'chime':
        playSingleBeep(1500, now, 0.4);
        playSingleBeep(1200, now + 0.1, 0.4);
        break;
      case 'bell':
        playSingleBeep(1000, now, 0.5);
        break;
      case 'gong':
        playSingleBeep(150, now, 1.0);
        break;
      case 'singingbowl':
        playSingleBeep(400, now, 1.2);
        break;
      case 'meditationbowl':
        playSingleBeep(300, now, 1.5);
        break;
      case 'meditationtriplet':
        playSingleBeep(350, now, 0.5);
        playSingleBeep(350, now + 0.6, 0.5);
        playSingleBeep(350, now + 1.2, 0.5);
        break;
    }
  }, [audioContext]);

  const handlePreviousInterval = useCallback(() => {
    setCurrentIntervalIndex((prev) => {
      let newIndex: number;
      
      if (prev > 0) {
        newIndex = prev - 1;
      } else {
        newIndex = intervals.length - 1;
        if (currentRepeat > 1) {
          setCurrentRepeat(currentRepeat - 1);
        }
      }
      
      setRemainingSeconds(intervals[newIndex]?.duration || 0);
      return newIndex;
    });
  }, [intervals, currentRepeat]);

  const handleNextInterval = useCallback(() => {
    setCurrentIntervalIndex((prev) => {
      let newIndex: number;
      
      if (prev < intervals.length - 1) {
        newIndex = prev + 1;
      } else {
        newIndex = 0;
        if (currentRepeat < repeatCount) {
          setCurrentRepeat(currentRepeat + 1);
        } else {
          setIsRunning(false);
        }
      }
      
      setRemainingSeconds(intervals[newIndex]?.duration || 0);
      return newIndex;
    });
  }, [intervals, currentRepeat, repeatCount]);

  const calculateTotalTime = useCallback(() => {
    const totalSeconds = intervals.reduce((sum, interval) => sum + interval.duration, 0) * repeatCount;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [intervals, repeatCount]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const calculateTotalRemainingTime = useCallback(() => {
    if (intervals.length === 0) return 0;
    
    const totalIntervalDuration = intervals.reduce((sum, interval) => sum + interval.duration, 0);
    const totalTime = totalIntervalDuration * repeatCount;
    const completedRepeats = currentRepeat - 1;
    const completedIntervalsInCurrentRepeat = currentIntervalIndex;
    
    let elapsed = completedRepeats * totalIntervalDuration;
    for (let i = 0; i < completedIntervalsInCurrentRepeat; i++) {
      elapsed += intervals[i].duration;
    }
    elapsed += (intervals[currentIntervalIndex]?.duration || 0) - remainingSeconds;
    
    return Math.max(0, totalTime - elapsed);
  }, [intervals, repeatCount, currentRepeat, currentIntervalIndex, remainingSeconds]);

  const resetPlayback = useCallback(() => {
    setCurrentIntervalIndex(0);
    setIsRunning(false);
    setRemainingSeconds(intervals[0]?.duration || 0);
    setCurrentRepeat(1);
    setTotalElapsedSeconds(0);
    setIsSessionComplete(false);
  }, [intervals]);

  const selectTimer = useCallback((timerIntervals: TimerInterval[]) => {
    setCurrentIntervalIndex(0);
    setRemainingSeconds(timerIntervals[0]?.duration || 0);
    setIsRunning(false);
    setCurrentRepeat(1);
    setTotalElapsedSeconds(0);
    setIsSessionComplete(false);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          const intervalSound = intervals[currentIntervalIndex]?.sound || timerSettings.intervalCompleteSound;
          if (intervalSound !== 'none') {
            playSound(intervalSound);
          }
          
          if (currentIntervalIndex < intervals.length - 1) {
            const nextIndex = currentIntervalIndex + 1;
            setCurrentIntervalIndex(nextIndex);
            return intervals[nextIndex].duration;
          } else if (currentRepeat < repeatCount) {
            setCurrentRepeat((prev) => prev + 1);
            setCurrentIntervalIndex(0);
            return intervals[0].duration;
          } else {
            setIsRunning(false);
            setIsSessionComplete(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, currentIntervalIndex, intervals, repeatCount, currentRepeat, timerSettings, playSound]);

  // Handle session completion sound
  useEffect(() => {
    if (!isSessionComplete || !audioContext) return;
    
    let soundCount = 0;
    const maxSounds = 15;
    
    playSound(timerSettings.timerCompleteSound);
    soundCount++;
    
    const completionInterval = setInterval(() => {
      if (soundCount < maxSounds) {
        playSound(timerSettings.timerCompleteSound);
        soundCount++;
      } else {
        clearInterval(completionInterval);
      }
    }, 1000);
    
    return () => clearInterval(completionInterval);
  }, [isSessionComplete, audioContext, timerSettings.timerCompleteSound, playSound]);

  return {
    currentIntervalIndex,
    setCurrentIntervalIndex,
    isRunning,
    setIsRunning,
    remainingSeconds,
    setRemainingSeconds,
    currentRepeat,
    setCurrentRepeat,
    totalElapsedSeconds,
    setTotalElapsedSeconds,
    isSessionComplete,
    setIsSessionComplete,
    audioContext,
    playSound,
    handlePreviousInterval,
    handleNextInterval,
    calculateTotalTime,
    formatTime,
    calculateTotalRemainingTime,
    resetPlayback,
    selectTimer,
  };
};

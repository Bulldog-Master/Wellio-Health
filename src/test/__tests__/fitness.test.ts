import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Fitness Tracking Tests
 */
describe('Fitness Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Workout Calculations', () => {
    interface Workout {
      type: string;
      duration: number; // minutes
      intensity: 'low' | 'medium' | 'high';
    }

    const calculateCalories = (workout: Workout, weight: number): number => {
      const intensityMultiplier = {
        low: 3,
        medium: 5,
        high: 8,
      };
      
      const met = intensityMultiplier[workout.intensity];
      return Math.round((met * weight * workout.duration) / 60);
    };

    it('should calculate calories for low intensity', () => {
      const workout: Workout = { type: 'walking', duration: 30, intensity: 'low' };
      const calories = calculateCalories(workout, 70);
      expect(calories).toBeGreaterThan(0);
      expect(calories).toBeLessThan(200);
    });

    it('should calculate higher calories for high intensity', () => {
      const lowIntensity: Workout = { type: 'walking', duration: 30, intensity: 'low' };
      const highIntensity: Workout = { type: 'running', duration: 30, intensity: 'high' };
      
      const lowCal = calculateCalories(lowIntensity, 70);
      const highCal = calculateCalories(highIntensity, 70);
      
      expect(highCal).toBeGreaterThan(lowCal);
    });
  });

  describe('Weight Tracking', () => {
    interface WeightEntry {
      date: Date;
      weight: number;
    }

    const calculateTrend = (entries: WeightEntry[]): 'gaining' | 'losing' | 'stable' => {
      if (entries.length < 2) return 'stable';
      
      const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
      const first = sorted[0].weight;
      const last = sorted[sorted.length - 1].weight;
      const diff = last - first;
      
      if (diff > 0.5) return 'gaining';
      if (diff < -0.5) return 'losing';
      return 'stable';
    };

    it('should detect weight loss trend', () => {
      const entries: WeightEntry[] = [
        { date: new Date('2024-01-01'), weight: 80 },
        { date: new Date('2024-01-15'), weight: 78 },
        { date: new Date('2024-02-01'), weight: 76 },
      ];

      expect(calculateTrend(entries)).toBe('losing');
    });

    it('should detect weight gain trend', () => {
      const entries: WeightEntry[] = [
        { date: new Date('2024-01-01'), weight: 70 },
        { date: new Date('2024-01-15'), weight: 72 },
        { date: new Date('2024-02-01'), weight: 74 },
      ];

      expect(calculateTrend(entries)).toBe('gaining');
    });

    it('should detect stable weight', () => {
      const entries: WeightEntry[] = [
        { date: new Date('2024-01-01'), weight: 70 },
        { date: new Date('2024-02-01'), weight: 70.3 },
      ];

      expect(calculateTrend(entries)).toBe('stable');
    });
  });

  describe('Step Counting', () => {
    const calculateDistance = (steps: number, strideLength: number = 0.762): number => {
      return Math.round((steps * strideLength) / 1000 * 100) / 100; // km
    };

    it('should calculate distance from steps', () => {
      const distance = calculateDistance(10000);
      expect(distance).toBeCloseTo(7.62, 1);
    });

    it('should handle custom stride length', () => {
      const distance = calculateDistance(10000, 0.8);
      expect(distance).toBeCloseTo(8.0, 1);
    });
  });

  describe('Habit Completion', () => {
    interface Habit {
      id: string;
      frequency: 'daily' | 'weekly';
      targetCount: number;
      completions: Date[];
    }

    const getCompletionRate = (habit: Habit, period: Date[]): number => {
      const validCompletions = habit.completions.filter(c => 
        period.some(d => 
          d.toDateString() === c.toDateString()
        )
      );
      
      const target = habit.frequency === 'daily' 
        ? period.length 
        : Math.ceil(period.length / 7) * habit.targetCount;
      
      return Math.min(100, Math.round((validCompletions.length / target) * 100));
    };

    it('should calculate daily habit completion rate', () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      
      const habit: Habit = {
        id: '1',
        frequency: 'daily',
        targetCount: 1,
        completions: [today, yesterday],
      };

      const period = [today, yesterday];
      expect(getCompletionRate(habit, period)).toBe(100);
    });
  });
});

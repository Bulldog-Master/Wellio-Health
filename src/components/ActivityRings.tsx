import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Zap, Clock } from 'lucide-react';

interface RingData {
  current: number;
  goal: number;
  percentage: number;
}

interface ActivityRingsData {
  move: RingData;
  exercise: RingData;
  stand: RingData;
}

const ActivityRings = () => {
  const [data, setData] = useState<ActivityRingsData>({
    move: { current: 0, goal: 500, percentage: 0 },
    exercise: { current: 0, goal: 30, percentage: 0 },
    stand: { current: 0, goal: 12, percentage: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Fetch activity logs for exercise minutes
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('duration_minutes, calories_burned')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      // Fetch wearable data for calories and steps
      const { data: wearable } = await supabase
        .from('wearable_data')
        .select('calories_burned, steps')
        .eq('user_id', user.id)
        .eq('data_date', today)
        .single();

      // Calculate totals
      const exerciseMinutes = activities?.reduce((sum, a) => sum + a.duration_minutes, 0) || 0;
      const activityCalories = activities?.reduce((sum, a) => sum + (a.calories_burned || 0), 0) || 0;
      const wearableCalories = wearable?.calories_burned || 0;
      const totalCalories = activityCalories + wearableCalories;

      // Estimate stand hours (rough approximation: 1 hour per 1000 steps)
      const standHours = Math.min(Math.floor((wearable?.steps || 0) / 1000), 12);

      setData({
        move: {
          current: totalCalories,
          goal: 500,
          percentage: Math.min((totalCalories / 500) * 100, 100)
        },
        exercise: {
          current: exerciseMinutes,
          goal: 30,
          percentage: Math.min((exerciseMinutes / 30) * 100, 100)
        },
        stand: {
          current: standHours,
          goal: 12,
          percentage: Math.min((standHours / 12) * 100, 100)
        }
      });
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRingColor = (type: 'move' | 'exercise' | 'stand') => {
    switch (type) {
      case 'move':
        return 'stroke-[#FF006E]';
      case 'exercise':
        return 'stroke-[#00F5FF]';
      case 'stand':
        return 'stroke-[#BFFF00]';
    }
  };

  const getRingGradient = (type: 'move' | 'exercise' | 'stand') => {
    switch (type) {
      case 'move':
        return { id: 'moveGradient', color1: '#FF006E', color2: '#FF4081' };
      case 'exercise':
        return { id: 'exerciseGradient', color1: '#00F5FF', color2: '#00B8D4' };
      case 'stand':
        return { id: 'standGradient', color1: '#BFFF00', color2: '#76FF03' };
    }
  };

  const Ring = ({ type, data: ringData, radius, strokeWidth }: { 
    type: 'move' | 'exercise' | 'stand'; 
    data: RingData; 
    radius: number;
    strokeWidth: number;
  }) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (ringData.percentage / 100) * circumference;
    const gradient = getRingGradient(type);

    // Get background color based on type
    const bgColor = type === 'move' ? '#FF006E' : type === 'exercise' ? '#00F5FF' : '#BFFF00';

    return (
      <g>
        {/* Background ring */}
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          opacity="0.2"
        />
        {/* Progress ring */}
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke={`url(#${gradient.id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 120 120)"
          className="transition-all duration-1000 ease-out"
        />
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rings visualization */}
      <div className="flex justify-center">
        <svg width="240" height="240" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="moveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF006E" />
              <stop offset="100%" stopColor="#FF4081" />
            </linearGradient>
            <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F5FF" />
              <stop offset="100%" stopColor="#00B8D4" />
            </linearGradient>
            <linearGradient id="standGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BFFF00" />
              <stop offset="100%" stopColor="#76FF03" />
            </linearGradient>
          </defs>
          <Ring type="move" data={data.move} radius={100} strokeWidth={16} />
          <Ring type="exercise" data={data.exercise} radius={75} strokeWidth={16} />
          <Ring type="stand" data={data.stand} radius={50} strokeWidth={16} />
        </svg>
      </div>

      {/* Ring details */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-[#FF006E]/10">
              <Flame className="w-6 h-6" style={{ color: '#FF006E' }} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">{data.move.current}</p>
            <p className="text-xs text-muted-foreground">/ {data.move.goal} CAL</p>
            <p className="text-sm font-medium mt-1">Move</p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-[#00F5FF]/10">
              <Zap className="w-6 h-6" style={{ color: '#00F5FF' }} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">{data.exercise.current}</p>
            <p className="text-xs text-muted-foreground">/ {data.exercise.goal} MIN</p>
            <p className="text-sm font-medium mt-1">Exercise</p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-[#BFFF00]/10">
              <Clock className="w-6 h-6" style={{ color: '#BFFF00' }} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">{data.stand.current}</p>
            <p className="text-xs text-muted-foreground">/ {data.stand.goal} HR</p>
            <p className="text-sm font-medium mt-1">Stand</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRings;

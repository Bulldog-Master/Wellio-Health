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
      if (!user) {
        setLoading(false);
        return;
      }

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
        .maybeSingle();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate ring positions
  const center = 150;
  const rings = [
    { type: 'move' as const, radius: 115, color: '#FF006E', gradient: 'moveGradient', data: data.move },
    { type: 'exercise' as const, radius: 87, color: '#00F5FF', gradient: 'exerciseGradient', data: data.exercise },
    { type: 'stand' as const, radius: 59, color: '#BFFF00', gradient: 'standGradient', data: data.stand }
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Rings visualization */}
      <div className="flex justify-center">
        <div className="relative" style={{ 
          filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.15))'
        }}>
          <svg width="300" height="300" viewBox="0 0 300 300" className="transform">
            <defs>
              <linearGradient id="moveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF006E' }} />
                <stop offset="100%" style={{ stopColor: '#FF4081' }} />
              </linearGradient>
              <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#00F5FF' }} />
                <stop offset="100%" style={{ stopColor: '#00B8D4' }} />
              </linearGradient>
              <linearGradient id="standGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#BFFF00' }} />
                <stop offset="100%" style={{ stopColor: '#76FF03' }} />
              </linearGradient>
              
              {/* Glow filters */}
              <filter id="glow-move">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-exercise">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-stand">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {rings.map((ring) => {
              const circumference = 2 * Math.PI * ring.radius;
              const offset = circumference - (ring.data.percentage / 100) * circumference;
              
              return (
                <g key={ring.type}>
                  {/* Background ring */}
                  <circle
                    cx={center}
                    cy={center}
                    r={ring.radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth="18"
                    opacity="0.15"
                  />
                  {/* Progress ring */}
                  {ring.data.percentage > 0 && (
                    <circle
                      cx={center}
                      cy={center}
                      r={ring.radius}
                      fill="none"
                      stroke={`url(#${ring.gradient})`}
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      transform={`rotate(-90 ${center} ${center})`}
                      filter={`url(#glow-${ring.type})`}
                      style={{ 
                        transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        transitionDelay: `${rings.indexOf(ring) * 0.15}s`
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Ring details */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-full" style={{ 
              backgroundColor: 'rgba(255, 0, 110, 0.1)',
              boxShadow: '0 4px 12px rgba(255, 0, 110, 0.15)'
            }}>
              <Flame className="w-7 h-7" style={{ color: '#FF006E' }} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold">{data.move.current}</p>
            <p className="text-xs text-muted-foreground">/ {data.move.goal} CAL</p>
            <p className="text-sm font-semibold mt-2">Move</p>
          </div>
        </div>

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-full" style={{ 
              backgroundColor: 'rgba(0, 245, 255, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 245, 255, 0.15)'
            }}>
              <Zap className="w-7 h-7" style={{ color: '#00F5FF' }} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold">{data.exercise.current}</p>
            <p className="text-xs text-muted-foreground">/ {data.exercise.goal} MIN</p>
            <p className="text-sm font-semibold mt-2">Exercise</p>
          </div>
        </div>

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-full" style={{ 
              backgroundColor: 'rgba(191, 255, 0, 0.1)',
              boxShadow: '0 4px 12px rgba(191, 255, 0, 0.15)'
            }}>
              <Clock className="w-7 h-7" style={{ color: '#BFFF00' }} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold">{data.stand.current}</p>
            <p className="text-xs text-muted-foreground">/ {data.stand.goal} HR</p>
            <p className="text-sm font-semibold mt-2">Stand</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRings;

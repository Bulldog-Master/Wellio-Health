import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Zap, Clock, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, subDays } from 'date-fns';
import { Celebration } from './Celebration';

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

type RingType = 'move' | 'exercise' | 'stand';

const ActivityRings = () => {
  const [data, setData] = useState<ActivityRingsData>({
    move: { current: 0, goal: 500, percentage: 0 },
    exercise: { current: 0, goal: 30, percentage: 0 },
    stand: { current: 0, goal: 12, percentage: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState({ move: 500, exercise: 30, stand: 12 });
  const [selectedRing, setSelectedRing] = useState<RingType | null>(null);
  const [ringHistory, setRingHistory] = useState<any[]>([]);
  const [celebratingRing, setCelebratingRing] = useState<RingType | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<RingType>>(new Set());

  useEffect(() => {
    fetchActivityData();
    checkTodayAchievements();
  }, []);

  useEffect(() => {
    if (selectedRing) {
      fetchRingHistory(selectedRing);
    }
  }, [selectedRing]);

  useEffect(() => {
    // Check if any goals were just completed
    const checkGoalCompletion = async () => {
      if (data.move.percentage >= 100 && !completedToday.has('move')) {
        await saveAchievement('move', data.move.current, data.move.goal);
        setCelebratingRing('move');
        setCompletedToday(prev => new Set(prev).add('move'));
      }
      if (data.exercise.percentage >= 100 && !completedToday.has('exercise')) {
        await saveAchievement('exercise', data.exercise.current, data.exercise.goal);
        setCelebratingRing('exercise');
        setCompletedToday(prev => new Set(prev).add('exercise'));
      }
      if (data.stand.percentage >= 100 && !completedToday.has('stand')) {
        await saveAchievement('stand', data.stand.current, data.stand.goal);
        setCelebratingRing('stand');
        setCompletedToday(prev => new Set(prev).add('stand'));
      }
    };

    if (!loading) {
      checkGoalCompletion();
    }
  }, [data, loading]);

  const fetchActivityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch user's custom goals from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('move_goal, exercise_goal, stand_goal')
        .eq('id', user.id)
        .single();

      const userGoals = {
        move: profile?.move_goal || 500,
        exercise: profile?.exercise_goal || 30,
        stand: profile?.stand_goal || 12
      };
      setGoals(userGoals);

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
          goal: userGoals.move,
          percentage: Math.min((totalCalories / userGoals.move) * 100, 100)
        },
        exercise: {
          current: exerciseMinutes,
          goal: userGoals.exercise,
          percentage: Math.min((exerciseMinutes / userGoals.exercise) * 100, 100)
        },
        stand: {
          current: standHours,
          goal: userGoals.stand,
          percentage: Math.min((standHours / userGoals.stand) * 100, 100)
        }
      });
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: achievements } = await supabase
        .from('achievements')
        .select('achievement_type')
        .eq('user_id', user.id)
        .gte('achieved_at', `${today}T00:00:00`)
        .lt('achieved_at', `${today}T23:59:59`);

      if (achievements) {
        const completed = new Set(achievements.map(a => a.achievement_type as RingType));
        setCompletedToday(completed);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const saveAchievement = async (type: RingType, actualValue: number, goalValue: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('achievements').insert({
        user_id: user.id,
        achievement_type: type,
        actual_value: actualValue,
        goal_value: goalValue,
      });
    } catch (error) {
      console.error('Error saving achievement:', error);
    }
  };

  const fetchRingHistory = async (ringType: RingType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return format(date, 'yyyy-MM-dd');
      }).reverse();

      const history = await Promise.all(
        last7Days.map(async (date) => {
          if (ringType === 'move' || ringType === 'exercise') {
            const { data: activities } = await supabase
              .from('activity_logs')
              .select('duration_minutes, calories_burned')
              .eq('user_id', user.id)
              .gte('logged_at', `${date}T00:00:00`)
              .lt('logged_at', `${date}T23:59:59`);

            let value = 0;
            if (ringType === 'move') {
              value = activities?.reduce((sum, log) => sum + (log.calories_burned || 0), 0) || 0;
            } else if (ringType === 'exercise') {
              value = activities?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0;
            }

            return {
              date: format(new Date(date), 'MMM dd'),
              value,
              goal: goals[ringType],
              percentage: Math.min((value / goals[ringType]) * 100, 100),
            };
          } else {
            // Stand hours from wearable data
            const { data: wearable } = await supabase
              .from('wearable_data')
              .select('steps')
              .eq('user_id', user.id)
              .eq('data_date', date)
              .maybeSingle();

            const standHours = Math.min(Math.floor((wearable?.steps || 0) / 1000), 12);
            return {
              date: format(new Date(date), 'MMM dd'),
              value: standHours,
              goal: goals.stand,
              percentage: Math.min((standHours / goals.stand) * 100, 100),
            };
          }
        })
      );

      setRingHistory(history);
    } catch (error) {
      console.error('Error fetching ring history:', error);
    }
  };

  const getRingColor = (type: RingType) => {
    switch (type) {
      case 'move': return '#FF006E';
      case 'exercise': return '#00F5FF';
      case 'stand': return '#BFFF00';
    }
  };

  const getRingLabel = (type: RingType) => {
    switch (type) {
      case 'move': return 'Move';
      case 'exercise': return 'Exercise';
      case 'stand': return 'Stand';
    }
  };

  const getRingIcon = (type: RingType) => {
    switch (type) {
      case 'move': return <Flame className="w-5 h-5" />;
      case 'exercise': return <Zap className="w-5 h-5" />;
      case 'stand': return <Clock className="w-5 h-5" />;
    }
  };

  const getRingValue = (type: RingType) => {
    switch (type) {
      case 'move': return `${data.move.current} / ${data.move.goal} CAL`;
      case 'exercise': return `${data.exercise.current} / ${data.exercise.goal} MIN`;
      case 'stand': return `${data.stand.current} / ${data.stand.goal} HR`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 md:h-80">
        <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-primary"></div>
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
    <div className="space-y-2 py-1">
      {/* Rings visualization */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32 md:w-40 md:h-40" style={{ 
          filter: 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.08))'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 300 300" className="transform"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(66, 153, 225, 0.2))'
            }}>
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
              
              {/* Enhanced Glow filters */}
              <filter id="glow-move" height="200%" width="200%" x="-50%" y="-50%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feColorMatrix in="coloredBlur" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-exercise" height="200%" width="200%" x="-50%" y="-50%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feColorMatrix in="coloredBlur" type="matrix" values="0 0 0 0 0  1 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-stand" height="200%" width="200%" x="-50%" y="-50%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feColorMatrix in="coloredBlur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  1 0 0 0 0  0 0 0 0.6 0"/>
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
                <g 
                  key={ring.type} 
                  className="cursor-pointer"
                  onClick={() => setSelectedRing(ring.type)}
                  style={{ transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {/* Background ring */}
                  <circle
                    cx={center}
                    cy={center}
                    r={ring.radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth="20"
                    opacity="0.2"
                  />
                  {/* Progress ring */}
                  {ring.data.percentage > 0 && (
                    <>
                      <circle
                        cx={center}
                        cy={center}
                        r={ring.radius}
                        fill="none"
                        stroke={`url(#${ring.gradient})`}
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform={`rotate(-90 ${center} ${center})`}
                        filter={`url(#glow-${ring.type})`}
                        style={{ 
                          transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          transitionDelay: `${rings.indexOf(ring) * 0.2}s`,
                          opacity: 1,
                          animation: ring.data.percentage >= 100 ? 'pulse 2s ease-in-out infinite' : 'none'
                        }}
                      />
                      {/* Completion pulse effect */}
                      {ring.data.percentage >= 100 && (
                        <circle
                          cx={center}
                          cy={center}
                          r={ring.radius}
                          fill="none"
                          stroke={ring.color}
                          strokeWidth="2"
                          opacity="0"
                          style={{
                            animation: 'ring-pulse 2s ease-in-out infinite'
                          }}
                        />
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Interaction hint with animation */}
      <div className="text-center">
        <p className="text-[10px] md:text-xs text-foreground/60">
          Click rings for details
        </p>
      </div>

      {/* Ring details with improved styling */}
      <div className="grid grid-cols-3 gap-1.5 md:gap-2 mt-2">
        <div className="text-center space-y-0.5">
          <div className="flex justify-center">
            <div className="p-1.5 rounded-full" style={{
              backgroundColor: 'rgba(255, 0, 110, 0.1)'
            }}>
              <Flame className="w-3 h-3 md:w-4 md:h-4" style={{ color: '#FF006E' }} />
            </div>
          </div>
          <div>
            <p className="text-sm md:text-base font-bold text-foreground">{data.move.current}</p>
            <p className="text-[9px] md:text-[10px] text-foreground/60">/ {data.move.goal} CAL</p>
            <p className="text-[10px] md:text-xs font-medium text-foreground/80">Move</p>
          </div>
        </div>

        <div className="text-center space-y-0.5">
          <div className="flex justify-center">
            <div className="p-1.5 rounded-full" style={{
              backgroundColor: 'rgba(0, 245, 255, 0.1)'
            }}>
              <Zap className="w-3 h-3 md:w-4 md:h-4" style={{ color: '#00F5FF' }} />
            </div>
          </div>
          <div>
            <p className="text-sm md:text-base font-bold text-foreground">{data.exercise.current}</p>
            <p className="text-[9px] md:text-[10px] text-foreground/60">/ {data.exercise.goal} MIN</p>
            <p className="text-[10px] md:text-xs font-medium text-foreground/80">Exercise</p>
          </div>
        </div>

        <div className="text-center space-y-0.5">
          <div className="flex justify-center">
            <div className="p-1.5 rounded-full" style={{
              backgroundColor: 'rgba(191, 255, 0, 0.1)'
            }}>
              <Clock className="w-3 h-3 md:w-4 md:h-4" style={{ color: '#BFFF00' }} />
            </div>
          </div>
          <div>
            <p className="text-sm md:text-base font-bold text-foreground">{data.stand.current}</p>
            <p className="text-[9px] md:text-[10px] text-foreground/60">/ {data.stand.goal} HR</p>
            <p className="text-[10px] md:text-xs font-medium text-foreground/80">Stand</p>
          </div>
        </div>
      </div>

      {/* Ring Details Dialog */}
      <Dialog open={selectedRing !== null} onOpenChange={() => setSelectedRing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div style={{ color: selectedRing ? getRingColor(selectedRing) : undefined }}>
                {selectedRing && getRingIcon(selectedRing)}
              </div>
              {selectedRing && getRingLabel(selectedRing)} Activity
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-2" 
                style={{ color: selectedRing ? getRingColor(selectedRing) : undefined }}
              >
                {selectedRing && getRingValue(selectedRing)}
              </div>
              <p className="text-muted-foreground">Today's Progress</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Last 7 Days
              </h4>
              <div className="space-y-2">
                {ringHistory.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-16">{day.date}</span>
                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(day.percentage, 100)}%`,
                          backgroundColor: selectedRing ? getRingColor(selectedRing) : undefined,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {Math.round(day.percentage)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">7-Day Average</div>
              <div className="text-2xl font-bold">
                {ringHistory.length > 0
                  ? Math.round(ringHistory.reduce((sum, day) => sum + day.percentage, 0) / ringHistory.length)
                  : 0}%
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Celebration Modal */}
      {celebratingRing && (
        <Celebration
          isOpen={celebratingRing !== null}
          onClose={() => setCelebratingRing(null)}
          ringType={celebratingRing}
          value={data[celebratingRing].current}
          goal={data[celebratingRing].goal}
        />
      )}
    </div>
  );
};

export default ActivityRings;

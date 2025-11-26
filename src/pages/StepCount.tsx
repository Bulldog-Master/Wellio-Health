import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Footprints, Target, Trophy, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';

const StepCount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState(0);
  const [stepGoal, setStepGoal] = useState(10000);
  const [weeklySteps, setWeeklySteps] = useState<any[]>([]);
  const [totalWeeklySteps, setTotalWeeklySteps] = useState(0);

  useEffect(() => {
    fetchStepData();
  }, []);

  const fetchStepData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Fetch today's steps
      const { data: todayData } = await supabase
        .from('wearable_data')
        .select('steps')
        .eq('user_id', user.id)
        .eq('data_date', today)
        .maybeSingle();

      setSteps(todayData?.steps || 0);

      // Fetch last 7 days for history
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return format(date, 'yyyy-MM-dd');
      }).reverse();

      const weekHistory = await Promise.all(
        last7Days.map(async (date) => {
          const { data } = await supabase
            .from('wearable_data')
            .select('steps')
            .eq('user_id', user.id)
            .eq('data_date', date)
            .maybeSingle();

          return {
            date: format(new Date(date), 'EEE'),
            fullDate: format(new Date(date), 'MMM dd'),
            steps: data?.steps || 0,
            percentage: Math.min(((data?.steps || 0) / stepGoal) * 100, 100)
          };
        })
      );

      setWeeklySteps(weekHistory);
      setTotalWeeklySteps(weekHistory.reduce((sum, day) => sum + day.steps, 0));
    } catch (error) {
      console.error('Error fetching step data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance in miles (average: 2000 steps = 1 mile)
  const distanceMiles = (steps / 2000).toFixed(2);
  const distanceKm = (parseFloat(distanceMiles) * 1.60934).toFixed(2);
  
  // Calculate progress percentage
  const progressPercentage = Math.min((steps / stepGoal) * 100, 100);

  // Calculate ring offset for the step ring
  const center = 150;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercentage / 100) * circumference;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Footprints className="w-8 h-8 text-primary" />
            Step Count
          </h1>
          <p className="text-muted-foreground">Track your daily steps and progress</p>
        </div>
      </div>

      {/* Main Step Ring */}
      <Card className="p-8 bg-gradient-card shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          {/* Step Ring Visualization */}
          <div className="relative w-64 h-64">
            <svg width="100%" height="100%" viewBox="0 0 300 300">
              <defs>
                <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#10B981' }} />
                  <stop offset="100%" style={{ stopColor: '#34D399' }} />
                </linearGradient>
                <filter id="glow-step" height="200%" width="200%" x="-50%" y="-50%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#10B981"
                strokeWidth="24"
                opacity="0.2"
              />
              
              {/* Progress ring */}
              {progressPercentage > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="url(#stepGradient)"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform={`rotate(-90 ${center} ${center})`}
                  filter="url(#glow-step)"
                  style={{ 
                    transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: progressPercentage >= 100 ? 'pulse 2s ease-in-out infinite' : 'none'
                  }}
                />
              )}
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Footprints className="w-12 h-12 text-success mb-2" />
              <p className="text-5xl font-bold">{steps.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">of {stepGoal.toLocaleString()} steps</p>
              <div className="mt-3 px-4 py-1 rounded-full bg-success/10">
                <p className="text-sm font-semibold text-success">{Math.round(progressPercentage)}%</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <Card className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{distanceMiles}</p>
              <p className="text-sm text-muted-foreground">Miles</p>
              <p className="text-xs text-muted-foreground">({distanceKm} km)</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{totalWeeklySteps.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </Card>
          </div>
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Weekly Progress
        </h3>
        <div className="space-y-3">
          {weeklySteps.map((day, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{day.date}</span>
                <span className="text-muted-foreground">{day.steps.toLocaleString()} steps</span>
              </div>
              <Progress value={day.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Awards Section - Coming Soon */}
      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Awards & Achievements
          </h3>
          <Award className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-semibold text-lg">Coming Soon!</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Unlock badges and achievements as you reach step milestones. Stay tuned for exciting rewards!
            </p>
          </div>
          
          {/* Preview of future badges */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-sm mx-auto opacity-40">
            {[
              { name: '5K Steps', icon: '🚶' },
              { name: '10K Steps', icon: '🏃' },
              { name: 'Week Streak', icon: '🔥' },
            ].map((badge, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-muted/20">
                <div className="text-3xl mb-1">{badge.icon}</div>
                <p className="text-xs font-medium">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StepCount;

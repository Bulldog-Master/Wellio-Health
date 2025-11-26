import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const StepCount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(500);
  const [hourlySteps, setHourlySteps] = useState<number[]>(Array(24).fill(0));
  const [sessions, setSessions] = useState<any[]>([]);

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

      // Fetch user goals
      const { data: profile } = await supabase
        .from('profiles')
        .select('move_goal')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.move_goal) {
        setCalorieGoal(profile.move_goal);
      }

      // Fetch today's wearable data
      const { data: todayData } = await supabase
        .from('wearable_data')
        .select('steps, calories_burned')
        .eq('user_id', user.id)
        .eq('data_date', today)
        .maybeSingle();

      setSteps(todayData?.steps || 0);

      // Fetch today's activity calories
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('calories_burned')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      const activityCalories = activities?.reduce((sum, a) => sum + (a.calories_burned || 0), 0) || 0;
      const totalCalories = (todayData?.calories_burned || 0) + activityCalories;
      setCalories(totalCalories);

      // Fetch today's activity sessions
      const { data: todaySessions } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: false });

      setSessions(todaySessions || []);

      // Generate simulated hourly data (in real app, this would come from device API)
      const simulated = Array(24).fill(0);
      const totalSteps = todayData?.steps || 0;
      const activeHours = [6, 7, 8, 9, 12, 13, 14, 17, 18, 19]; // Typical active hours
      activeHours.forEach(hour => {
        simulated[hour] = Math.floor((totalSteps / activeHours.length) * (0.8 + Math.random() * 0.4));
      });
      setHourlySteps(simulated);
    } catch (error) {
      console.error('Error fetching step data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance in km (average: 1250 steps = 1 km)
  const distanceKm = (steps / 1250).toFixed(2);
  
  // Calculate calorie ring progress
  const caloriePercentage = Math.min((calories / calorieGoal) * 100, 100);
  const center = 90;
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (caloriePercentage / 100) * circumference;

  // Find max steps for chart scaling
  const maxHourlySteps = Math.max(...hourlySteps, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Summary Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {format(new Date(), 'EEEE, MMM dd').toUpperCase()}
        </p>
        <h1 className="text-5xl font-bold mt-1">Summary</h1>
      </div>

      <div className="space-y-3 px-6">
        {/* Activity Ring Card */}
        <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Activity Ring</h2>
            <div className="flex items-center gap-8">
              {/* Move Ring */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg width="100%" height="100%" viewBox="0 0 180 180">
                  <defs>
                    <linearGradient id="moveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#FF006E' }} />
                      <stop offset="100%" style={{ stopColor: '#FF4081' }} />
                    </linearGradient>
                  </defs>
                  
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#FF006E"
                    strokeWidth="16"
                    opacity="0.2"
                  />
                  
                  {caloriePercentage > 0 && (
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke="url(#moveGrad)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      transform={`rotate(-90 ${center} ${center})`}
                      style={{ 
                        transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  )}
                </svg>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-2xl font-semibold mb-1">Move</h3>
                <p className="text-3xl font-bold" style={{ color: '#FF006E' }}>
                  {calories}/{calorieGoal}
                  <span className="text-xl">CAL</span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step Count Card */}
        <Card 
          className="bg-card/50 backdrop-blur border-border/50 overflow-hidden cursor-pointer hover:bg-card/70 transition-all"
          onClick={() => {}}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Step Count</h2>
              <ChevronRight className="w-6 h-6 text-success" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">Today</p>
            <p className="text-5xl font-bold mb-6" style={{ color: '#A78BFA' }}>
              {steps.toLocaleString()}
            </p>

            {/* Hourly Chart */}
            <div className="relative h-24">
              <div className="absolute inset-0 flex items-end justify-between gap-1">
                {hourlySteps.map((count, hour) => {
                  const height = (count / maxHourlySteps) * 100;
                  const isActive = count > 0;
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full rounded-t transition-all"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: isActive ? '#A78BFA' : '#3F3F46',
                          opacity: isActive ? 0.9 : 0.3
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Time labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Step Distance Card */}
        <Card 
          className="bg-card/50 backdrop-blur border-border/50 overflow-hidden cursor-pointer hover:bg-card/70 transition-all"
          onClick={() => {}}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Step Distance</h2>
              <ChevronRight className="w-6 h-6 text-cyan-500" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">Today</p>
            <p className="text-5xl font-bold mb-6 text-cyan-400">
              {distanceKm}<span className="text-3xl">km</span>
            </p>

            {/* Hourly Distance Chart */}
            <div className="relative h-24">
              <div className="absolute inset-0 flex items-end justify-between gap-1">
                {hourlySteps.map((count, hour) => {
                  const height = (count / maxHourlySteps) * 100;
                  const isActive = count > 0;
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full rounded-t transition-all"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: isActive ? '#22D3EE' : '#3F3F46',
                          opacity: isActive ? 0.9 : 0.3
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Time labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Sessions Card */}
        <Card 
          className="bg-card/50 backdrop-blur border-border/50 overflow-hidden cursor-pointer hover:bg-card/70 transition-all"
          onClick={() => navigate('/activity')}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Sessions</h2>
              <ChevronRight className="w-6 h-6 text-success" />
            </div>
            
            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No sessions recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-semibold">{session.activity_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.duration_minutes} min
                        {session.calories_burned && ` · ${session.calories_burned} cal`}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.logged_at), 'h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StepCount;

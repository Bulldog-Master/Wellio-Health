import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { TrendingDown, Flame, Dumbbell } from "lucide-react";
import { useTranslation } from "react-i18next";

export const DashboardCharts = () => {
  const { t } = useTranslation('common');
  const [weightData, setWeightData] = useState<any[]>([]);
  const [calorieData, setCalorieData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = subDays(new Date(), 7);

      // Fetch weight data
      const { data: weights } = await supabase
        .from('weight_logs')
        .select('weight_lbs, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: true });

      // Fetch calorie data
      const { data: nutrition } = await supabase
        .from('nutrition_logs')
        .select('calories, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: true });

      // Fetch workout data
      const { data: workouts } = await supabase
        .from('activity_logs')
        .select('duration_minutes, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: true });

      // Process weight data
      const weightMap = new Map();
      weights?.forEach(w => {
        const date = format(new Date(w.logged_at), 'MMM dd');
        if (!weightMap.has(date) || new Date(w.logged_at) > new Date(weightMap.get(date).logged_at)) {
          weightMap.set(date, w);
        }
      });
      setWeightData(Array.from(weightMap.values()).map(w => ({
        date: format(new Date(w.logged_at), 'MMM dd'),
        weight: w.weight_lbs
      })));

      // Process calorie data
      const calorieMap = new Map();
      nutrition?.forEach(n => {
        const date = format(new Date(n.logged_at), 'MMM dd');
        const existing = calorieMap.get(date) || 0;
        calorieMap.set(date, existing + (n.calories || 0));
      });
      setCalorieData(Array.from(calorieMap.entries()).map(([date, calories]) => ({
        date,
        calories
      })));

      // Process workout data
      const workoutMap = new Map();
      workouts?.forEach(w => {
        const date = format(new Date(w.logged_at), 'MMM dd');
        const existing = workoutMap.get(date) || 0;
        workoutMap.set(date, existing + w.duration_minutes);
      });
      setWorkoutData(Array.from(workoutMap.entries()).map(([date, duration]) => ({
        date,
        duration
      })));

    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Weight Trend */}
      <Card className="p-5 overflow-visible">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-sm">{t('weight_7_days')}</h3>
        </div>
        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={weightData}>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">{t('no_data')}</p>
        )}
      </Card>

      {/* Calorie Trend */}
      <Card className="p-5 overflow-visible">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <h3 className="font-semibold text-sm">{t('calories_7_days')}</h3>
        </div>
        {calorieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={calorieData}>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="calories" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">{t('no_data')}</p>
        )}
      </Card>

      {/* Workout Trend */}
      <Card className="p-5 overflow-visible">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-5 h-5 text-purple-500 flex-shrink-0" />
          <h3 className="font-semibold text-sm">{t('workouts_7_days')}</h3>
        </div>
        {workoutData.length > 0 ? (
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={workoutData}>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value} min`, t('duration')]}
              />
              <Bar 
                dataKey="duration" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">{t('no_data')}</p>
        )}
      </Card>
    </div>
  );
};

import { Activity, Flame, Target, TrendingUp, Droplets, Moon, Camera } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import ActivityRings from "@/components/ActivityRings";
import { StreakTracker } from "@/components/StreakTracker";
import { NutritionGoals } from "@/components/NutritionGoals";
import { DashboardCharts } from "@/components/DashboardCharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentWeight, setCurrentWeight] = useState(0);
  const [targetWeight, setTargetWeight] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(1450);
  const caloriesTarget = 2000;
  
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile data for target weight
      const { data: profile } = await supabase
        .from('profiles')
        .select('weight, target_weight')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        if (profile.target_weight) setTargetWeight(profile.target_weight);
        if (profile.weight) setCurrentWeight(profile.weight);
      }

      // Fetch latest weight log (more recent than profile)
      const { data: weightLog } = await supabase
        .from('weight_logs')
        .select('weight_lbs')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (weightLog) {
        setCurrentWeight(weightLog.weight_lbs);
      }

      // Fetch today's calories
      const today = new Date().toISOString().split('T')[0];
      const { data: meals } = await supabase
        .from('nutrition_logs')
        .select('calories')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      if (meals) {
        const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        setCaloriesConsumed(totalCalories);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Convert lbs to kg
  const lbsToKg = (lbs: number) => (lbs * 0.453592).toFixed(1);
  
  // Calculate weight difference
  const weightDifference = currentWeight && targetWeight 
    ? Math.abs(currentWeight - targetWeight)
    : 0;

  const weightProgress = currentWeight && targetWeight 
    ? Math.min(((currentWeight - targetWeight) / (currentWeight - targetWeight + targetWeight)) * 100, 100)
    : 0;
  const caloriesProgress = (caloriesConsumed / caloriesTarget) * 100;

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Welcome back!</h1>
        <p className="text-sm md:text-base text-muted-foreground">Here's your fitness overview for today</p>
      </div>

      {/* Dashboard Mini-Charts */}
      <DashboardCharts />

      {/* Activity Rings - Compact */}
      <Card className="p-3 md:p-4 bg-white dark:bg-gray-800 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">Today's Activity</h3>
          <Activity className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </div>
        <ActivityRings />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Calories Today"
          value={caloriesConsumed}
          subtitle={`${caloriesTarget - caloriesConsumed} left`}
          icon={Flame}
          trend="neutral"
          variant="primary"
        />
        <MetricCard
          title="Target Weight"
          value={targetWeight ? `${targetWeight} lbs (${lbsToKg(targetWeight)} kg)` : 'Set Goal'}
          subtitle={
            targetWeight && currentWeight 
              ? `${weightDifference.toFixed(1)} lbs (${lbsToKg(weightDifference)} kg) to go`
              : 'No target set'
          }
          icon={Target}
          trend="neutral"
        />
        <MetricCard
          title="Weekly Progress"
          value="+5%"
          subtitle="On track"
          icon={TrendingUp}
          trend="up"
          variant="accent"
        />
      </div>

      {/* Streak Tracker */}
      <StreakTracker />

      {/* Nutrition Goals */}
      <NutritionGoals />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 bg-gradient-card shadow-md">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Weight Goal Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress to Target</span>
                <span className="text-sm font-medium text-primary">{Math.round(100 - weightProgress)}%</span>
              </div>
              <Progress value={100 - weightProgress} className="h-3" />
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Target: {targetWeight} lbs ({lbsToKg(targetWeight)} kg)
              </p>
              <p className="text-sm text-muted-foreground">
                {weightDifference.toFixed(1)} lbs ({lbsToKg(weightDifference)} kg) remaining
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-gradient-card shadow-md">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Daily Calorie Goal</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Today's Progress</span>
                <span className="text-sm font-medium text-primary">
                  {Math.round(caloriesProgress)}%
                </span>
              </div>
              <Progress value={caloriesProgress} className="h-3" />
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Daily Goal: {caloriesTarget} calories
              </p>
              <p className="text-sm text-muted-foreground">
                {caloriesTarget - caloriesConsumed} calories remaining
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-3">
          <Button 
            onClick={() => navigate('/weight')}
            className="h-auto py-4 flex-col gap-2 bg-primary hover:bg-primary/90"
          >
            <Activity className="w-5 h-5" />
            <span className="text-sm">Log Weight</span>
          </Button>
          <Button 
            onClick={() => navigate('/food')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <Flame className="w-5 h-5" />
            <span className="text-sm">Add Meal</span>
          </Button>
          <Button 
            onClick={() => navigate('/workout')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Log Workout</span>
          </Button>
          <Button 
            onClick={() => navigate('/water-intake')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <Droplets className="w-5 h-5" />
            <span className="text-sm">Water Intake</span>
          </Button>
          <Button 
            onClick={() => navigate('/sleep-tracking')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <Moon className="w-5 h-5" />
            <span className="text-sm">Sleep</span>
          </Button>
          <Button 
            onClick={() => navigate('/progress-photos')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm">Progress Pics</span>
          </Button>
          <Button 
            onClick={() => navigate('/fitness-goals')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <Target className="w-5 h-5" />
            <span className="text-sm">Goals</span>
          </Button>
          <Button 
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2 relative cursor-not-allowed opacity-60"
            disabled
          >
            <Activity className="w-5 h-5" />
            <span className="text-sm">Step Count</span>
            <span className="absolute bottom-1 text-[9px] text-muted-foreground/50 font-medium">Coming Soon!</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

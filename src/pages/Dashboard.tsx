// Quick Actions with vibrant icon colors - Updated
import { Activity, Flame, Target, TrendingUp, Droplets, Moon, Camera, Zap, HeartPulse, Users } from "lucide-react";
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
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import hero3d from "@/assets/hero-diverse.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const { tier } = useSubscription();
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
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Modern 3D Hero Section */}
      <div className="relative rounded-2xl overflow-hidden">
        <img 
          src={hero3d} 
          alt="3D Abstract Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/60" />
        <div className="relative flex flex-col justify-center items-start p-6 md:p-10 py-8 md:py-10 text-white">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6 animate-float">
            <Zap className="w-5 h-5 text-white drop-shadow-glow" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              Your Journey
            </span>
          </div>
          
          {/* Title with shared W */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <span className="text-8xl md:text-9xl font-black drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] leading-none">W</span>
              <div className="flex flex-col pt-1">
                <span className="text-4xl md:text-5xl font-black drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] leading-tight">ellio</span>
                <div className="flex items-center gap-2">
                  <span className="text-4xl md:text-5xl font-black drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] leading-tight">elcome back!</span>
                  <HeartPulse className="w-7 h-7 md:w-8 md:h-8 text-white drop-shadow-glow animate-pulse flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg md:text-xl text-white/95 mb-6 max-w-2xl drop-shadow-md">
            Your fitness stats are looking great today. Keep pushing forward!
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/workout')}
              className="bg-white text-primary hover:bg-white/90 shadow-lg flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Start Workout
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/food/log')}
              className="border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm flex items-center gap-2"
            >
              <Flame className="w-5 h-5" />
              Log Meal
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {tier === 'free' && (
        <UpgradePrompt compact feature="advanced features" />
      )}

      {/* Dashboard Mini-Charts */}
      <DashboardCharts />

      {/* Activity Rings - Compact with glassmorphism */}
      <Card className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Today's Activity</h3>
          <div className="p-2 bg-primary/10 rounded-xl">
            <Activity className="w-5 h-5 text-primary" />
          </div>
        </div>
        <ActivityRings />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card-hover">
          <MetricCard
            title="Calories Today"
            value={caloriesConsumed}
            subtitle={`${caloriesTarget - caloriesConsumed} left`}
            icon={Flame}
            trend="neutral"
            variant="primary"
          />
        </div>
        <div className="card-hover">
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
        </div>
        <div className="card-hover">
          <MetricCard
            title="Weekly Progress"
            value="+5%"
            subtitle="On track"
            icon={TrendingUp}
            trend="up"
            variant="accent"
          />
        </div>
      </div>

      {/* Streak Tracker */}
      <StreakTracker />

      {/* Nutrition Goals */}
      <NutritionGoals />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Weight Goal Progress</h3>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>
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

        <Card className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Daily Calorie Goal</h3>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Flame className="w-5 h-5 text-primary" />
            </div>
          </div>
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

      <Card className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="p-2 bg-primary/10 rounded-xl">
            <Zap className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
          <Button 
            onClick={() => navigate('/weight')}
            variant="secondary"
            className="h-auto py-4 flex-col gap-2"
          >
            <span style={{ color: 'hsl(195, 100%, 50%)' }}>
              <Activity className="w-5 h-5" />
            </span>
            <span className="text-sm">Log Weight</span>
          </Button>
          <Button 
            onClick={() => navigate('/food')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <span style={{ color: 'hsl(15, 100%, 60%)' }}>
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-sm">Add Meal</span>
          </Button>
          <Button 
            onClick={() => navigate('/workout')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <span style={{ color: 'hsl(145, 80%, 50%)' }}>
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-sm">Log Workout</span>
          </Button>
          <Button 
            onClick={() => navigate('/water-intake')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <span style={{ color: 'hsl(200, 100%, 55%)' }}>
              <Droplets className="w-5 h-5" />
            </span>
            <span className="text-sm">Water Intake</span>
          </Button>
          <Button 
            onClick={() => navigate('/sleep-tracking')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <span style={{ color: 'hsl(280, 95%, 68%)' }}>
              <Moon className="w-5 h-5" />
            </span>
            <span className="text-sm">Sleep</span>
          </Button>
          <Button 
            onClick={() => navigate('/progress-photos')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <span style={{ color: 'hsl(340, 100%, 62%)' }}>
              <Camera className="w-5 h-5" />
            </span>
            <span className="text-sm">Progress Pics</span>
          </Button>
          <Button 
            onClick={() => navigate('/fitness-goals')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <span style={{ color: 'hsl(35, 100%, 58%)' }}>
              <Target className="w-5 h-5" />
            </span>
            <span className="text-sm">Goals</span>
          </Button>
          <Button 
            onClick={() => navigate('/groups')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <span style={{ color: 'hsl(270, 100%, 65%)' }}>
              <Users className="w-5 h-5" />
            </span>
            <span className="text-sm">Groups</span>
          </Button>
          <Button
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2 relative cursor-not-allowed opacity-60"
            disabled
          >
            <span style={{ color: 'hsl(165, 85%, 48%)' }}>
              <Activity className="w-5 h-5" />
            </span>
            <span className="text-sm">Step Count</span>
            <span className="absolute bottom-1 text-[9px] text-muted-foreground/50 font-medium">Coming Soon!</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

import { Activity, Flame, Target, TrendingUp } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock data - will be replaced with real data later
  const currentWeight = 165;
  const targetWeight = 155;
  const weightProgress = ((currentWeight - targetWeight) / currentWeight) * 100;
  const caloriesConsumed = 1450;
  const caloriesTarget = 2000;
  const caloriesProgress = (caloriesConsumed / caloriesTarget) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Here's your fitness overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Weight"
          value={`${currentWeight} lbs`}
          subtitle="-2 lbs"
          icon={Activity}
          trend="down"
        />
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
          value={`${targetWeight} lbs`}
          subtitle={`${currentWeight - targetWeight} lbs to go`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-4">Weight Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current: {currentWeight} lbs</span>
                <span className="text-sm text-muted-foreground">Target: {targetWeight} lbs</span>
              </div>
              <Progress value={100 - weightProgress} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              You're {currentWeight - targetWeight} lbs away from your goal. Keep it up!
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-4">Today's Nutrition</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {caloriesConsumed} / {caloriesTarget} cal
                </span>
                <span className="text-sm font-medium text-primary">
                  {Math.round(caloriesProgress)}%
                </span>
              </div>
              <Progress value={caloriesProgress} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              You have {caloriesTarget - caloriesConsumed} calories remaining for today.
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            onClick={() => navigate('/profile')}
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
          >
            <Target className="w-5 h-5" />
            <span className="text-sm">View Goals</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

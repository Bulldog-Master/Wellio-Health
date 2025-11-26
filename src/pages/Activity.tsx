import { Card } from "@/components/ui/card";
import { Activity as ActivityIcon, TrendingUp, Calendar, Flame, Watch, Heart, Moon, Footprints, Plus, Scale, Dumbbell, CheckSquare, Pill, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { formatDistance } from "@/lib/unitConversion";
import { format, subDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ActivityLog {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number | null;
  distance_miles: number | null;
  logged_at: string;
}

interface WearableData {
  id: string;
  device_name: string;
  steps: number | null;
  calories_burned: number | null;
  heart_rate: number | null;
  sleep_hours: number | null;
  data_date: string;
}

const Activity = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { preferredUnit } = useUserPreferences();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [wearableData, setWearableData] = useState<WearableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [wearableForm, setWearableForm] = useState({
    deviceName: "fitbit",
    customDevice: "",
    steps: "",
    caloriesBurned: "",
    heartRate: "",
    sleepHours: "",
    dataDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const commonDevices = [
    { value: "fitbit", label: "Fitbit" },
    { value: "apple_watch", label: "Apple Watch" },
    { value: "garmin", label: "Garmin" },
    { value: "samsung_health", label: "Samsung Health" },
    { value: "whoop", label: "Whoop" },
    { value: "oura", label: "Oura Ring" },
    { value: "custom", label: "Custom Device" },
  ];

  useEffect(() => {
    fetchActivityLogs();
    fetchWearableData();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWearableData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

      const { data, error } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_date', format(sevenDaysAgo, 'yyyy-MM-dd'))
        .order('data_date', { ascending: false });

      if (error) throw error;
      setWearableData(data || []);
    } catch (error) {
      console.error('Error fetching wearable data:', error);
    }
  };

  const weeklyStats = {
    totalDuration: activityLogs.reduce((sum, log) => sum + log.duration_minutes, 0),
    totalCalories: activityLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0),
    totalDistance: activityLogs.reduce((sum, log) => sum + (log.distance_miles || 0), 0),
    workoutCount: activityLogs.length,
  };

  const handleSaveWearableData = async () => {
    if (!wearableForm.steps && !wearableForm.caloriesBurned && !wearableForm.heartRate && !wearableForm.sleepHours) {
      toast({
        title: "No data entered",
        description: "Please enter at least one metric.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save wearable data.",
          variant: "destructive",
        });
        return;
      }

      const deviceName = wearableForm.deviceName === "custom" 
        ? wearableForm.customDevice 
        : commonDevices.find(d => d.value === wearableForm.deviceName)?.label || wearableForm.deviceName;

      const { error } = await supabase
        .from('wearable_data')
        .insert({
          user_id: user.id,
          device_name: deviceName,
          steps: wearableForm.steps ? parseInt(wearableForm.steps) : null,
          calories_burned: wearableForm.caloriesBurned ? parseInt(wearableForm.caloriesBurned) : null,
          heart_rate: wearableForm.heartRate ? parseInt(wearableForm.heartRate) : null,
          sleep_hours: wearableForm.sleepHours ? parseFloat(wearableForm.sleepHours) : null,
          data_date: wearableForm.dataDate,
        });

      if (error) throw error;

      toast({
        title: "Data saved",
        description: "Wearable data has been logged successfully.",
      });

      // Reset form
      setWearableForm({
        deviceName: "fitbit",
        customDevice: "",
        steps: "",
        caloriesBurned: "",
        heartRate: "",
        sleepHours: "",
        dataDate: format(new Date(), 'yyyy-MM-dd'),
      });

      fetchWearableData();
    } catch (error) {
      console.error('Error saving wearable data:', error);
      toast({
        title: "Error",
        description: "Failed to save wearable data.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <ActivityIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="text-muted-foreground">Track fitness, weight, workouts, and habits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate('/weight')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Weight</h3>
              <p className="text-sm text-muted-foreground">Track your weight progress</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer hover-scale"
          onClick={() => navigate('/step-count')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <Footprints className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Step Count</h3>
              <p className="text-sm text-muted-foreground">Daily steps & distance</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate('/workout')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-xl">
              <Dumbbell className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Workout</h3>
              <p className="text-sm text-muted-foreground">Log and plan workouts</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate('/habits')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <CheckSquare className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Habits</h3>
              <p className="text-sm text-muted-foreground">Build and track habits</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate('/supplements')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary/20 rounded-xl">
              <Pill className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Supplements</h3>
              <p className="text-sm text-muted-foreground">Manage your supplements</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate('/interval-timer')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Timer className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Interval Timer</h3>
              <p className="text-sm text-muted-foreground">Custom workout timers</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Workouts</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{weeklyStats.workoutCount}</p>
          <p className="text-sm text-muted-foreground">This week</p>
        </Card>

        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <h3 className="font-semibold">Calories</h3>
          </div>
          <p className="text-3xl font-bold">{weeklyStats.totalCalories}</p>
          <p className="text-sm opacity-90">Burned this week</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <ActivityIcon className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold">Duration</h3>
          </div>
          <p className="text-3xl font-bold text-secondary">{weeklyStats.totalDuration}</p>
          <p className="text-sm text-muted-foreground">Minutes</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Distance</h3>
          </div>
          <p className="text-3xl font-bold text-accent">
            {preferredUnit === 'metric' 
              ? (weeklyStats.totalDistance * 1.60934).toFixed(1)
              : weeklyStats.totalDistance.toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground">{preferredUnit === 'metric' ? 'km' : 'mi'}</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Log Wearable Data</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="deviceName">Device</Label>
            <Select 
              value={wearableForm.deviceName} 
              onValueChange={(value) => setWearableForm({ ...wearableForm, deviceName: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {commonDevices.map((device) => (
                  <SelectItem key={device.value} value={device.value}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {wearableForm.deviceName === "custom" && (
            <div>
              <Label htmlFor="customDevice">Custom Device Name</Label>
              <Input
                id="customDevice"
                value={wearableForm.customDevice}
                onChange={(e) => setWearableForm({ ...wearableForm, customDevice: e.target.value })}
                placeholder="Enter device name"
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label htmlFor="dataDate">Date</Label>
            <Input
              id="dataDate"
              type="date"
              value={wearableForm.dataDate}
              onChange={(e) => setWearableForm({ ...wearableForm, dataDate: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="steps">Steps</Label>
              <Input
                id="steps"
                type="number"
                value={wearableForm.steps}
                onChange={(e) => setWearableForm({ ...wearableForm, steps: e.target.value })}
                placeholder="10000"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="caloriesBurned">Calories Burned</Label>
              <Input
                id="caloriesBurned"
                type="number"
                value={wearableForm.caloriesBurned}
                onChange={(e) => setWearableForm({ ...wearableForm, caloriesBurned: e.target.value })}
                placeholder="500"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
              <Input
                id="heartRate"
                type="number"
                value={wearableForm.heartRate}
                onChange={(e) => setWearableForm({ ...wearableForm, heartRate: e.target.value })}
                placeholder="75"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="sleepHours">Sleep Hours</Label>
              <Input
                id="sleepHours"
                type="number"
                step="0.1"
                value={wearableForm.sleepHours}
                onChange={(e) => setWearableForm({ ...wearableForm, sleepHours: e.target.value })}
                placeholder="7.5"
                className="mt-1.5"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveWearableData} 
            className="w-full gap-2"
            disabled={isSaving}
          >
            <Plus className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Wearable Data"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Watch className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Wearable Device Data</h3>
        </div>
        <div className="space-y-3">
          {wearableData.length > 0 ? (
            wearableData.map((data) => (
              <div key={data.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{data.device_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(data.data_date), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.steps && (
                    <div className="flex items-center gap-2 text-sm">
                      <Footprints className="w-4 h-4 text-primary" />
                      <span>{data.steps.toLocaleString()} steps</span>
                    </div>
                  )}
                  {data.calories_burned && (
                    <div className="flex items-center gap-2 text-sm">
                      <Flame className="w-4 h-4 text-accent" />
                      <span>{data.calories_burned} cal</span>
                    </div>
                  )}
                  {data.heart_rate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{data.heart_rate} bpm</span>
                    </div>
                  )}
                  {data.sleep_hours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Moon className="w-4 h-4 text-blue-500" />
                      <span>{data.sleep_hours}h sleep</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No wearable data synced yet. Connect your fitness device to track steps, heart rate, and more!
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activities (Last 7 Days)</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div key={log.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{log.activity_type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.logged_at), "PPp")}
                    </p>
                  </div>
                  {log.calories_burned && (
                    <span className="font-bold text-accent">{log.calories_burned} cal</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{log.duration_minutes} min</span>
                  {log.distance_miles && (
                    <span>{formatDistance(log.distance_miles, preferredUnit)}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No activities in the last 7 days. Start logging your workouts!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Activity;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Clock } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const { permission, requestPermission, isSupported } = useNotifications();
  
  const [settings, setSettings] = useState({
    reminder_meal_logging: true,
    reminder_workout: true,
    reminder_weigh_in: true,
    reminder_habits: true,
    reminder_time_meal: "12:00",
    reminder_time_workout: "18:00",
    reminder_time_weigh_in: "08:00",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("reminder_meal_logging, reminder_workout, reminder_weigh_in, reminder_habits, reminder_time_meal, reminder_time_workout, reminder_time_weigh_in")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings({
          reminder_meal_logging: data.reminder_meal_logging ?? true,
          reminder_workout: data.reminder_workout ?? true,
          reminder_weigh_in: data.reminder_weigh_in ?? true,
          reminder_habits: data.reminder_habits ?? true,
          reminder_time_meal: data.reminder_time_meal ?? "12:00",
          reminder_time_workout: data.reminder_time_workout ?? "18:00",
          reminder_time_weigh_in: data.reminder_time_weigh_in ?? "08:00",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...settings
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your notifications and reminders</p>
      </div>

      {/* Notification Permission */}
      {isSupported && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Bell className="w-6 h-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Browser Notifications</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {permission === "granted" 
                  ? "Notifications are enabled. You'll receive reminders based on your preferences below."
                  : permission === "denied"
                  ? "Notifications are blocked. Please enable them in your browser settings."
                  : "Enable notifications to receive helpful reminders throughout the day."}
              </p>
              {permission === "default" && (
                <Button onClick={requestPermission} variant="outline" size="sm">
                  Enable Notifications
                </Button>
              )}
              {permission === "granted" && (
                <p className="text-xs text-green-600 font-medium">✓ Enabled</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Reminder Settings */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <Clock className="w-6 h-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Reminder Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Choose when you'd like to receive reminders
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Meal Logging */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex-1">
              <Label htmlFor="meal-reminder" className="text-base">Meal Logging</Label>
              <p className="text-sm text-muted-foreground">Remind me to log my meals</p>
            </div>
            <div className="flex items-center gap-4">
              {settings.reminder_meal_logging && (
                <Input
                  type="time"
                  value={settings.reminder_time_meal}
                  onChange={(e) => updateSetting("reminder_time_meal", e.target.value)}
                  className="w-32"
                />
              )}
              <Switch
                id="meal-reminder"
                checked={settings.reminder_meal_logging}
                onCheckedChange={(checked) => updateSetting("reminder_meal_logging", checked)}
              />
            </div>
          </div>

          {/* Workout */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex-1">
              <Label htmlFor="workout-reminder" className="text-base">Workout Time</Label>
              <p className="text-sm text-muted-foreground">Remind me to exercise</p>
            </div>
            <div className="flex items-center gap-4">
              {settings.reminder_workout && (
                <Input
                  type="time"
                  value={settings.reminder_time_workout}
                  onChange={(e) => updateSetting("reminder_time_workout", e.target.value)}
                  className="w-32"
                />
              )}
              <Switch
                id="workout-reminder"
                checked={settings.reminder_workout}
                onCheckedChange={(checked) => updateSetting("reminder_workout", checked)}
              />
            </div>
          </div>

          {/* Weigh-in */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex-1">
              <Label htmlFor="weighin-reminder" className="text-base">Weigh-in Reminder</Label>
              <p className="text-sm text-muted-foreground">Remind me to track my weight</p>
            </div>
            <div className="flex items-center gap-4">
              {settings.reminder_weigh_in && (
                <Input
                  type="time"
                  value={settings.reminder_time_weigh_in}
                  onChange={(e) => updateSetting("reminder_time_weigh_in", e.target.value)}
                  className="w-32"
                />
              )}
              <Switch
                id="weighin-reminder"
                checked={settings.reminder_weigh_in}
                onCheckedChange={(checked) => updateSetting("reminder_weigh_in", checked)}
              />
            </div>
          </div>

          {/* Habits */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="habits-reminder" className="text-base">Habit Tracking</Label>
              <p className="text-sm text-muted-foreground">Remind me to complete my habits</p>
            </div>
            <Switch
              id="habits-reminder"
              checked={settings.reminder_habits}
              onCheckedChange={(checked) => updateSetting("reminder_habits", checked)}
            />
          </div>
        </div>
      </Card>

      <Button onClick={saveSettings} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
};

export default Settings;

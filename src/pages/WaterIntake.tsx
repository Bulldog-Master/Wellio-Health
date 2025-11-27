import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplets, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface WaterLog {
  id: string;
  amount_ml: number;
  logged_at: string;
}

const WaterIntake = () => {
  const navigate = useNavigate();
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [dailyGoal] = useState(2000); // 2L default goal
  const [loading, setLoading] = useState(true);

  const quickAmounts = [250, 500, 750, 1000]; // ml

  useEffect(() => {
    fetchTodayWater();
  }, []);

  const fetchTodayWater = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', today.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setWaterLogs(data || []);
    } catch (error) {
      console.error('Error fetching water logs:', error);
      toast.error('Failed to load water intake data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('water_logs')
        .insert({
          user_id: user.id,
          amount_ml: amount,
        });

      if (error) throw error;
      
      toast.success(`Added ${amount}ml of water`);
      fetchTodayWater();
    } catch (error) {
      console.error('Error adding water:', error);
      toast.error('Failed to log water intake');
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('water_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Water log deleted');
      fetchTodayWater();
    } catch (error) {
      console.error('Error deleting water log:', error);
      toast.error('Failed to delete water log');
    }
  };

  const totalToday = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  const progress = Math.min((totalToday / dailyGoal) * 100, 100);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Droplets className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Water Intake</h1>
          <p className="text-muted-foreground">Track your daily hydration</p>
        </div>
      </div>

      {/* Daily Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Today's Progress</h3>
            <span className="text-2xl font-bold text-primary">
              {totalToday}ml / {dailyGoal}ml
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {progress >= 100 ? '🎉 Daily goal achieved!' : `${dailyGoal - totalToday}ml remaining`}
          </p>
        </div>
      </Card>

      {/* Quick Add Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Add</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              onClick={() => handleAddWater(amount)}
              className="h-20 flex flex-col gap-1"
            >
              <Droplets className="w-5 h-5" />
              <span className="text-lg font-semibold">{amount}ml</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Today's Logs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Log</h3>
        {waterLogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No water logged today. Start tracking your hydration!
          </p>
        ) : (
          <div className="space-y-2">
            {waterLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{log.amount_ml}ml</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.logged_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteLog(log.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WaterIntake;
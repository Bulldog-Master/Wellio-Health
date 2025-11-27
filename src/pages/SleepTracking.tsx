import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Moon, ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface SleepData {
  id: string;
  data_date: string;
  sleep_hours: number;
  device_name: string;
}

const SleepTracking = () => {
  const navigate = useNavigate();
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSleepData();
  }, []);

  const fetchSleepData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = subDays(new Date(), 30);

      const { data, error } = await supabase
        .from('wearable_data')
        .select('id, data_date, sleep_hours, device_name')
        .eq('user_id', user.id)
        .gte('data_date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .not('sleep_hours', 'is', null)
        .order('data_date', { ascending: false });

      if (error) throw error;
      setSleepData(data || []);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      toast.error('Failed to load sleep data');
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyAverage = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    const weekData = sleepData.filter(d => {
      const date = new Date(d.data_date);
      return date >= weekStart && date <= weekEnd;
    });

    if (weekData.length === 0) return 0;
    const total = weekData.reduce((sum, d) => sum + (d.sleep_hours || 0), 0);
    return (total / weekData.length).toFixed(1);
  };

  const getMonthlyAverage = () => {
    if (sleepData.length === 0) return 0;
    const total = sleepData.reduce((sum, d) => sum + (d.sleep_hours || 0), 0);
    return (total / sleepData.length).toFixed(1);
  };

  const getLastNight = () => {
    if (sleepData.length === 0) return null;
    return sleepData[0];
  };

  const lastNight = getLastNight();

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
          <Moon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Sleep Tracking</h1>
          <p className="text-muted-foreground">Monitor your sleep patterns</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Moon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Last Night</h3>
          </div>
          {lastNight ? (
            <>
              <p className="text-3xl font-bold">{lastNight.sleep_hours}h</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(lastNight.data_date), 'MMM d, yyyy')}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No data</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Weekly Average</h3>
          </div>
          <p className="text-3xl font-bold">{getWeeklyAverage()}h</p>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Monthly Average</h3>
          </div>
          <p className="text-3xl font-bold">{getMonthlyAverage()}h</p>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </Card>
      </div>

      {/* Sleep History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sleep History</h3>
        {sleepData.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              No sleep data available yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Connect a wearable device in the Activity section to track your sleep.
            </p>
            <Button onClick={() => navigate("/activity")}>
              Go to Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sleepData.map((sleep) => (
              <div
                key={sleep.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Moon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(sleep.data_date), 'EEEE, MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sleep.device_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{sleep.sleep_hours}h</p>
                  <p className="text-sm text-muted-foreground">
                    {sleep.sleep_hours >= 7 && sleep.sleep_hours <= 9
                      ? '✅ Optimal'
                      : sleep.sleep_hours < 7
                      ? '⚠️ Below target'
                      : '⚠️ Above target'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SleepTracking;
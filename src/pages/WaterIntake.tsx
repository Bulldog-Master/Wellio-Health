import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplets, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

interface WaterLog {
  id: string;
  amount_ml: number;
  logged_at: string;
}

const WaterIntake = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('food');
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

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setWaterLogs(data || []);
    } catch (error) {
      console.error('Error fetching water logs:', error);
      toast.error(t('failed_load_water'));
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
      
      toast.success(t('added_water', { amount }));
      fetchTodayWater();
    } catch (error) {
      console.error('Error adding water:', error);
      toast.error(t('failed_log_water'));
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('water_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success(t('water_log_deleted'));
      fetchTodayWater();
    } catch (error) {
      console.error('Error deleting water log:', error);
      toast.error(t('failed_delete_water'));
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayLogs = waterLogs.filter(log => {
    const logDate = new Date(log.logged_at);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });

  const totalToday = todayLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  const progress = Math.min((totalToday / dailyGoal) * 100, 100);

  // Calculate period totals
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const totalThisWeek = waterLogs
    .filter(log => new Date(log.logged_at) >= weekStart)
    .reduce((sum, log) => sum + log.amount_ml, 0);

  const totalThisMonth = waterLogs
    .filter(log => new Date(log.logged_at) >= monthStart)
    .reduce((sum, log) => sum + log.amount_ml, 0);

  const totalThisYear = waterLogs
    .filter(log => new Date(log.logged_at) >= yearStart)
    .reduce((sum, log) => sum + log.amount_ml, 0);

  // Group logs by date
  const groupedLogs = waterLogs.reduce((groups, log) => {
    const date = new Date(log.logged_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, WaterLog[]>);

  // Group by year for annual view
  const yearlyTotals = waterLogs.reduce((totals, log) => {
    const year = new Date(log.logged_at).getFullYear();
    totals[year] = (totals[year] || 0) + log.amount_ml;
    return totals;
  }, {} as Record<number, number>);

  if (loading) {
    return <div className="p-6">{t('loading')}</div>;
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
        {t('back_to_dashboard')}
      </Button>

      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Droplets className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('water_intake')}</h1>
          <p className="text-muted-foreground mt-1">{t('track_daily_hydration')}</p>
        </div>
      </div>

      {/* Daily Progress */}
      <Card className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('todays_progress')}</h3>
            <span className="text-2xl font-bold text-primary">
              {totalToday}ml / {dailyGoal}ml
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {progress >= 100 ? t('daily_goal_achieved') : `${dailyGoal - totalToday}${t('ml_remaining')}`}
          </p>
        </div>
      </Card>

      {/* Period Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-muted-foreground">{t('this_week')}</p>
              <p className="text-2xl font-bold">{(totalThisWeek / 1000).toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">{totalThisWeek.toLocaleString()}ml</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            <div>
              <p className="text-sm text-muted-foreground">{t('this_month')}</p>
              <p className="text-2xl font-bold">{(totalThisMonth / 1000).toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">{totalThisMonth.toLocaleString()}ml</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <div>
              <p className="text-sm text-muted-foreground">{t('this_year')}</p>
              <p className="text-2xl font-bold">{(totalThisYear / 1000).toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">{totalThisYear.toLocaleString()}ml</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Annual Totals */}
      {Object.keys(yearlyTotals).length > 0 && (
        <Card className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{t('annual_summary')}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(yearlyTotals)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, total]) => (
                <div key={year} className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">{year}</p>
                  <p className="text-xl font-bold text-primary">{(total / 1000).toFixed(1)}L</p>
                  <p className="text-xs text-muted-foreground">{total.toLocaleString()}ml</p>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Quick Add Buttons */}
      <Card className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t('quick_add')}</h3>
        </div>
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

      {/* History by Date */}
      <Card className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Droplets className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t('history')}</h3>
        </div>
        {waterLogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t('no_water_logged')}
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, logs]) => {
              const dateTotal = logs.reduce((sum, log) => sum + log.amount_ml, 0);
              const isToday = date === today.toLocaleDateString();
              
              return (
                <div key={date} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">
                      {isToday ? t('today') : date}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {t('total')}: {dateTotal}ml
                    </span>
                  </div>
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
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
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WaterIntake;
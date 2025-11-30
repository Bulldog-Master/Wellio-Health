import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Plus, TrendingDown, ArrowLeft, Calendar as CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { formatWeight, parseWeight } from "@/lib/unitConversion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfMonth, startOfQuarter, startOfYear, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { WeightChart } from "@/components/WeightChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { weightLogSchema, validateAndSanitize } from "@/lib/validationSchemas";
import { useTranslation } from "react-i18next";

interface WeightLog {
  id: string;
  weight_lbs: number;
  period: string;
  logged_at: string;
}

const Weight = () => {
  const { t, i18n } = useTranslation(['weight', 'common']);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { preferredUnit, updatePreferredUnit, isLoading: prefsLoading } = useUserPreferences();
  const [morning, setMorning] = useState("");
  const [evening, setEvening] = useState("");
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [chartView, setChartView] = useState<"daily" | "monthly" | "quarterly" | "yearly" | "year-by-year">("monthly");
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [chartLabels, setChartLabels] = useState({
    weightUnit: '',
    targetLabel: '',
    morning: '',
    evening: '',
    average: ''
  });
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  // Update labels when translations or preferences change
  useEffect(() => {
    try {
      const labels = {
        weightUnit: preferredUnit === 'imperial' ? t('weight:weight_unit_lbs') : t('weight:weight_unit_kg'),
        targetLabel: t('weight:target_weight'),
        morning: t('weight:morning'),
        evening: t('weight:evening'),
        average: t('weight:average_weight')
      };
      
      // Validate all labels are loaded
      if (labels.weightUnit && labels.morning && labels.evening && labels.average && labels.targetLabel) {
        setChartLabels(labels);
        // Mark as ready after a small delay to ensure everything is settled
        setTimeout(() => setIsReady(true), 150);
      }
    } catch (error) {
      console.error('Error setting chart labels:', error);
      setHasError(true);
    }
  }, [preferredUnit, t, i18n.language]);

  useEffect(() => {
    try {
      fetchWeightLogs();
      fetchTargetWeight();
    } catch (error) {
      console.error('Error initializing Weight page:', error);
      setHasError(true);
    }
  }, []);

  // Safety check: don't render chart until translations are loaded
  const translationsReady = isReady && chartLabels.weightUnit !== '' && chartLabels.morning !== '';
  
  // Show error state if something went wrong
  if (hasError) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Unable to load weight tracking. Please try refreshing the page.</p>
          <Button onClick={() => navigate('/')} className="mt-4 mx-auto block">Go Home</Button>
        </Card>
      </div>
    );
  }

  const fetchWeightLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: true });

      if (error) throw error;
      setWeightLogs(data || []);
    } catch (error) {
      console.error('Error fetching weight logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTargetWeight = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('target_weight, target_weight_unit, weight, weight_unit')
        .eq('id', user.id)
        .single();

      if (profile?.target_weight) {
        // Convert to lbs if stored in kg
        const targetInLbs = profile.target_weight_unit === 'kg' 
          ? profile.target_weight * 2.20462 
          : profile.target_weight;
        setTargetWeight(targetInLbs);
      }
    } catch (error) {
      console.error('Error fetching target weight:', error);
    }
  };

  const checkWeightMilestones = async (currentWeightLbs: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !targetWeight) return;

      // Get the profile to find starting weight
      const { data: profile } = await supabase
        .from('profiles')
        .select('weight, weight_unit')
        .eq('id', user.id)
        .single();

      if (!profile?.weight) return;

      const startingWeightLbs = profile.weight_unit === 'kg' 
        ? profile.weight * 2.20462 
        : profile.weight;

      // Calculate progress
      const totalGoal = Math.abs(targetWeight - startingWeightLbs);
      const achieved = Math.abs(currentWeightLbs - startingWeightLbs);
      const progressPercentage = (achieved / totalGoal) * 100;

      // Define milestones
      const milestones = [
        { threshold: 25, type: 'weight_25' },
        { threshold: 50, type: 'weight_50' },
        { threshold: 75, type: 'weight_75' },
        { threshold: 100, type: 'weight_100' },
      ];

      // Get existing achievements
      const { data: existingAchievements } = await supabase
        .from('achievements')
        .select('achievement_type')
        .eq('user_id', user.id)
        .in('achievement_type', milestones.map(m => m.type));

      const achievedTypes = new Set(existingAchievements?.map(a => a.achievement_type) || []);

      // Check each milestone
      for (const milestone of milestones) {
        if (progressPercentage >= milestone.threshold && !achievedTypes.has(milestone.type)) {
          // Create new achievement
          await supabase
            .from('achievements')
            .insert({
              user_id: user.id,
              achievement_type: milestone.type,
              actual_value: Math.round(currentWeightLbs),
              goal_value: Math.round(targetWeight),
              achieved_at: new Date().toISOString(),
            });

          toast({
            title: t('weight:milestone_achieved'),
            description: t('weight:milestone_desc', { percent: milestone.threshold }),
          });
        }
      }
    } catch (error) {
      console.error('Error checking weight milestones:', error);
    }
  };

  const handleLogWeight = async (period: "morning" | "evening") => {
    const weight = period === "morning" ? morning : evening;
    if (!weight) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('weight:auth_required'),
          description: t('weight:auth_required_desc'),
          variant: "destructive",
        });
        return;
      }

      const weightLbs = parseWeight(weight, preferredUnit);

      // Validate weight data
      const validation = validateAndSanitize(weightLogSchema, {
        weight_lbs: weightLbs,
        period: period,
      });

      if (validation.success === false) {
        toast({
          title: t('weight:validation_error'),
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: user.id,
          weight_lbs: validation.data.weight_lbs,
          period: validation.data.period,
          logged_at: selectedDate.toISOString(),
        });

      if (error) throw error;

      const periodTranslated = period === 'morning' ? t('weight:morning').toLowerCase() : t('weight:evening').toLowerCase();
      toast({
        title: t('weight:weight_logged'),
        description: t('weight:weight_logged_desc', { period: periodTranslated }),
      });

      // Check for weight milestones
      await checkWeightMilestones(weightLbs);

      if (period === "morning") setMorning("");
      else setEvening("");
      
      fetchWeightLogs();
    } catch (error) {
      console.error('Error logging weight:', error);
      toast({
        title: t('weight:error'),
        description: t('weight:error_log'),
        variant: "destructive",
      });
    }
  };

  const handleEditLog = async (log: WeightLog) => {
    if (!editWeight) return;
    
    try {
      const weightLbs = parseWeight(editWeight, preferredUnit);
      
      const { error } = await supabase
        .from('weight_logs')
        .update({ weight_lbs: weightLbs })
        .eq('id', log.id);

      if (error) throw error;

      toast({
        title: t('weight:weight_updated'),
        description: t('weight:weight_updated_desc'),
      });
      
      setEditingLog(null);
      setEditWeight("");
      fetchWeightLogs();
    } catch (error) {
      console.error('Error updating weight:', error);
      toast({
        title: t('weight:error'),
        description: t('weight:error_update'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: t('weight:weight_deleted'),
        description: t('weight:weight_deleted_desc'),
      });
      
      fetchWeightLogs();
    } catch (error) {
      console.error('Error deleting weight:', error);
      toast({
        title: t('weight:error'),
        description: t('weight:error_delete'),
        variant: "destructive",
      });
    }
  };

  const groupedLogs = weightLogs.reduce((acc, log) => {
    const date = new Date(log.logged_at).toLocaleDateString();
    if (!acc[date]) acc[date] = {};
    acc[date][log.period] = log.weight_lbs;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_lbs : 0;

  const statistics = useMemo(() => {
    if (weightLogs.length === 0) return null;

    const firstWeight = weightLogs[0].weight_lbs;
    const lastWeight = weightLogs[weightLogs.length - 1].weight_lbs;
    const totalChange = lastWeight - firstWeight;
    
    // Calculate days between first and last log
    const firstDate = new Date(weightLogs[0].logged_at);
    const lastDate = new Date(weightLogs[weightLogs.length - 1].logged_at);
    const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgRatePerWeek = (totalChange / daysDiff) * 7;

    let progressPercentage = 0;
    if (targetWeight && firstWeight !== targetWeight) {
      const totalGoal = targetWeight - firstWeight;
      const achieved = lastWeight - firstWeight;
      progressPercentage = (achieved / totalGoal) * 100;
    }

    return {
      totalChange,
      avgRatePerWeek,
      progressPercentage,
      daysTracked: daysDiff,
    };
  }, [weightLogs, targetWeight]);

  const chartData = useMemo(() => {
    if (!weightLogs.length) return [];

    const processData = (logs: WeightLog[]) => {
      let result: any[] = [];
      
      switch (chartView) {
        case "daily": {
          const dailyData = logs.reduce((acc, log) => {
            const date = format(parseISO(log.logged_at), "MMM dd");
            const existing = acc.find(d => d.date === date);
            if (existing) {
              if (log.period === "morning") existing.morning = log.weight_lbs;
              if (log.period === "evening") existing.evening = log.weight_lbs;
            } else {
              acc.push({
                date,
                morning: log.period === "morning" ? log.weight_lbs : null,
                evening: log.period === "evening" ? log.weight_lbs : null,
              });
            }
            return acc;
          }, [] as any[]);
          result = dailyData;
          break;
        }
        
        case "monthly": {
          const monthlyData = logs.reduce((acc, log) => {
            const month = format(startOfMonth(parseISO(log.logged_at)), "MMM yyyy");
            const existing = acc.find(d => d.date === month);
            if (existing) {
              existing.totalWeight += log.weight_lbs;
              existing.count += 1;
            } else {
              acc.push({ date: month, totalWeight: log.weight_lbs, count: 1 });
            }
            return acc;
          }, [] as any[]);
          result = monthlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
          break;
        }
        
        case "quarterly": {
          const quarterlyData = logs.reduce((acc, log) => {
            const quarter = format(startOfQuarter(parseISO(log.logged_at)), "QQQ yyyy");
            const existing = acc.find(d => d.date === quarter);
            if (existing) {
              existing.totalWeight += log.weight_lbs;
              existing.count += 1;
            } else {
              acc.push({ date: quarter, totalWeight: log.weight_lbs, count: 1 });
            }
            return acc;
          }, [] as any[]);
          result = quarterlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
          break;
        }
        
        case "yearly": {
          const yearlyData = logs.reduce((acc, log) => {
            const year = format(startOfYear(parseISO(log.logged_at)), "yyyy");
            const existing = acc.find(d => d.date === year);
            if (existing) {
              existing.totalWeight += log.weight_lbs;
              existing.count += 1;
            } else {
              acc.push({ date: year, totalWeight: log.weight_lbs, count: 1 });
            }
            return acc;
          }, [] as any[]);
          result = yearlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
          break;
        }
        
        case "year-by-year": {
          const yearlyData = logs.reduce((acc, log) => {
            const year = format(parseISO(log.logged_at), "yyyy");
            const month = format(parseISO(log.logged_at), "MMM");
            if (!acc[year]) acc[year] = {};
            if (!acc[year][month]) acc[year][month] = { totalWeight: 0, count: 0 };
            acc[year][month].totalWeight += log.weight_lbs;
            acc[year][month].count += 1;
            return acc;
          }, {} as Record<string, Record<string, { totalWeight: number; count: number }>>);
          
          const tempResult = [];
          for (const [year, months] of Object.entries(yearlyData)) {
            for (const [month, data] of Object.entries(months)) {
              tempResult.push({
                date: month,
                [year]: data.totalWeight / data.count,
              });
            }
          }
          
          const consolidated = tempResult.reduce((acc, item) => {
            const existing = acc.find(d => d.date === item.date);
            if (existing) {
              Object.assign(existing, item);
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as any[]);
          
          result = consolidated;
          break;
        }
        
        default:
          return [];
      }
      
      // Add target weight to all data points if it exists
      if (targetWeight) {
        result = result.map(d => ({ ...d, target: targetWeight }));
      }
      
      return result;
    };

    return processData(weightLogs);
  }, [weightLogs, chartView, targetWeight]);

  const chartLines = useMemo(() => {
    if (chartView === "year-by-year" && chartData.length > 0) {
      const years = Object.keys(chartData[0]).filter(key => key !== "date");
      return years;
    }
    return [];
  }, [chartData, chartView]);
  
  // Delay chart rendering specifically for Safari compatibility
  useEffect(() => {
    if (isReady && !isLoading && chartData.length > 0) {
      const timer = setTimeout(() => {
        setChartReady(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isReady, isLoading, chartData]);

  const getYAxisDomain = () => {
    if (!chartData.length) return [0, 100];
    const values = chartData.flatMap(d => 
      Object.entries(d)
        .filter(([key]) => key !== "date")
        .map(([, value]) => value as number)
        .filter(v => v != null)
    );
    
    // Include target weight in domain calculation if it exists
    if (targetWeight) {
      values.push(targetWeight);
    }
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('weight:back_to_dashboard')}
      </Button>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('weight:weight_tracking')}</h1>
            <p className="text-muted-foreground mt-1">{t('weight:monitor_changes')}</p>
          </div>
        </div>
        
        <div className="w-32">
          <Select
            value={preferredUnit}
            onValueChange={(value) => updatePreferredUnit(value as 'imperial' | 'metric')}
            disabled={prefsLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imperial">lbs</SelectItem>
              <SelectItem value="metric">kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">{t('weight:current_weight')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">
            {latestWeight > 0 ? formatWeight(latestWeight, preferredUnit) : t('weight:no_data')}
          </p>
          <p className="opacity-90">{t('weight:latest_recorded')}</p>
        </Card>

        <Card className="p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2">{t('weight:total_logs')}</h3>
          <p className="text-4xl font-bold text-primary mb-2">{weightLogs.length}</p>
          <p className="text-muted-foreground">{t('weight:entries_tracked')}</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{t('weight:log_weight')}</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, "PPP", { locale: i18n.language === 'es' ? es : undefined })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={i18n.language === 'es' ? es : undefined}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="morning">{t('weight:morning_weight')} ({preferredUnit === 'imperial' ? 'lbs' : 'kg'})</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="morning"
                  type="number"
                  step="0.1"
                  placeholder={t('weight:enter_weight')}
                  value={morning}
                  onChange={(e) => setMorning(e.target.value)}
                />
                <Button 
                  onClick={() => handleLogWeight("morning")}
                  disabled={!morning}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('weight:log')}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="evening">{t('weight:evening_weight')} ({preferredUnit === 'imperial' ? 'lbs' : 'kg'})</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="evening"
                  type="number"
                  step="0.1"
                  placeholder={t('weight:enter_weight')}
                  value={evening}
                  onChange={(e) => setEvening(e.target.value)}
                />
                <Button 
                  onClick={() => handleLogWeight("evening")}
                  disabled={!evening}
                  variant="secondary"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('weight:log')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Card */}
      {statistics && (
        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('weight:progress_statistics')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('weight:total_change')}</p>
              <p className="text-2xl font-bold" style={{ 
                color: statistics.totalChange < 0 ? 'hsl(142, 71%, 45%)' : 'hsl(var(--primary))' 
              }}>
                {statistics.totalChange > 0 ? '+' : ''}
                {formatWeight(Math.abs(statistics.totalChange), preferredUnit)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('weight:over_days', { days: statistics.daysTracked })}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('weight:avg_change_week')}</p>
              <p className="text-2xl font-bold">
                {statistics.avgRatePerWeek > 0 ? '+' : ''}
                {formatWeight(Math.abs(statistics.avgRatePerWeek), preferredUnit)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('weight:weekly_average')}
              </p>
            </div>
            
            {targetWeight && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('weight:goal_progress')}</p>
                <p className="text-2xl font-bold text-primary">
                  {Math.abs(Math.round(statistics.progressPercentage))}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('weight:target', { weight: formatWeight(targetWeight, preferredUnit) })}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">{t('weight:weight_trends')}</h3>
        <Tabs value={chartView} onValueChange={(v) => setChartView(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="daily">{t('weight:daily')}</TabsTrigger>
            <TabsTrigger value="monthly">{t('weight:monthly')}</TabsTrigger>
            <TabsTrigger value="quarterly">{t('weight:quarterly')}</TabsTrigger>
            <TabsTrigger value="yearly">{t('weight:yearly')}</TabsTrigger>
            <TabsTrigger value="year-by-year">{t('weight:year_by_year')}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-center py-8">
          <p className="text-muted-foreground">Chart temporarily disabled for testing</p>
          <p className="text-sm text-muted-foreground mt-2">Chart data points: {chartData.length}</p>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">{t('weight:recent_weights')}</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">{t('weight:loading')}</p>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t('weight:no_logs_yet')}</p>
        ) : (
          <div className="h-[600px] overflow-y-auto pr-2 space-y-3" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {[...weightLogs].reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{new Date(log.logged_at).toLocaleDateString()}</span>
                  <span className="text-sm ml-3 font-semibold" style={{ color: 'black' }}>
                    {log.period === 'morning' ? t('weight:morning') : t('weight:evening')}
                  </span>
                </div>
                
                {editingLog?.id === log.id ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.1"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-24"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditLog(log);
                        }
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleEditLog(log)}>
                      {t('weight:save')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditingLog(null);
                      setEditWeight("");
                    }}>
                      {t('weight:cancel')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center">
                    <span className="font-semibold text-foreground">
                      {formatWeight(log.weight_lbs, preferredUnit)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingLog(log);
                          setEditWeight(formatWeight(log.weight_lbs, preferredUnit).split(' ')[0]);
                        }}
                        className="h-8 w-8 p-0 hover:bg-accent"
                        style={{ color: 'black' }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLog(log.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10"
                        style={{ color: 'black' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Weight;

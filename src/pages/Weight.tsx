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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WeightLog {
  id: string;
  weight_lbs: number;
  period: string;
  logged_at: string;
}

const Weight = () => {
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

  useEffect(() => {
    fetchWeightLogs();
  }, []);

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

  const handleLogWeight = async (period: "morning" | "evening") => {
    const weight = period === "morning" ? morning : evening;
    if (!weight) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to track your weight.",
          variant: "destructive",
        });
        return;
      }

      const weightLbs = parseWeight(weight, preferredUnit);

      const { error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: user.id,
          weight_lbs: weightLbs,
          period: period,
          logged_at: selectedDate.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Weight logged",
        description: `${period.charAt(0).toUpperCase() + period.slice(1)} weight has been recorded.`,
      });

      if (period === "morning") setMorning("");
      else setEvening("");
      
      fetchWeightLogs();
    } catch (error) {
      console.error('Error logging weight:', error);
      toast({
        title: "Error",
        description: "Failed to log weight. Please try again.",
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
        title: "Weight updated",
        description: "Weight log has been updated successfully.",
      });
      
      setEditingLog(null);
      setEditWeight("");
      fetchWeightLogs();
    } catch (error) {
      console.error('Error updating weight:', error);
      toast({
        title: "Error",
        description: "Failed to update weight. Please try again.",
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
        title: "Weight deleted",
        description: "Weight log has been removed.",
      });
      
      fetchWeightLogs();
    } catch (error) {
      console.error('Error deleting weight:', error);
      toast({
        title: "Error",
        description: "Failed to delete weight. Please try again.",
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

  const chartData = useMemo(() => {
    if (!weightLogs.length) return [];

    const processData = (logs: WeightLog[]) => {
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
          return dailyData;
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
          return monthlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
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
          return quarterlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
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
          return yearlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
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
          
          const result = [];
          for (const [year, months] of Object.entries(yearlyData)) {
            for (const [month, data] of Object.entries(months)) {
              result.push({
                date: month,
                [year]: data.totalWeight / data.count,
              });
            }
          }
          
          const consolidated = result.reduce((acc, item) => {
            const existing = acc.find(d => d.date === item.date);
            if (existing) {
              Object.assign(existing, item);
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as any[]);
          
          return consolidated;
        }
        
        default:
          return [];
      }
    };

    return processData(weightLogs);
  }, [weightLogs, chartView]);

  const chartLines = useMemo(() => {
    if (chartView === "year-by-year" && chartData.length > 0) {
      const years = Object.keys(chartData[0]).filter(key => key !== "date");
      return years;
    }
    return [];
  }, [chartData, chartView]);

  const getYAxisDomain = () => {
    if (!chartData.length) return [0, 100];
    const values = chartData.flatMap(d => 
      Object.entries(d)
        .filter(([key]) => key !== "date")
        .map(([, value]) => value as number)
        .filter(v => v != null)
    );
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
        Back to Dashboard
      </Button>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Weight Tracking</h1>
            <p className="text-muted-foreground">Monitor your daily weight changes</p>
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
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Current Weight</h3>
          </div>
          <p className="text-4xl font-bold mb-2">
            {latestWeight > 0 ? formatWeight(latestWeight, preferredUnit) : 'No data'}
          </p>
          <p className="opacity-90">Latest recorded weight</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Logs</h3>
          <p className="text-4xl font-bold text-primary mb-2">{weightLogs.length}</p>
          <p className="text-muted-foreground">Weight entries tracked</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Log Weight</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="morning">Morning Weight ({preferredUnit === 'imperial' ? 'lbs' : 'kg'})</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="morning"
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={morning}
                  onChange={(e) => setMorning(e.target.value)}
                />
                <Button 
                  onClick={() => handleLogWeight("morning")}
                  disabled={!morning}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Log
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="evening">Evening Weight ({preferredUnit === 'imperial' ? 'lbs' : 'kg'})</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="evening"
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
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
                  Log
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">Weight Trends</h3>
        <Tabs value={chartView} onValueChange={(v) => setChartView(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="year-by-year">Year by Year</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No data available for chart</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                domain={getYAxisDomain()}
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
                label={{ 
                  value: preferredUnit === 'imperial' ? 'Weight (lbs)' : 'Weight (kg)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--foreground))' }
                }}
                tickFormatter={(value) => formatWeight(value, preferredUnit).split(' ')[0]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => formatWeight(value, preferredUnit)}
              />
              <Legend />
              
              {chartView === "daily" ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="morning" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Morning"
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="evening" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--secondary))' }}
                    name="Evening"
                    connectNulls
                  />
                </>
              ) : chartView === "year-by-year" ? (
                chartLines.map((year, index) => {
                  const colors = [
                    'hsl(var(--primary))',
                    'hsl(var(--secondary))',
                    'hsl(var(--accent))',
                    'hsl(217, 91%, 60%)',
                    'hsl(142, 71%, 45%)',
                    'hsl(262, 83%, 58%)',
                  ];
                  return (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={year}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length] }}
                      name={year}
                      connectNulls
                    />
                  );
                })
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="Average Weight"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Weights</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No weight logs yet. Start tracking above!</p>
        ) : (
          <div className="space-y-3">
            {[...weightLogs].reverse().slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{new Date(log.logged_at).toLocaleDateString()}</span>
                  <span className="text-sm text-muted-foreground ml-3">
                    {log.period.charAt(0).toUpperCase() + log.period.slice(1)}
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
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditingLog(null);
                      setEditWeight("");
                    }}>
                      Cancel
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
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLog(log.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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

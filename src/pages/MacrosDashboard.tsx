import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MacrosDashboard = () => {
  const navigate = useNavigate();
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'today' | 'week'>('today');

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const fetchNutritionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = subDays(new Date(), 7);

      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('calories, protein_grams, carbs_grams, fat_grams, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: true });

      if (error) throw error;
      setNutritionData(data || []);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayData = useMemo(() => {
    const today = startOfDay(new Date());
    return nutritionData.filter(n => 
      new Date(n.logged_at) >= today
    );
  }, [nutritionData]);

  const weeklyData = useMemo(() => {
    const dailyTotals = new Map();
    
    nutritionData.forEach(n => {
      const date = format(new Date(n.logged_at), 'MMM dd');
      const existing = dailyTotals.get(date) || { protein: 0, carbs: 0, fat: 0, calories: 0 };
      
      dailyTotals.set(date, {
        protein: existing.protein + (n.protein_grams || 0),
        carbs: existing.carbs + (n.carbs_grams || 0),
        fat: existing.fat + (n.fat_grams || 0),
        calories: existing.calories + (n.calories || 0)
      });
    });

    return Array.from(dailyTotals.entries()).map(([date, totals]) => ({
      date,
      ...totals
    }));
  }, [nutritionData]);

  const currentMacros = useMemo(() => {
    const data = timeFrame === 'today' ? todayData : nutritionData;
    const totals = data.reduce((acc, n) => ({
      protein: acc.protein + (n.protein_grams || 0),
      carbs: acc.carbs + (n.carbs_grams || 0),
      fat: acc.fat + (n.fat_grams || 0),
      calories: acc.calories + (n.calories || 0)
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

    return totals;
  }, [todayData, nutritionData, timeFrame]);

  const pieData = [
    { name: 'Protein', value: currentMacros.protein * 4, grams: currentMacros.protein },
    { name: 'Carbs', value: currentMacros.carbs * 4, grams: currentMacros.carbs },
    { name: 'Fat', value: currentMacros.fat * 9, grams: currentMacros.fat }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-6xl">
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
        <div>
          <h1 className="text-3xl font-bold">Macros Dashboard</h1>
          <p className="text-muted-foreground">Track your protein, carbs, and fats</p>
        </div>
        
        <Tabs value={timeFrame} onValueChange={(v) => setTimeFrame(v as 'today' | 'week')}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">7 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Calories</p>
          <p className="text-3xl font-bold text-primary">{Math.round(currentMacros.calories)}</p>
          <p className="text-xs text-muted-foreground mt-1">kcal</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Protein</p>
          <p className="text-3xl font-bold" style={{ color: COLORS[0] }}>
            {Math.round(currentMacros.protein)}g
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((currentMacros.protein * 4 / currentMacros.calories) * 100 || 0)}% of calories
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Carbs</p>
          <p className="text-3xl font-bold" style={{ color: COLORS[1] }}>
            {Math.round(currentMacros.carbs)}g
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((currentMacros.carbs * 4 / currentMacros.calories) * 100 || 0)}% of calories
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Fat</p>
          <p className="text-3xl font-bold" style={{ color: COLORS[2] }}>
            {Math.round(currentMacros.fat)}g
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((currentMacros.fat * 9 / currentMacros.calories) * 100 || 0)}% of calories
          </p>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Macro Distribution</h3>
        {currentMacros.calories > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${Math.round(entry.grams)}g`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${Math.round(value)} cal (${Math.round(props.payload.grams)}g)`,
                  name
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground py-12">No nutrition data yet</p>
        )}
      </Card>

      {/* Trend Chart */}
      {weeklyData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" label={{ value: 'Grams', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="protein" stroke={COLORS[0]} name="Protein" />
              <Line type="monotone" dataKey="carbs" stroke={COLORS[1]} name="Carbs" />
              <Line type="monotone" dataKey="fat" stroke={COLORS[2]} name="Fat" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default MacrosDashboard;

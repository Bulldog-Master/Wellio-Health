import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedMetrics } from "@/components/AdvancedMetrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, Target, Zap } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from "recharts";

const AdvancedAnalytics = () => {
  const { data: weightData } = useQuery({
    queryKey: ["weight-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: true })
        .limit(90);

      return data?.map(log => ({
        date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: log.weight_lbs
      })) || [];
    },
  });

  const { data: activityData } = useQuery({
    queryKey: ["activity-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: true })
        .limit(90);

      return data?.map(log => ({
        date: new Date(log.logged_at || log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: log.duration_minutes,
        calories: log.calories_burned || 0
      })) || [];
    },
  });

  const { data: nutritionData } = useQuery({
    queryKey: ["nutrition-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: true })
        .limit(90);

      // Group by day
      const dailyData = data?.reduce((acc: any, log) => {
        const date = new Date(log.logged_at || log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) {
          acc[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        acc[date].calories += log.calories || 0;
        acc[date].protein += log.protein_grams || 0;
        acc[date].carbs += log.carbs_grams || 0;
        acc[date].fat += log.fat_grams || 0;
        return acc;
      }, {});

      return Object.values(dailyData || {});
    },
  });

  // Correlation analysis between weight and activity
  const { data: correlationData } = useQuery({
    queryKey: ["correlation-data"],
    queryFn: async () => {
      if (!weightData || !activityData) return [];

      // Match dates and create correlation points
      const correlations = weightData
        .filter(w => activityData.some(a => a.date === w.date))
        .map(w => {
          const activity = activityData.find(a => a.date === w.date);
          return {
            weight: w.value,
            activity: activity?.value || 0,
            date: w.date
          };
        });

      return correlations;
    },
    enabled: !!weightData && !!activityData
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into your fitness journey with predictions and correlations
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="weight">
            <TrendingUp className="w-4 h-4 mr-2" />
            Weight
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Zap className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="nutrition">
            <Target className="w-4 h-4 mr-2" />
            Nutrition
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weightData && weightData.length > 0 && (
              <AdvancedMetrics
                data={weightData}
                title="Weight Trend"
                metric="lbs"
                unit="lbs"
              />
            )}
            {activityData && activityData.length > 0 && (
              <AdvancedMetrics
                data={activityData}
                title="Activity Duration"
                metric="minutes"
                unit="min"
              />
            )}
          </div>

          {/* Correlation Chart */}
          {correlationData && correlationData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weight vs Activity Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="activity" 
                      name="Activity (min)" 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Activity Duration (min)', position: 'bottom' }}
                    />
                    <YAxis 
                      dataKey="weight" 
                      name="Weight (lbs)" 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Weight (lbs)', angle: -90, position: 'left' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Scatter 
                      data={correlationData} 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weight">
          {weightData && weightData.length > 0 && (
            <AdvancedMetrics
              data={weightData}
              title="Weight Analysis"
              metric="lbs"
              unit="lbs"
            />
          )}
        </TabsContent>

        <TabsContent value="activity">
          {activityData && activityData.length > 0 && (
            <div className="space-y-6">
              <AdvancedMetrics
                data={activityData}
                title="Activity Duration Analysis"
                metric="minutes"
                unit="min"
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Calories Burned Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="nutrition">
          {nutritionData && nutritionData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Macro Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={nutritionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="protein" stroke="hsl(var(--accent))" strokeWidth={2} />
                    <Line type="monotone" dataKey="carbs" stroke="hsl(var(--secondary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="fat" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;

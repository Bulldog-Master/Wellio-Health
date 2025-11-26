import { Card } from "@/components/ui/card";
import { Apple, Beef, Droplets } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionGoalsType {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const NutritionGoals = () => {
  const [data, setData] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [goals] = useState<NutritionGoalsType>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const fetchNutritionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: meals } = await supabase
        .from('nutrition_logs')
        .select('calories, protein_grams, carbs_grams, fat_grams')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      if (meals) {
        const totals = meals.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein_grams || 0),
            carbs: acc.carbs + (meal.carbs_grams || 0),
            fat: acc.fat + (meal.fat_grams || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
        setData(totals);
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  const macros = [
    {
      label: "Protein",
      current: Math.round(data.protein),
      goal: goals.protein,
      color: "text-destructive",
      bgColor: "bg-destructive",
      icon: <Beef className="w-4 h-4" />,
    },
    {
      label: "Carbs",
      current: Math.round(data.carbs),
      goal: goals.carbs,
      color: "text-primary",
      bgColor: "bg-primary",
      icon: <Apple className="w-4 h-4" />,
    },
    {
      label: "Fat",
      current: Math.round(data.fat),
      goal: goals.fat,
      color: "text-warning",
      bgColor: "bg-warning",
      icon: <Droplets className="w-4 h-4" />,
    },
  ];

  const calorieProgress = Math.min((data.calories / goals.calories) * 100, 100);

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <h3 className="text-lg font-semibold mb-4">Today's Nutrition</h3>
      
      <div className="space-y-6">
        {/* Calories */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Calories</span>
            <span className="text-sm font-bold">
              {Math.round(data.calories)} / {goals.calories}
            </span>
          </div>
          <Progress value={calorieProgress} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {goals.calories - Math.round(data.calories)} remaining
          </p>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3">
          {macros.map((macro) => {
            const percentage = Math.min((macro.current / macro.goal) * 100, 100);
            return (
              <div key={macro.label} className="text-center space-y-2">
                <div className={`flex justify-center ${macro.color}`}>
                  {macro.icon}
                </div>
                <div>
                  <p className={`text-xl font-bold ${macro.color}`}>
                    {macro.current}g
                  </p>
                  <p className="text-xs text-muted-foreground">
                    / {macro.goal}g
                  </p>
                  <p className="text-xs font-medium mt-1">{macro.label}</p>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className={`${macro.bgColor} h-1.5 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

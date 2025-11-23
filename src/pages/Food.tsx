import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, Plus, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface MealLog {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  logged_at: string;
}

const Food = () => {
  const { toast } = useToast();
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
  ];

  useEffect(() => {
    fetchMealLogs();
  }, []);

  const fetchMealLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', today.toISOString())
        .order('logged_at', { ascending: true });

      if (error) throw error;
      setMealLogs(data || []);
    } catch (error) {
      console.error('Error fetching meal logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCalories = mealLogs.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  const handleAddMeal = async () => {
    if (!food || !calories) {
      toast({
        title: "Missing information",
        description: "Please enter food name and calories.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to track your meals.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: user.id,
          meal_type: selectedMeal,
          food_name: food,
          calories: parseInt(calories),
          protein_grams: protein ? parseFloat(protein) : null,
          carbs_grams: carbs ? parseFloat(carbs) : null,
          fat_grams: fat ? parseFloat(fat) : null,
        });

      if (error) throw error;

      toast({
        title: "Meal logged",
        description: `${food} (${calories} cal) added to ${mealTypes.find(m => m.value === selectedMeal)?.label}`,
      });

      setFood("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      
      fetchMealLogs();
    } catch (error) {
      console.error('Error logging meal:', error);
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Utensils className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Food Log</h1>
          <p className="text-muted-foreground">Track your daily nutrition</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-accent text-accent-foreground shadow-glow">
        <h3 className="text-lg font-semibold mb-2">Today's Calories</h3>
        <p className="text-4xl font-bold mb-2">{totalCalories}</p>
        <p className="opacity-90">{Math.max(0, 2000 - totalCalories)} cal remaining (goal: 2000)</p>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">Log New Meal</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={selectedMeal} onValueChange={setSelectedMeal}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((meal) => (
                  <SelectItem key={meal.value} value={meal.value}>
                    {meal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="food">What did you eat?</Label>
            <Input
              id="food"
              placeholder="e.g., Grilled chicken with rice and vegetables"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="calories">Calories *</Label>
              <Input
                id="calories"
                type="number"
                placeholder="350"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                placeholder="30"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                placeholder="45"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                placeholder="15"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <Button onClick={handleAddMeal} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Meal
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : mealLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No meals logged yet today. Start tracking above!</p>
        ) : (
          <div className="space-y-4">
            {mealTypes.map((mealType) => {
              const meals = mealLogs.filter(log => log.meal_type === mealType.value);
              if (meals.length === 0) return null;

              return (
                <div key={mealType.value} className="space-y-2">
                  <h4 className="font-medium text-primary">{mealType.label}</h4>
                  {meals.map((meal) => (
                    <div key={meal.id} className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{meal.food_name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {(meal.protein_grams || meal.carbs_grams || meal.fat_grams) && (
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              {meal.protein_grams && <span>P: {meal.protein_grams}g</span>}
                              {meal.carbs_grams && <span>C: {meal.carbs_grams}g</span>}
                              {meal.fat_grams && <span>F: {meal.fat_grams}g</span>}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-primary">{meal.calories} cal</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Food;

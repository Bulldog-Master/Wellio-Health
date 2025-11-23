import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, Plus, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MealEntry {
  time: string;
  food: string;
  calories: number;
}

const Food = () => {
  const { toast } = useToast();
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [time, setTime] = useState("");
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");

  const mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "morningSnack", label: "Morning Snack" },
    { value: "lunch", label: "Lunch" },
    { value: "afternoonSnack", label: "Afternoon Snack" },
    { value: "dinner", label: "Dinner" },
    { value: "eveningSnack", label: "Evening Snack" },
  ];

  const todaysMeals: Record<string, MealEntry[]> = {
    breakfast: [{ time: "08:00", food: "Oatmeal with berries, 2 eggs", calories: 450 }],
    lunch: [{ time: "12:30", food: "Grilled chicken salad", calories: 550 }],
    afternoonSnack: [{ time: "15:00", food: "Apple and almonds", calories: 200 }],
    dinner: [{ time: "18:30", food: "Salmon with vegetables", calories: 650 }],
  };

  const totalCalories = Object.values(todaysMeals)
    .flat()
    .reduce((sum, meal) => sum + meal.calories, 0);

  const handleAddMeal = () => {
    if (!time || !food || !calories) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Meal logged",
      description: `${food} (${calories} cal) added to ${mealTypes.find(m => m.value === selectedMeal)?.label}`,
    });

    setTime("");
    setFood("");
    setCalories("");
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
        <p className="opacity-90">{2000 - totalCalories} cal remaining</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="calories">Estimated Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="e.g., 350"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="mt-1.5"
              />
            </div>
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

          <Button onClick={handleAddMeal} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Meal
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
        <div className="space-y-4">
          {mealTypes.map((mealType) => {
            const meals = todaysMeals[mealType.value] || [];
            if (meals.length === 0) return null;

            return (
              <div key={mealType.value} className="space-y-2">
                <h4 className="font-medium text-primary">{mealType.label}</h4>
                {meals.map((meal, idx) => (
                  <div key={idx} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{meal.food}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{meal.time}</span>
                        </div>
                      </div>
                      <span className="font-bold text-primary">{meal.calories} cal</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Food;

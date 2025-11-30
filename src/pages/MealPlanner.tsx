import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";

interface MealPlan {
  id: string;
  day_of_week: number;
  meal_type: string;
  food_name: string;
  notes: string | null;
}

const MealPlanner = () => {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState<{ day: number; type: string } | null>(null);
  const [mealInput, setMealInput] = useState("");

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  useEffect(() => {
    fetchMealPlans();
  }, [currentWeekStart]);

  const fetchMealPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStartDate = format(currentWeekStart, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartDate);

      if (error) throw error;
      setMealPlans(data || []);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!editingMeal || !mealInput) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStartDate = format(currentWeekStart, 'yyyy-MM-dd');
      
      // Check if meal already exists
      const existing = mealPlans.find(
        m => m.day_of_week === editingMeal.day && m.meal_type === editingMeal.type
      );

      if (existing) {
        const { error } = await supabase
          .from('meal_plans')
          .update({ food_name: mealInput })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('meal_plans')
          .insert({
            user_id: user.id,
            week_start_date: weekStartDate,
            day_of_week: editingMeal.day,
            meal_type: editingMeal.type,
            food_name: mealInput
          });
        if (error) throw error;
      }

      toast.success('Meal saved!');
      setEditingMeal(null);
      setMealInput("");
      fetchMealPlans();
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal');
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Meal deleted');
      fetchMealPlans();
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
    }
  };

  const getMeal = (day: number, type: string) => {
    return mealPlans.find(m => m.day_of_week === day && m.meal_type === type);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3 p-4 border border-border rounded-lg">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/food")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Food
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Meal Planner</h1>
            <p className="text-muted-foreground">Plan your meals for the week</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-4">
            Week of {format(currentWeekStart, 'MMM dd, yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {days.map((day, dayIndex) => (
          <Card key={day} className="p-4">
            <h3 className="font-semibold mb-3">{day}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {mealTypes.map(type => {
                const meal = getMeal(dayIndex, type);
                const isEditing = editingMeal?.day === dayIndex && editingMeal?.type === type;

                return (
                  <div key={type} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      {meal && !isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter meal..."
                          value={mealInput}
                          onChange={(e) => setMealInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveMeal()}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleSaveMeal} className="flex-1">
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMeal(null);
                              setMealInput("");
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : meal ? (
                      <p
                        className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => {
                          setEditingMeal({ day: dayIndex, type });
                          setMealInput(meal.food_name);
                        }}
                      >
                        {meal.food_name}
                      </p>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => setEditingMeal({ day: dayIndex, type })}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add meal
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;

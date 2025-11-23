import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Utensils, Plus, Clock, Camera, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [mealDescription, setMealDescription] = useState("");
  const [nutritionData, setNutritionData] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeMeal = async () => {
    if (!mealDescription.trim() && !imagePreview) {
      toast({
        title: "Input required",
        description: "Please describe your meal or upload a photo.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: {
          mealDescription: mealDescription.trim() || null,
          imageBase64: imagePreview || null
        }
      });

      if (error) {
        console.error('Error analyzing meal:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from analysis');
      }

      // If image analysis returned a food name, use it
      if (data.foodName) {
        setMealDescription(data.foodName);
      }

      setNutritionData({
        calories: Math.round(data.calories),
        protein: Math.round(data.protein),
        carbs: Math.round(data.carbs),
        fat: Math.round(data.fat)
      });

      toast({
        title: "Analysis complete!",
        description: "Nutrition data has been estimated. Review and save.",
      });
    } catch (error) {
      console.error("Error analyzing meal:", error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the meal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMeal = async () => {
    if (!mealDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe what you ate.",
        variant: "destructive",
      });
      return;
    }

    if (!nutritionData) {
      toast({
        title: "Analysis required",
        description: "Please analyze your meal first to get nutrition data.",
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
          food_name: mealDescription.trim(),
          calories: nutritionData.calories,
          protein_grams: nutritionData.protein,
          carbs_grams: nutritionData.carbs,
          fat_grams: nutritionData.fat,
        });

      if (error) throw error;

      toast({
        title: "Meal logged",
        description: `${mealDescription} (${nutritionData.calories} cal) added to ${mealTypes.find(m => m.value === selectedMeal)?.label}`,
      });

      setMealDescription("");
      setNutritionData(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

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
          <p className="text-muted-foreground">Track your daily nutrition with AI</p>
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
            <Label htmlFor="meal">What did you eat?</Label>
            <Textarea
              id="meal"
              placeholder="e.g., 3 eggs sunny side up, 6 pieces of bacon, 1/2 avocado, 2 cups of coffee"
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>

          <div>
            <Label>Or upload a photo</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            {imagePreview && (
              <div className="relative mt-2">
                <img src={imagePreview} alt="Meal preview" className="w-full h-40 object-cover rounded-md" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <Button
            onClick={handleAnalyzeMeal}
            className="w-full gap-2"
            disabled={isAnalyzing || (!mealDescription.trim() && !imagePreview)}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze with AI
              </>
            )}
          </Button>

          {nutritionData && (
            <Card className="p-4 bg-accent/10 border-accent">
              <h4 className="font-semibold mb-3 text-accent">Estimated Nutrition</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="text-2xl font-bold text-accent">{nutritionData.calories}</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold text-accent">{nutritionData.protein}g</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-2xl font-bold text-accent">{nutritionData.carbs}g</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="text-2xl font-bold text-accent">{nutritionData.fat}g</p>
                </div>
              </div>
            </Card>
          )}

          <Button
            onClick={handleAddMeal}
            className="w-full gap-2"
            disabled={!nutritionData}
          >
            <Plus className="w-4 h-4" />
            Save Meal
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
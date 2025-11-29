// REBUILT - Date/Time Picker v4.0 - Force Render
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Utensils, Plus, Clock, Camera, Sparkles, Loader2, Pencil, Trash2, ArrowLeft, Search, Calendar } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface MealLog {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  logged_at: string;
  image_url: string | null;
}

const FoodLog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [logDate, setLogDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [timeOfDay, setTimeOfDay] = useState<string>("morning");
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
  const [saveImage, setSaveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setMealLogs(data || []);
    } catch (error) {
      console.error('Error fetching meal logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate today's calories only
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMeals = mealLogs.filter(meal => new Date(meal.logged_at) >= todayStart);
  const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  // Group meals by date
  const mealsByDate = mealLogs.reduce((acc, meal) => {
    const date = new Date(meal.logged_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, MealLog[]>);

  const handleSearchFood = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-food', {
        body: { query: searchQuery },
      });

      if (error) throw error;
      setSearchResults(data.foods || []);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast({
        title: "Search failed",
        description: "Could not search food database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food: any) => {
    setMealDescription(food.description);
    setNutritionData({
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

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

      let uploadedImageUrl: string | null = null;

      // Upload image to storage if saveImage is checked and we have an image
      if (saveImage && imagePreview) {
        const base64Data = imagePreview.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(fileName, blob);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Image upload failed",
            description: "Meal will be saved without the image.",
            variant: "destructive",
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);
          uploadedImageUrl = publicUrl;
        }
      }

      if (editingMeal) {
        // Update existing meal
        const updateData: any = {
          meal_type: selectedMeal,
          food_name: mealDescription.trim(),
          calories: nutritionData.calories,
          protein_grams: nutritionData.protein,
          carbs_grams: nutritionData.carbs,
          fat_grams: nutritionData.fat,
        };

        if (uploadedImageUrl) {
          updateData.image_url = uploadedImageUrl;
        }

        const { error } = await supabase
          .from('nutrition_logs')
          .update(updateData)
          .eq('id', editingMeal.id);

        if (error) throw error;

        toast({
          title: "Meal updated",
          description: "Your meal has been updated successfully.",
        });
      } else {
        // Insert new meal
        const loggedAtTimestamp = new Date(logDate).toISOString();
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
            image_url: uploadedImageUrl,
            logged_at: loggedAtTimestamp,
          });

        if (error) throw error;

        toast({
          title: "Meal logged",
          description: `${mealDescription} (${nutritionData.calories} cal) added to ${mealTypes.find(m => m.value === selectedMeal)?.label}`,
        });
      }

      setMealDescription("");
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setLogDate(`${year}-${month}-${day}`);
      setTimeOfDay("morning");
      setNutritionData(null);
      setImagePreview(null);
      setSaveImage(false);
      setEditingMeal(null);
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

  const handleEditMeal = (meal: MealLog) => {
    setEditingMeal(meal);
    setSelectedMeal(meal.meal_type);
    setMealDescription(meal.food_name);
    setLogDate(new Date(meal.logged_at).toISOString().split('T')[0]);
    setNutritionData({
      calories: meal.calories,
      protein: meal.protein_grams || 0,
      carbs: meal.carbs_grams || 0,
      fat: meal.fat_grams || 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMeal(null);
    setMealDescription("");
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setLogDate(`${year}-${month}-${day}`);
    setTimeOfDay("morning");
    setNutritionData(null);
    setImagePreview(null);
    setSaveImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Meal deleted",
        description: "The meal entry has been removed.",
      });

      fetchMealLogs();
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        title: "Error",
        description: "Failed to delete meal.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/food')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
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

      <Card key="meal-log-form" className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {editingMeal ? 'Edit Meal' : 'Log New Meal'}
          </h3>
          {editingMeal && (
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="log-date">Date</Label>
              <Input
                id="log-date"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="meal-time">Time of Day</Label>
              <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                <SelectTrigger id="meal-time" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">☀️ Morning (6AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">🌤️ Afternoon (12PM - 6PM)</SelectItem>
                  <SelectItem value="evening">🌙 Evening (6PM - 12AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="search">Search Food Database</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Search for foods (e.g., chicken breast, apple)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchFood()}
              />
              <Button
                onClick={handleSearchFood}
                disabled={isSearching || !searchQuery.trim()}
                variant="secondary"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {searchResults.map((food) => (
                  <button
                    key={food.fdcId}
                    onClick={() => handleSelectFood(food)}
                    className="w-full p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{food.description}</p>
                        <p className="text-xs text-muted-foreground">{food.brandOwner}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{food.calories} cal</p>
                        <p className="text-xs text-muted-foreground">
                          P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or describe manually
              </span>
            </div>
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
              <div className="space-y-2 mt-2">
                <div className="relative">
                  <img src={imagePreview} alt="Meal preview" className="w-full h-40 object-cover rounded-md" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null);
                      setSaveImage(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveImage"
                    checked={saveImage}
                    onCheckedChange={(checked) => setSaveImage(checked as boolean)}
                  />
                  <Label htmlFor="saveImage" className="text-sm cursor-pointer">
                    Save this photo with meal log
                  </Label>
                </div>
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
            {editingMeal ? 'Update Meal' : 'Save Meal'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Meal History</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : mealLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No meals logged yet. Start tracking above!</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(mealsByDate).map(([date, meals]) => {
              const isToday = date === new Date().toLocaleDateString();
              const dayCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
              
              return (
                <div key={date} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-primary">
                      {isToday ? 'Today' : date}
                    </h4>
                    <span className="text-sm text-muted-foreground">{dayCalories} cal</span>
                  </div>
                  <div className="space-y-3">
                    {mealTypes.map((mealType) => {
                      const typeMeals = meals.filter(log => log.meal_type === mealType.value);
                      if (typeMeals.length === 0) return null;

                      return (
                        <div key={mealType.value} className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">{mealType.label}</h5>
                          {typeMeals.map((meal) => (
                            <Card key={meal.id} className="p-4 bg-accent/5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <h6 className="font-medium mb-2">{meal.food_name}</h6>
                                  {meal.image_url && (
                                    <img 
                                      src={meal.image_url} 
                                      alt={meal.food_name} 
                                      className="w-full h-32 object-cover rounded-md mb-2"
                                    />
                                  )}
                                  <div className="flex gap-4 text-sm">
                                    <span className="text-accent font-medium">{meal.calories} cal</span>
                                    {meal.protein_grams && <span className="text-muted-foreground">P: {meal.protein_grams}g</span>}
                                    {meal.carbs_grams && <span className="text-muted-foreground">C: {meal.carbs_grams}g</span>}
                                    {meal.fat_grams && <span className="text-muted-foreground">F: {meal.fat_grams}g</span>}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditMeal(meal)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteMeal(meal.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      );
                    })}
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

export default FoodLog;

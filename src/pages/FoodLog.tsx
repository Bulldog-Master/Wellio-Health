// REBUILT - Date/Time Picker v4.0 - Force Render
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Utensils, Plus, Clock, Camera, Sparkles, Loader2, Pencil, Trash2, ArrowLeft, Search, Calendar, Bookmark, BookmarkCheck, ScanBarcode } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { foodLogSchema, mealSearchSchema, validateAndSanitize } from "@/lib/validationSchemas";
import { useTranslation } from "react-i18next";
import { BarcodeScanner, ProductInfo } from "@/components/food/BarcodeScanner";
import { ReceiptScanner, ReceiptItem } from "@/components/food/ReceiptScanner";
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

interface SavedMeal {
  id: string;
  meal_name: string;
  meal_type: string;
  calories: number;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  notes: string | null;
}

const FoodLog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation(['food', 'common']);
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
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [showSavedMeals, setShowSavedMeals] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const mealTypes = [
    { value: "breakfast", label: t('food:breakfast') },
    { value: "lunch", label: t('food:lunch') },
    { value: "dinner", label: t('food:dinner') },
    { value: "snack", label: t('food:snack') },
    { value: "fast", label: t('food:fast') },
  ];

  useEffect(() => {
    fetchMealLogs();
    fetchSavedMeals();
  }, []);

  // Auto-set nutrition data to zeros when Fast is selected
  useEffect(() => {
    if (selectedMeal === 'fast') {
      setNutritionData({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  }, [selectedMeal]);

  const fetchMealLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user ID:', user?.id);
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('Fetching nutrition logs for user:', user.id);
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      console.log('Query result - data:', data, 'error:', error);
      if (error) throw error;
      console.log('Setting meal logs, count:', data?.length || 0);
      setMealLogs(data || []);
    } catch (error) {
      console.error('Error fetching meal logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate today's calories only - use date strings from DB to avoid timezone issues
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const todayMeals = mealLogs.filter(meal => {
    const mealDateString = meal.logged_at.split('T')[0]; // Extract YYYY-MM-DD from timestamp
    return mealDateString === todayDateString;
  });
  
  const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  // Group meals by date - use ISO date strings (YYYY-MM-DD) as keys to ensure consistency across browsers
  const mealsByDate = mealLogs.reduce((acc, meal) => {
    const dateString = meal.logged_at.split('T')[0]; // YYYY-MM-DD format
    if (!acc[dateString]) acc[dateString] = [];
    acc[dateString].push(meal);
    return acc;
  }, {} as Record<string, MealLog[]>);

  const fetchSavedMeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_meals')
        .select('*')
        .eq('user_id', user.id)
        .order('meal_name');

      if (error) throw error;
      setSavedMeals(data || []);
    } catch (error) {
      console.error('Error fetching saved meals:', error);
    }
  };

  const handleSearchFood = async () => {
    // Validate search query
    const validation = validateAndSanitize(mealSearchSchema, { query: searchQuery });
    if (validation.success === false) {
      toast({
        title: t('food:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

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
        title: t('food:search_failed'),
        description: t('food:search_failed_desc'),
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

  const handleBarcodeProduct = (product: ProductInfo) => {
    setMealDescription(product.name + (product.brand ? ` (${product.brand})` : ''));
    setNutritionData({
      calories: product.calories || 0,
      protein: product.protein || 0,
      carbs: product.carbs || 0,
      fat: product.fat || 0,
    });
    setShowBarcodeScanner(false);
  };

  const handleReceiptItems = async (items: ReceiptItem[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('food:auth_required'),
          description: t('food:auth_required_desc'),
          variant: "destructive",
        });
        return;
      }

      const loggedAtTimestamp = new Date(logDate).toISOString();
      
      for (const item of items) {
        const { error } = await supabase
          .from('nutrition_logs')
          .insert({
            user_id: user.id,
            meal_type: selectedMeal,
            food_name: item.name,
            calories: item.calories * (item.quantity || 1),
            protein_grams: item.protein * (item.quantity || 1),
            carbs_grams: item.carbs * (item.quantity || 1),
            fat_grams: item.fat * (item.quantity || 1),
            logged_at: loggedAtTimestamp,
          });

        if (error) throw error;
      }

      toast({
        title: t('food:food_logged'),
        description: t('food:receipt_items_logged', { count: items.length }),
      });

      fetchMealLogs();
    } catch (error) {
      console.error('Error logging receipt items:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_log_meal'),
        variant: "destructive",
      });
    }
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
        title: t('food:input_required'),
        description: t('food:input_required_desc'),
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
        title: t('food:analysis_complete'),
        description: t('food:analysis_complete_desc'),
      });
    } catch (error) {
      console.error("Error analyzing meal:", error);
      toast({
        title: t('food:analysis_failed'),
        description: t('food:analysis_failed_desc'),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMeal = async () => {
    // For fasting, auto-set nutrition data to zeros
    const isFasting = selectedMeal === 'fast';
    const finalNutritionData = isFasting 
      ? { calories: 0, protein: 0, carbs: 0, fat: 0 }
      : nutritionData;
    
    const finalDescription = isFasting && !mealDescription.trim() 
      ? t('food:fast') 
      : mealDescription.trim();

    if (!finalNutritionData && !isFasting) {
      toast({
        title: t('food:analysis_required'),
        description: t('food:analysis_required_desc'),
        variant: "destructive",
      });
      return;
    }

    // Skip validation for fasting - we know it's valid
    if (!isFasting) {
      // Validate meal data using Zod
      const validation = validateAndSanitize(foodLogSchema, {
        meal_type: selectedMeal as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'fast',
        food_name: finalDescription,
        calories: finalNutritionData?.calories ?? 0,
        protein_grams: finalNutritionData?.protein ?? 0,
        carbs_grams: finalNutritionData?.carbs ?? 0,
        fat_grams: finalNutritionData?.fat ?? 0,
        logged_at: logDate,
      });

      if (validation.success === false) {
        console.error('Validation error:', validation.error);
        toast({
          title: t('food:validation_error'),
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('food:auth_required'),
          description: t('food:auth_required_desc'),
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
            title: t('food:image_upload_failed'),
            description: t('food:image_upload_failed_desc'),
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
          food_name: finalDescription,
          calories: finalNutritionData?.calories ?? 0,
          protein_grams: finalNutritionData?.protein ?? 0,
          carbs_grams: finalNutritionData?.carbs ?? 0,
          fat_grams: finalNutritionData?.fat ?? 0,
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
          title: t('food:meal_updated'),
          description: t('food:meal_updated_desc'),
        });
      } else {
        // Insert new meal
        const loggedAtTimestamp = new Date(logDate).toISOString();
        const { error } = await supabase
          .from('nutrition_logs')
          .insert({
            user_id: user.id,
            meal_type: selectedMeal,
            food_name: finalDescription,
            calories: finalNutritionData?.calories ?? 0,
            protein_grams: finalNutritionData?.protein ?? 0,
            carbs_grams: finalNutritionData?.carbs ?? 0,
            fat_grams: finalNutritionData?.fat ?? 0,
            image_url: uploadedImageUrl,
            logged_at: loggedAtTimestamp,
          });

        if (error) throw error;

        toast({
          title: t('food:food_logged'),
          description: t('food:meal_logged_desc', {
            name: finalDescription,
            calories: finalNutritionData?.calories ?? 0,
            mealType: mealTypes.find(m => m.value === selectedMeal)?.label
          }),
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
        title: t('food:error'),
        description: t('food:failed_to_log_meal'),
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
        title: t('food:meal_deleted'),
        description: t('food:meal_deleted_desc'),
      });

      fetchMealLogs();
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_delete_meal'),
        variant: "destructive",
      });
    }
  };

  const handleSaveAsMeal = async () => {
    if (!nutritionData || !mealDescription.trim()) {
      toast({
        title: t('food:cannot_save'),
        description: t('food:cannot_save_desc'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_meals')
        .insert({
          user_id: user.id,
          meal_name: mealDescription.trim(),
          meal_type: selectedMeal,
          calories: nutritionData.calories,
          protein_grams: nutritionData.protein,
          carbs_grams: nutritionData.carbs,
          fat_grams: nutritionData.fat,
        });

      if (error) throw error;

      toast({
        title: t('food:meal_saved'),
        description: t('food:meal_saved_desc'),
      });

      fetchSavedMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_save_meal'),
        variant: "destructive",
      });
    }
  };

  const handleLoadSavedMeal = (meal: SavedMeal) => {
    setMealDescription(meal.meal_name);
    setSelectedMeal(meal.meal_type);
    setNutritionData({
      calories: meal.calories,
      protein: meal.protein_grams || 0,
      carbs: meal.carbs_grams || 0,
      fat: meal.fat_grams || 0,
    });
    setShowSavedMeals(false);
    toast({
      title: t('food:meal_loaded'),
      description: t('food:meal_loaded_desc'),
    });
  };

  const handleDeleteSavedMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_meals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('food:saved_meal_deleted'),
        description: t('food:saved_meal_deleted_desc'),
      });

      fetchSavedMeals();
    } catch (error) {
      console.error('Error deleting saved meal:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_delete_saved_meal'),
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
          <h1 className="text-3xl font-bold">{t('food:food_log')}</h1>
          <p className="text-muted-foreground">{t('food:track_daily_nutrition')}</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-accent text-accent-foreground shadow-glow">
        <h3 className="text-lg font-semibold mb-2">{t('food:todays_calories')}</h3>
        <p className="text-4xl font-bold mb-2">{totalCalories}</p>
        <p className="opacity-90">{Math.max(0, 2000 - totalCalories)} {t('food:cal_remaining')} ({t('food:goal')}: 2000)</p>
      </Card>

      <Card key="meal-log-form" className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {editingMeal ? t('food:edit_meal') : t('food:log_new_meal')}
          </h3>
          {editingMeal && (
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              {t('food:cancel')}
            </Button>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="mealType">{t('food:meal_type')}</Label>
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
              <Label htmlFor="log-date">{t('food:date')}</Label>
              <Input
                id="log-date"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="meal-time">{t('food:time_of_day')}</Label>
              <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                <SelectTrigger id="meal-time" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">{t('food:morning')}</SelectItem>
                  <SelectItem value="afternoon">{t('food:afternoon')}</SelectItem>
                  <SelectItem value="evening">{t('food:evening')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedMeal !== 'fast' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label htmlFor="search">{t('food:search_food_database')}</Label>
                  <div className="flex gap-2">
                    <ReceiptScanner onItemsConfirmed={handleReceiptItems} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBarcodeScanner(true)}
                      className="gap-2"
                    >
                      <ScanBarcode className="w-4 h-4" />
                      {t('food:scan_barcode')}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder={t('food:search_placeholder')}
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
                    {t('food:or_describe_manually')}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="meal">{t('food:what_did_you_eat')}</Label>
                <Textarea
                  id="meal"
                  placeholder={t('food:meal_placeholder')}
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div>
                <Label>{t('food:or_upload_photo')}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-1.5 gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {imagePreview ? t('food:choose_file') : t('food:choose_file')}
                </Button>
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
                        {t('food:remove')}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveImage"
                        checked={saveImage}
                        onCheckedChange={(checked) => setSaveImage(checked as boolean)}
                      />
                      <Label htmlFor="saveImage" className="text-sm cursor-pointer">
                        {t('food:save_photo_with_meal')}
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
                    {t('food:analyzing_with_ai')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t('food:analyze_with_ai')}
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Dialog open={showSavedMeals} onOpenChange={setShowSavedMeals}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Bookmark className="w-4 h-4" />
                      {t('food:load_saved_meal')} ({savedMeals.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('food:your_saved_meals')}</DialogTitle>
                    </DialogHeader>
                    {savedMeals.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {t('food:no_saved_meals_yet')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {savedMeals.map((meal) => (
                          <Card key={meal.id} className="p-4 hover:bg-accent/5 cursor-pointer" onClick={() => handleLoadSavedMeal(meal)}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium">{meal.meal_name}</h5>
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {mealTypes.find(m => m.value === meal.meal_type)?.label}
                                  </span>
                                </div>
                                <div className="flex gap-4 text-sm">
                                  <span className="text-accent font-medium">{meal.calories} cal</span>
                                  {meal.protein_grams && <span className="text-muted-foreground">P: {meal.protein_grams}g</span>}
                                  {meal.carbs_grams && <span className="text-muted-foreground">C: {meal.carbs_grams}g</span>}
                                  {meal.fat_grams && <span className="text-muted-foreground">F: {meal.fat_grams}g</span>}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSavedMeal(meal.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}

          {selectedMeal === 'fast' && (
            <Card className="p-4 bg-accent/10 border-accent text-center">
              <p className="text-muted-foreground">{t('food:fast')} - 0 {t('food:calories')}</p>
            </Card>
          )}

          {nutritionData && selectedMeal !== 'fast' && (
            <Card className="p-4 bg-accent/10 border-accent">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-accent">{t('food:estimated_nutrition')}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveAsMeal}
                  className="gap-2"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {t('food:save_as_template')}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">{t('food:calories')}</p>
                  <p className="text-2xl font-bold text-accent">{nutritionData.calories}</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">{t('food:protein')}</p>
                  <p className="text-2xl font-bold text-accent">{nutritionData.protein}g</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">{t('food:carbs')}</p>
                  <p className="text-2xl font-bold text-accent">{nutritionData.carbs}g</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">{t('food:fats')}</p>
                  <p className="text-2xl font-bold text-accent">{nutritionData.fat}g</p>
                </div>
              </div>
            </Card>
          )}

          <Button
            onClick={handleAddMeal}
            className="w-full gap-2"
            disabled={!nutritionData && selectedMeal !== 'fast'}
          >
            <Plus className="w-4 h-4" />
            {editingMeal ? t('food:update_meal') : t('food:save_meal')}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">{t('food:meal_history')}</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">{t('food:loading')}</p>
        ) : mealLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t('food:no_meals_logged_yet')}</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(mealsByDate).map(([dateString, meals]) => {
              // Compare ISO date strings (YYYY-MM-DD) to determine if it's today
              const isToday = dateString === todayDateString;
              const dayCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
              
              // Format the date for display (avoid toLocaleDateString for consistency)
              const displayDate = isToday ? t('food:today') : dateString;
              
              return (
                <div key={dateString} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-primary">
                      {displayDate}
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
                                  title={t('food:edit')}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  title={t('food:delete')}
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

      <BarcodeScanner
        open={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onProductFound={handleBarcodeProduct}
      />
    </div>
  );
};

export default FoodLog;

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { mealSearchSchema, validateAndSanitize } from '@/lib/validationSchemas';

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

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const useFoodLog = () => {
  const { toast } = useToast();
  const { t } = useTranslation(['food', 'common']);
  
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

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

  const searchFood = async (query: string) => {
    const validation = validateAndSanitize(mealSearchSchema, { query });
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
        body: { query },
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

  const analyzeMeal = async (mealDescription: string, imagePreview: string | null): Promise<NutritionData | null> => {
    if (!mealDescription.trim() && !imagePreview) {
      toast({
        title: t('food:input_required'),
        description: t('food:input_required_desc'),
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: {
          mealDescription: mealDescription.trim() || null,
          imageBase64: imagePreview || null
        }
      });

      if (error || !data) throw error || new Error('No data returned');

      toast({
        title: t('food:analysis_complete'),
        description: t('food:analysis_complete_desc'),
      });

      return {
        calories: Math.round(data.calories),
        protein: Math.round(data.protein),
        carbs: Math.round(data.carbs),
        fat: Math.round(data.fat)
      };
    } catch (error) {
      console.error("Error analyzing meal:", error);
      toast({
        title: t('food:analysis_failed'),
        description: t('food:analysis_failed_desc'),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const logMeal = async (
    selectedMeal: string,
    mealDescription: string,
    nutritionData: NutritionData | null,
    logDate: string,
    imagePreview: string | null,
    saveImage: boolean,
    editingMealId?: string
  ): Promise<boolean> => {
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
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('food:auth_required'),
          description: t('food:auth_required_desc'),
          variant: "destructive",
        });
        return false;
      }

      let uploadedImageUrl: string | null = null;

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
        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(fileName, blob);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);
          uploadedImageUrl = publicUrl;
        }
      }

      if (editingMealId) {
        const updateData: any = {
          meal_type: selectedMeal,
          food_name: finalDescription,
          calories: finalNutritionData?.calories ?? 0,
          protein_grams: finalNutritionData?.protein ?? 0,
          carbs_grams: finalNutritionData?.carbs ?? 0,
          fat_grams: finalNutritionData?.fat ?? 0,
        };

        if (uploadedImageUrl) updateData.image_url = uploadedImageUrl;

        const { error } = await supabase
          .from('nutrition_logs')
          .update(updateData)
          .eq('id', editingMealId);

        if (error) throw error;

        toast({
          title: t('food:meal_updated'),
          description: t('food:meal_updated_desc'),
        });
      } else {
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
          }),
        });
      }

      await fetchMealLogs();
      return true;
    } catch (error) {
      console.error('Error logging meal:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_log_meal'),
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteMeal = async (id: string) => {
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

      await fetchMealLogs();
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_delete_meal'),
        variant: "destructive",
      });
    }
  };

  const saveAsTemplate = async (
    mealDescription: string,
    selectedMeal: string,
    nutritionData: NutritionData
  ) => {
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

      await fetchSavedMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_save_meal'),
        variant: "destructive",
      });
    }
  };

  const deleteSavedMeal = async (id: string) => {
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

      await fetchSavedMeals();
    } catch (error) {
      console.error('Error deleting saved meal:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_delete_saved_meal'),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMealLogs();
    fetchSavedMeals();
  }, []);

  // Calculate today's stats
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];
  const todayMeals = mealLogs.filter(meal => meal.logged_at.split('T')[0] === todayDateString);
  const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  // Group meals by date
  const mealsByDate = mealLogs.reduce((acc, meal) => {
    const dateString = meal.logged_at.split('T')[0];
    if (!acc[dateString]) acc[dateString] = [];
    acc[dateString].push(meal);
    return acc;
  }, {} as Record<string, MealLog[]>);

  return {
    mealLogs,
    savedMeals,
    isLoading,
    isAnalyzing,
    isSearching,
    searchResults,
    totalCalories,
    mealsByDate,
    searchFood,
    analyzeMeal,
    logMeal,
    deleteMeal,
    saveAsTemplate,
    deleteSavedMeal,
    clearSearchResults: () => setSearchResults([]),
    refetch: fetchMealLogs,
  };
};

export type { MealLog, SavedMeal, NutritionData };

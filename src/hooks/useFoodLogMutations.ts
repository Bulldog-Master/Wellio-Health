import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { foodLogSchema, validateAndSanitize } from '@/lib/validationSchemas';

export interface MealLog {
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

export interface SavedMeal {
  id: string;
  meal_name: string;
  meal_type: string;
  calories: number;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  notes: string | null;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface UseFoodLogMutationsProps {
  onSuccess?: () => void;
}

export function useFoodLogMutations({ onSuccess }: UseFoodLogMutationsProps = {}) {
  const { toast } = useToast();
  const { t } = useTranslation(['food', 'common']);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const addMeal = async (params: {
    mealType: string;
    description: string;
    nutritionData: NutritionData | null;
    logDate: string;
    imagePreview: string | null;
    saveImage: boolean;
    editingMeal: MealLog | null;
    mealTypes: { value: string; label: string }[];
  }) => {
    const { mealType, description, nutritionData, logDate, imagePreview, saveImage, editingMeal, mealTypes } = params;
    
    const isFasting = mealType === 'fast';
    const finalNutritionData = isFasting 
      ? { calories: 0, protein: 0, carbs: 0, fat: 0 }
      : nutritionData;
    
    const finalDescription = isFasting && !description.trim() 
      ? t('food:fast') 
      : description.trim();

    if (!finalNutritionData && !isFasting) {
      toast({
        title: t('food:analysis_required'),
        description: t('food:analysis_required_desc'),
        variant: "destructive",
      });
      return false;
    }

    if (!isFasting) {
      const validation = validateAndSanitize(foodLogSchema, {
        meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'fast',
        food_name: finalDescription,
        calories: finalNutritionData?.calories ?? 0,
        protein_grams: finalNutritionData?.protein ?? 0,
        carbs_grams: finalNutritionData?.carbs ?? 0,
        fat_grams: finalNutritionData?.fat ?? 0,
        logged_at: logDate,
      });

      if (validation.success === false) {
        toast({
          title: t('food:validation_error'),
          description: validation.error,
          variant: "destructive",
        });
        return false;
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

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);
          uploadedImageUrl = publicUrl;
        }
      }

      if (editingMeal) {
        const updateData: Record<string, unknown> = {
          meal_type: mealType,
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
        const loggedAtTimestamp = new Date(logDate).toISOString();
        const { error } = await supabase
          .from('nutrition_logs')
          .insert({
            user_id: user.id,
            meal_type: mealType,
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
            mealType: mealTypes.find(m => m.value === mealType)?.label
          }),
        });
      }

      onSuccess?.();
      fetchMealLogs();
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

  const saveAsMeal = async (mealDescription: string, mealType: string, nutritionData: NutritionData) => {
    if (!nutritionData || !mealDescription.trim()) {
      toast({
        title: t('food:cannot_save'),
        description: t('food:cannot_save_desc'),
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('saved_meals')
        .insert({
          user_id: user.id,
          meal_name: mealDescription.trim(),
          meal_type: mealType,
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
      return true;
    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_save_meal'),
        variant: "destructive",
      });
      return false;
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

  const logReceiptItems = async (items: { name: string; calories: number; protein: number; carbs: number; fat: number; quantity?: number }[], mealType: string, logDate: string) => {
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

      const loggedAtTimestamp = new Date(logDate).toISOString();
      
      for (const item of items) {
        const { error } = await supabase
          .from('nutrition_logs')
          .insert({
            user_id: user.id,
            meal_type: mealType,
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
      return true;
    } catch (error) {
      console.error('Error logging receipt items:', error);
      toast({
        title: t('food:error'),
        description: t('food:failed_to_log_meal'),
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    mealLogs,
    savedMeals,
    isLoading,
    fetchMealLogs,
    fetchSavedMeals,
    addMeal,
    deleteMeal,
    saveAsMeal,
    deleteSavedMeal,
    logReceiptItems,
  };
}

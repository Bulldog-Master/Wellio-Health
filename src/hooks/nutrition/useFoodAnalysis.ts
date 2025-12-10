import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { mealSearchSchema, validateAndSanitize } from '@/lib/validation';
import { NutritionData } from './useFoodLogMutations';

export function useFoodAnalysis() {
  const { toast } = useToast();
  const { t } = useTranslation(['food', 'common']);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchFood = async (searchQuery: string) => {
    const validation = validateAndSanitize(mealSearchSchema, { query: searchQuery });
    if (validation.success === false) {
      toast({
        title: t('food:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return [];
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-food', {
        body: { query: searchQuery },
      });

      if (error) throw error;
      const results = data.foods || [];
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Error searching foods:', error);
      toast({
        title: t('food:search_failed'),
        description: t('food:search_failed_desc'),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const analyzeMeal = async (mealDescription: string, imagePreview: string | null): Promise<{ nutritionData: NutritionData; foodName?: string } | null> => {
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

      if (error) throw error;
      if (!data) throw new Error('No data returned from analysis');

      toast({
        title: t('food:analysis_complete'),
        description: t('food:analysis_complete_desc'),
      });

      return {
        nutritionData: {
          calories: Math.round(data.calories),
          protein: Math.round(data.protein),
          carbs: Math.round(data.carbs),
          fat: Math.round(data.fat)
        },
        foodName: data.foodName
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

  const clearSearchResults = () => setSearchResults([]);

  return {
    isAnalyzing,
    isSearching,
    searchResults,
    searchFood,
    analyzeMeal,
    clearSearchResults,
  };
}

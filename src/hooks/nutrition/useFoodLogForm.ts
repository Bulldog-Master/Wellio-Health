import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useFoodLogMutations, useFoodAnalysis, type MealLog, type NutritionData } from '@/hooks/nutrition';
import { ProductInfo } from '@/components/food/BarcodeScanner';
import { ReceiptItem } from '@/components/food/ReceiptScanner';

const getInitialDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useFoodLogForm = () => {
  const { toast } = useToast();
  const { t } = useTranslation(['food', 'common']);

  // Form state
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [logDate, setLogDate] = useState<string>(getInitialDate);
  const [timeOfDay, setTimeOfDay] = useState<string>("morning");
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saveImage, setSaveImage] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedMeals, setShowSavedMeals] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const mealTypes = [
    { value: "breakfast", label: t('food:breakfast') },
    { value: "lunch", label: t('food:lunch') },
    { value: "dinner", label: t('food:dinner') },
    { value: "snack", label: t('food:snack') },
    { value: "fast", label: t('food:fast') },
  ];

  const resetForm = () => {
    setMealDescription("");
    setLogDate(getInitialDate());
    setTimeOfDay("morning");
    setNutritionData(null);
    setImagePreview(null);
    setSaveImage(false);
    setEditingMeal(null);
  };

  const { 
    mealLogs, 
    savedMeals, 
    isLoading, 
    fetchMealLogs, 
    fetchSavedMeals, 
    addMeal, 
    deleteMeal, 
    saveAsMeal, 
    deleteSavedMeal, 
    logReceiptItems 
  } = useFoodLogMutations({ onSuccess: resetForm });
  
  const { 
    isAnalyzing, 
    isSearching, 
    searchResults, 
    searchFood, 
    analyzeMeal, 
    clearSearchResults 
  } = useFoodAnalysis();

  useEffect(() => {
    fetchMealLogs();
    fetchSavedMeals();
  }, []);

  useEffect(() => {
    if (selectedMeal === 'fast') {
      setNutritionData({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  }, [selectedMeal]);

  // Calculate today's calories
  const todayDateString = new Date().toISOString().split('T')[0];
  const todayMeals = mealLogs.filter(meal => meal.logged_at.split('T')[0] === todayDateString);
  const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  // Group meals by date
  const mealsByDate = mealLogs.reduce((acc, meal) => {
    const dateString = meal.logged_at.split('T')[0];
    if (!acc[dateString]) acc[dateString] = [];
    acc[dateString].push(meal);
    return acc;
  }, {} as Record<string, MealLog[]>);

  const handleAnalyze = async () => {
    const result = await analyzeMeal(mealDescription, imagePreview);
    if (result) {
      setNutritionData(result.nutritionData);
      if (result.foodName) setMealDescription(result.foodName);
    }
  };

  const handleSearchFood = async () => {
    await searchFood(searchQuery);
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
    clearSearchResults();
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
    await logReceiptItems(items, selectedMeal, logDate);
  };

  const handleAddMeal = async () => {
    await addMeal({
      mealType: selectedMeal,
      description: mealDescription,
      nutritionData,
      logDate,
      imagePreview,
      saveImage,
      editingMeal,
      mealTypes,
    });
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

  const handleLoadSavedMeal = (meal: any) => {
    setMealDescription(meal.meal_name);
    setSelectedMeal(meal.meal_type);
    setNutritionData({
      calories: meal.calories,
      protein: meal.protein_grams || 0,
      carbs: meal.carbs_grams || 0,
      fat: meal.fat_grams || 0,
    });
    setShowSavedMeals(false);
    toast({ title: t('food:meal_loaded'), description: t('food:meal_loaded_desc') });
  };

  const handleSaveAsMeal = () => {
    if (nutritionData) saveAsMeal(mealDescription, selectedMeal, nutritionData);
  };

  return {
    // Form state
    selectedMeal,
    setSelectedMeal,
    mealDescription,
    setMealDescription,
    logDate,
    setLogDate,
    timeOfDay,
    setTimeOfDay,
    nutritionData,
    setNutritionData,
    imagePreview,
    setImagePreview,
    saveImage,
    setSaveImage,
    editingMeal,
    searchQuery,
    setSearchQuery,
    showSavedMeals,
    setShowSavedMeals,
    showBarcodeScanner,
    setShowBarcodeScanner,
    mealTypes,
    
    // Data
    mealLogs,
    savedMeals,
    mealsByDate,
    totalCalories,
    isLoading,
    isAnalyzing,
    isSearching,
    searchResults,
    
    // Actions
    resetForm,
    handleAnalyze,
    handleSearchFood,
    handleSelectFood,
    handleBarcodeProduct,
    handleReceiptItems,
    handleAddMeal,
    handleEditMeal,
    handleLoadSavedMeal,
    handleSaveAsMeal,
    deleteMeal,
    deleteSavedMeal,
    clearSearchResults,
  };
};

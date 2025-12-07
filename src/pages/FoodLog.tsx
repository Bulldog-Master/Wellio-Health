import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, ArrowLeft, Plus } from 'lucide-react';
import { useFoodLogMutations, MealLog, NutritionData } from '@/hooks/useFoodLogMutations';
import { useFoodAnalysis } from '@/hooks/useFoodAnalysis';
import { MealLogForm, MealLogList } from '@/components/food';
import { ProductInfo } from '@/components/food/BarcodeScanner';
import { ReceiptItem } from '@/components/food/ReceiptScanner';
import { useToast } from '@/hooks/use-toast';

const FoodLog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['food', 'common']);
  
  // Form state
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [logDate, setLogDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
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
    const now = new Date();
    setLogDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    setTimeOfDay("morning");
    setNutritionData(null);
    setImagePreview(null);
    setSaveImage(false);
    setEditingMeal(null);
  };

  const { mealLogs, savedMeals, isLoading, fetchMealLogs, fetchSavedMeals, addMeal, deleteMeal, saveAsMeal, deleteSavedMeal, logReceiptItems } = useFoodLogMutations({ onSuccess: resetForm });
  const { isAnalyzing, isSearching, searchResults, searchFood, analyzeMeal, clearSearchResults } = useFoodAnalysis();

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

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/food')} className="shrink-0">
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

      <MealLogForm
        selectedMeal={selectedMeal}
        setSelectedMeal={setSelectedMeal}
        mealDescription={mealDescription}
        setMealDescription={setMealDescription}
        logDate={logDate}
        setLogDate={setLogDate}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        nutritionData={nutritionData}
        setNutritionData={setNutritionData}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        saveImage={saveImage}
        setSaveImage={setSaveImage}
        isAnalyzing={isAnalyzing}
        isSearching={isSearching}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        savedMeals={savedMeals}
        showSavedMeals={showSavedMeals}
        setShowSavedMeals={setShowSavedMeals}
        showBarcodeScanner={showBarcodeScanner}
        setShowBarcodeScanner={setShowBarcodeScanner}
        editingMeal={editingMeal}
        mealTypes={mealTypes}
        onAnalyze={handleAnalyze}
        onSearchFood={handleSearchFood}
        onSelectFood={handleSelectFood}
        onBarcodeProduct={handleBarcodeProduct}
        onReceiptItems={handleReceiptItems}
        onLoadSavedMeal={handleLoadSavedMeal}
        onDeleteSavedMeal={deleteSavedMeal}
        onSaveAsMeal={handleSaveAsMeal}
        onCancelEdit={resetForm}
      />

      <Button onClick={handleAddMeal} className="w-full gap-2" size="lg">
        <Plus className="w-4 h-4" />
        {editingMeal ? t('food:update_meal') : t('food:log_meal')}
      </Button>

      <MealLogList
        mealsByDate={mealsByDate}
        isLoading={isLoading}
        mealTypes={mealTypes}
        onEdit={handleEditMeal}
        onDelete={deleteMeal}
      />
    </div>
  );
};

export default FoodLog;

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, ArrowLeft, Plus } from 'lucide-react';
import { useFoodLogForm } from '@/hooks/nutrition';
import { MealLogForm, MealLogList } from '@/components/food';

const FoodLog = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['food', 'common']);
  
  const {
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
  } = useFoodLogForm();

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

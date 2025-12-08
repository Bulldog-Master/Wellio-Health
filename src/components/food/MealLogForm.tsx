import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Sparkles, Loader2, Search, ScanBarcode, BookmarkCheck } from 'lucide-react';
import { BarcodeScanner, ProductInfo } from '@/components/food/BarcodeScanner';
import { ReceiptScanner, ReceiptItem } from '@/components/food/ReceiptScanner';
import { type NutritionData } from '@/hooks/nutrition';
import { SavedMealsDialog } from './SavedMealsDialog';

interface MealLogFormProps {
  selectedMeal: string;
  setSelectedMeal: (meal: string) => void;
  mealDescription: string;
  setMealDescription: (desc: string) => void;
  logDate: string;
  setLogDate: (date: string) => void;
  timeOfDay: string;
  setTimeOfDay: (time: string) => void;
  nutritionData: NutritionData | null;
  setNutritionData: (data: NutritionData | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  saveImage: boolean;
  setSaveImage: (save: boolean) => void;
  isAnalyzing: boolean;
  isSearching: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  savedMeals: any[];
  showSavedMeals: boolean;
  setShowSavedMeals: (show: boolean) => void;
  showBarcodeScanner: boolean;
  setShowBarcodeScanner: (show: boolean) => void;
  editingMeal: any;
  mealTypes: { value: string; label: string }[];
  onAnalyze: () => void;
  onSearchFood: () => void;
  onSelectFood: (food: any) => void;
  onBarcodeProduct: (product: ProductInfo) => void;
  onReceiptItems: (items: ReceiptItem[]) => void;
  onLoadSavedMeal: (meal: any) => void;
  onDeleteSavedMeal: (id: string) => void;
  onSaveAsMeal: () => void;
  onCancelEdit: () => void;
}

export function MealLogForm({
  selectedMeal,
  setSelectedMeal,
  mealDescription,
  setMealDescription,
  logDate,
  setLogDate,
  timeOfDay,
  setTimeOfDay,
  nutritionData,
  imagePreview,
  setImagePreview,
  saveImage,
  setSaveImage,
  isAnalyzing,
  isSearching,
  searchQuery,
  setSearchQuery,
  searchResults,
  savedMeals,
  showSavedMeals,
  setShowSavedMeals,
  showBarcodeScanner,
  setShowBarcodeScanner,
  editingMeal,
  mealTypes,
  onAnalyze,
  onSearchFood,
  onSelectFood,
  onBarcodeProduct,
  onReceiptItems,
  onLoadSavedMeal,
  onDeleteSavedMeal,
  onSaveAsMeal,
  onCancelEdit,
}: MealLogFormProps) {
  const { t } = useTranslation(['food', 'common']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {editingMeal ? t('food:edit_meal') : t('food:log_new_meal')}
        </h3>
        {editingMeal && (
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>
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
                  <ReceiptScanner onItemsConfirmed={onReceiptItems} />
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
                  onKeyDown={(e) => e.key === 'Enter' && onSearchFood()}
                />
                <Button
                  onClick={onSearchFood}
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
                      onClick={() => onSelectFood(food)}
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
                {t('food:choose_file')}
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
              onClick={onAnalyze}
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

            <SavedMealsDialog
              open={showSavedMeals}
              onOpenChange={setShowSavedMeals}
              savedMeals={savedMeals}
              mealTypes={mealTypes}
              onLoadMeal={onLoadSavedMeal}
              onDeleteMeal={onDeleteSavedMeal}
            />
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
              <Button variant="ghost" size="sm" onClick={onSaveAsMeal} className="gap-2">
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
                <p className="text-2xl font-bold">{nutritionData.protein}g</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground">{t('food:carbs')}</p>
                <p className="text-2xl font-bold">{nutritionData.carbs}g</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground">{t('food:fat')}</p>
                <p className="text-2xl font-bold">{nutritionData.fat}g</p>
              </div>
            </div>
          </Card>
        )}

        <BarcodeScanner
          open={showBarcodeScanner}
          onProductFound={onBarcodeProduct}
          onClose={() => setShowBarcodeScanner(false)}
        />
      </div>
    </Card>
  );
}

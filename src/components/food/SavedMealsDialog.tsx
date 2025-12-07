import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bookmark, Trash2 } from 'lucide-react';
import { SavedMeal } from '@/hooks/useFoodLogMutations';

interface SavedMealsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedMeals: SavedMeal[];
  mealTypes: { value: string; label: string }[];
  onLoadMeal: (meal: SavedMeal) => void;
  onDeleteMeal: (id: string) => void;
}

export function SavedMealsDialog({
  open,
  onOpenChange,
  savedMeals,
  mealTypes,
  onLoadMeal,
  onDeleteMeal,
}: SavedMealsDialogProps) {
  const { t } = useTranslation(['food', 'common']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
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
              <Card 
                key={meal.id} 
                className="p-4 hover:bg-accent/5 cursor-pointer" 
                onClick={() => onLoadMeal(meal)}
              >
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
                      onDeleteMeal(meal.id);
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
  );
}

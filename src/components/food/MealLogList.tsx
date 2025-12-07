import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Clock, Utensils } from 'lucide-react';
import { MealLog } from '@/hooks/useFoodLogMutations';

interface MealLogListProps {
  mealsByDate: Record<string, MealLog[]>;
  isLoading: boolean;
  mealTypes: { value: string; label: string }[];
  onEdit: (meal: MealLog) => void;
  onDelete: (id: string) => void;
}

export function MealLogList({
  mealsByDate,
  isLoading,
  mealTypes,
  onEdit,
  onDelete,
}: MealLogListProps) {
  const { t } = useTranslation(['food', 'common']);

  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const sortedDates = Object.keys(mealsByDate).sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('food:no_meals_logged')}</h3>
        <p className="text-muted-foreground">{t('food:no_meals_logged_desc')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        {t('food:meal_history')}
      </h3>

      {sortedDates.map((dateString) => {
        const dayMeals = mealsByDate[dateString];
        const dayCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

        return (
          <div key={dateString} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">
                {formatDateForDisplay(dateString)}
              </h4>
              <span className="text-sm font-semibold text-accent">
                {dayCalories} {t('food:cal_total')}
              </span>
            </div>

            <div className="space-y-2">
              {dayMeals.map((meal) => (
                <Card key={meal.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {meal.image_url && (
                        <img
                          src={meal.image_url}
                          alt={meal.food_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-medium truncate">{meal.food_name}</h5>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">
                            {mealTypes.find(m => m.value === meal.meal_type)?.label || meal.meal_type}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="text-accent font-semibold">{meal.calories} cal</span>
                          {meal.protein_grams && (
                            <span className="text-muted-foreground">P: {meal.protein_grams}g</span>
                          )}
                          {meal.carbs_grams && (
                            <span className="text-muted-foreground">C: {meal.carbs_grams}g</span>
                          )}
                          {meal.fat_grams && (
                            <span className="text-muted-foreground">F: {meal.fat_grams}g</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(meal)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(meal.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

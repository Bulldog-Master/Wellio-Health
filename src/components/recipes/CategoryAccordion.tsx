import { useTranslation } from "react-i18next";
import { Recipe } from "./types";
import { RecipeCard } from "./RecipeCard";

interface CategoryAccordionProps {
  category: string;
  recipes: Recipe[];
  isOpen: boolean;
  onToggle: () => void;
  getCategoryDisplay: (category: string) => string;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
}

export const CategoryAccordion = ({
  category,
  recipes,
  isOpen,
  onToggle,
  getCategoryDisplay,
  onEditRecipe,
  onDeleteRecipe,
}: CategoryAccordionProps) => {
  const { t } = useTranslation('food');

  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
      >
        <span className="font-medium">{getCategoryDisplay(category)}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {recipes.length} {recipes.length === 1 ? t('recipe_count_single') : t('recipe_count_plural')}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="ml-4 space-y-2">
          {recipes.length === 0 ? (
            <div className="p-4 bg-accent/10 rounded-lg text-sm text-muted-foreground text-center">
              {t('no_recipes_category')}
            </div>
          ) : (
            recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={onEditRecipe}
                onDelete={onDeleteRecipe}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

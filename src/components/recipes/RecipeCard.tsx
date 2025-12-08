import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Recipe } from "./types";

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export const RecipeCard = ({ recipe, onEdit, onDelete }: RecipeCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('food');

  return (
    <Card 
      className="p-4 bg-accent/5 cursor-pointer hover:bg-accent/10 transition-colors"
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <div className="flex gap-4">
        {recipe.image_url && (
          <img 
            src={recipe.image_url} 
            alt={recipe.name}
            className="w-24 h-24 object-cover rounded-md"
          />
        )}
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{recipe.name}</h4>
          {recipe.description && (
            <p className="text-sm text-muted-foreground mb-2">{recipe.description}</p>
          )}
          {recipe.ingredients && (
            <details className="text-sm" onClick={(e) => e.stopPropagation()}>
              <summary className="cursor-pointer text-primary">{t('view_ingredients')}</summary>
              <pre className="mt-2 whitespace-pre-wrap">{recipe.ingredients}</pre>
            </details>
          )}
          {recipe.instructions && (
            <details className="text-sm mt-2" onClick={(e) => e.stopPropagation()}>
              <summary className="cursor-pointer text-primary">{t('view_instructions')}</summary>
              <pre className="mt-2 whitespace-pre-wrap">{recipe.instructions}</pre>
            </details>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(recipe);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(recipe.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

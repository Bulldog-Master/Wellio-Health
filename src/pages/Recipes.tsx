import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from "@/hooks/recipes";
import { RecipeFormDialog, CategoryAccordion, Recipe } from "@/components/recipes";

const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation('food');
  
  const {
    categories,
    isLoading,
    saveRecipe,
    deleteRecipe,
    addCategory,
    getRecipesByCategory,
  } = useRecipes();

  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const getCategoryDisplay = (category: string): string => {
    const isSpanish = i18n.language === 'es' || i18n.language.startsWith('es-');
    if (!isSpanish) return category;
    
    const spanishMap: Record<string, string> = {
      "🌱 Vegan": "🌱 Vegano",
      "🥑 Keto": "🥑 Keto",
      "🍖 High Protein": "🍖 Alto en Proteínas",
      "🍝 Low Carb": "🍝 Bajo en Carbohidratos",
      "💪 Muscle Building": "💪 Construcción Muscular",
      "🐟 Mediterranean": "🐟 Mediterráneo",
      "🧀 Dairy": "🧀 Lácteos",
      "💪 High Protein": "💪 Alta Proteína",
      "🌾 Gluten-Free": "🌾 Sin Gluten",
      "🥗 Low Fat": "🥗 Bajo en Grasas"
    };
    
    return spanishMap[category] || category;
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Missing category name",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    addCategory(newCategoryName);
    setNewCategoryName("");
    setCategoryDialogOpen(false);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/food')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="p-3 bg-primary/10 rounded-xl">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{t('recipes')}</h1>
          <p className="text-muted-foreground">{t('browse_recipes')}</p>
        </div>
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('new_category')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_new_category')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="categoryName">{t('category_name')}</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t('category_placeholder')}
                  className="mt-1.5"
                />
              </div>
              <Button onClick={handleAddCategory} className="w-full">
                {t('add_category')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{t('recipe_categories')}</h3>
          <RecipeFormDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingRecipe(null);
            }}
            categories={categories}
            getCategoryDisplay={getCategoryDisplay}
            editingRecipe={editingRecipe}
            onSave={saveRecipe}
          />
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <CategoryAccordion
                key={category}
                category={category}
                recipes={getRecipesByCategory(category)}
                isOpen={openCategory === category}
                onToggle={() => setOpenCategory(openCategory === category ? null : category)}
                getCategoryDisplay={getCategoryDisplay}
                onEditRecipe={handleEditRecipe}
                onDeleteRecipe={deleteRecipe}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Recipes;

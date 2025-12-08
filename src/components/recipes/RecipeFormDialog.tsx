import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Recipe, RecipeFormData } from "./types";

interface RecipeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  getCategoryDisplay: (category: string) => string;
  editingRecipe: Recipe | null;
  onSave: (formData: RecipeFormData, editingRecipe: Recipe | null) => Promise<boolean>;
}

export const RecipeFormDialog = ({
  open,
  onOpenChange,
  categories,
  getCategoryDisplay,
  editingRecipe,
  onSave,
}: RecipeFormDialogProps) => {
  const { t } = useTranslation('food');
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [recipeInstructions, setRecipeInstructions] = useState("");
  const [recipeImage, setRecipeImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingRecipe) {
      setSelectedCategory(editingRecipe.category);
      setRecipeName(editingRecipe.name);
      setRecipeDescription(editingRecipe.description || "");
      setRecipeIngredients(editingRecipe.ingredients || "");
      setRecipeInstructions(editingRecipe.instructions || "");
      setImagePreview(editingRecipe.image_url);
    }
  }, [editingRecipe]);

  const resetForm = () => {
    setSelectedCategory("");
    setRecipeName("");
    setRecipeDescription("");
    setRecipeIngredients("");
    setRecipeInstructions("");
    setRecipeImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecipeImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const success = await onSave({
      category: selectedCategory,
      name: recipeName,
      description: recipeDescription,
      ingredients: recipeIngredients,
      instructions: recipeInstructions,
      image: recipeImage,
      imagePreview,
    }, editingRecipe);

    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('add_recipe')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRecipe ? t('edit_recipe') : t('add_new_recipe')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="category">{t('category')}</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={t('select_category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryDisplay(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipeName">{t('recipe_name')}</Label>
            <Input
              id="recipeName"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder={t('recipe_name_placeholder')}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={recipeDescription}
              onChange={(e) => setRecipeDescription(e.target.value)}
              placeholder={t('recipe_description_placeholder')}
              className="mt-1.5"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="ingredients">{t('ingredients')}</Label>
            <Textarea
              id="ingredients"
              value={recipeIngredients}
              onChange={(e) => setRecipeIngredients(e.target.value)}
              placeholder={t('ingredients_placeholder')}
              className="mt-1.5"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="instructions">{t('instructions')}</Label>
            <Textarea
              id="instructions"
              value={recipeInstructions}
              onChange={(e) => setRecipeInstructions(e.target.value)}
              placeholder={t('instructions_placeholder')}
              className="mt-1.5"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="image">{t('recipe_image')}</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image')?.click()}
              className="w-full mt-1.5 gap-2"
            >
              <Upload className="w-4 h-4" />
              {t('choose_file')}
            </Button>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-md" />
            )}
          </div>

          <Button onClick={handleSave} className="w-full">
            {editingRecipe ? t('update_recipe') : t('save_recipe')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

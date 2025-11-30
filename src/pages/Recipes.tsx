import { Card } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Plus, Upload, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface Recipe {
  id: string;
  category: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  instructions: string | null;
  image_url: string | null;
}

const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('food');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [recipeInstructions, setRecipeInstructions] = useState("");
  const [recipeImage, setRecipeImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Store categories in English for database consistency
  const defaultCategories = [
    "🌱 Vegan",
    "🥑 Keto", 
    "💪 High Protein",
    "🐟 Mediterranean",
    "🧀 Dairy"
  ];

  // Map stored English categories to translated versions for display
  const translateCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "🌱 Vegan": t('category_vegan'),
      "🥑 Keto": t('category_keto'),
      "💪 High Protein": t('category_high_protein'),
      "🐟 Mediterranean": t('category_mediterranean'),
      "🧀 Dairy": t('category_dairy'),
    };
    console.log('Translating category:', category, 'to:', categoryMap[category] || category);
    console.log('Translation for category_vegan:', t('category_vegan'));
    return categoryMap[category] || category;
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecipes(data || []);
      
      // Get unique categories from recipes
      const uniqueCategories = [...new Set(data?.map(r => r.category) || [])];
      const allCategories = [...new Set([...defaultCategories, ...uniqueCategories])];
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleSaveRecipe = async () => {
    if (!recipeName.trim() || !selectedCategory) {
      toast({
        title: "Missing information",
        description: "Please provide at least a recipe name and category.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let imageUrl: string | null = null;

      // Upload image if provided
      if (recipeImage) {
        const fileName = `${user.id}/${Date.now()}-${recipeImage.name}`;
        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(fileName, recipeImage);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      if (editingRecipe) {
        // Update existing recipe
        const { error } = await supabase
          .from('recipes')
          .update({
            category: selectedCategory,
            name: recipeName,
            description: recipeDescription || null,
            ingredients: recipeIngredients || null,
            instructions: recipeInstructions || null,
            image_url: imageUrl || editingRecipe.image_url,
          })
          .eq('id', editingRecipe.id);

        if (error) throw error;

        toast({
          title: "Recipe updated",
          description: "Your recipe has been updated successfully.",
        });
      } else {
        // Create new recipe
        const { error } = await supabase
          .from('recipes')
          .insert({
            user_id: user.id,
            category: selectedCategory,
            name: recipeName,
            description: recipeDescription || null,
            ingredients: recipeIngredients || null,
            instructions: recipeInstructions || null,
            image_url: imageUrl,
          });

        if (error) throw error;

        toast({
          title: "Recipe added",
          description: `${recipeName} has been added to ${selectedCategory}.`,
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Recipe deleted",
        description: "The recipe has been removed.",
      });

      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe.",
        variant: "destructive",
      });
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setSelectedCategory(recipe.category);
    setRecipeName(recipe.name);
    setRecipeDescription(recipe.description || "");
    setRecipeIngredients(recipe.ingredients || "");
    setRecipeInstructions(recipe.instructions || "");
    setImagePreview(recipe.image_url);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRecipe(null);
    setSelectedCategory("");
    setRecipeName("");
    setRecipeDescription("");
    setRecipeIngredients("");
    setRecipeInstructions("");
    setRecipeImage(null);
    setImagePreview(null);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Missing category name",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    const newCategory = newCategoryName.trim();
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      toast({
        title: "Category added",
        description: `${newCategory} has been added to your categories.`,
      });
    }

    setNewCategoryName("");
    setCategoryDialogOpen(false);
  };

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const getRecipesByCategory = (category: string) => {
    return recipes.filter(r => r.category === category);
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
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
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
                          {translateCategory(cat)}
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

                <Button onClick={handleSaveRecipe} className="w-full">
                  {editingRecipe ? t('update_recipe') : t('save_recipe')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryRecipes = getRecipesByCategory(category);
              return (
                <div key={category} className="space-y-2">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <span className="font-medium">{translateCategory(category)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {categoryRecipes.length} {categoryRecipes.length === 1 ? t('recipe_count_single') : t('recipe_count_plural')}
                      </span>
                    </div>
                  </button>

                  {openCategory === category && (
                    <div className="ml-4 space-y-2">
                      {categoryRecipes.length === 0 ? (
                        <div className="p-4 bg-accent/10 rounded-lg text-sm text-muted-foreground text-center">
                          {t('no_recipes_category')}
                        </div>
                      ) : (
                        categoryRecipes.map((recipe) => (
                          <Card 
                            key={recipe.id} 
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
                                    handleEditRecipe(recipe);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRecipe(recipe.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Recipes;

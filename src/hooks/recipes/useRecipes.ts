import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Recipe, RecipeFormData } from "@/components/recipes/types";

const DEFAULT_CATEGORIES = [
  "🌱 Vegan",
  "🥑 Keto", 
  "💪 High Protein",
  "🐟 Mediterranean",
  "🧀 Dairy"
];

export const useRecipes = () => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      
      const uniqueCategories = [...new Set(data?.map(r => r.category) || [])];
      const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...uniqueCategories])];
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

  const saveRecipe = async (formData: RecipeFormData, editingRecipe: Recipe | null) => {
    if (!formData.name.trim() || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please provide at least a recipe name and category.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let imageUrl: string | null = null;

      if (formData.image) {
        const fileName = `${user.id}/${Date.now()}-${formData.image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(fileName, formData.image);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update({
            category: formData.category,
            name: formData.name,
            description: formData.description || null,
            ingredients: formData.ingredients || null,
            instructions: formData.instructions || null,
            image_url: imageUrl || editingRecipe.image_url,
          })
          .eq('id', editingRecipe.id);

        if (error) throw error;

        toast({
          title: "Recipe updated",
          description: "Your recipe has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('recipes')
          .insert({
            user_id: user.id,
            category: formData.category,
            name: formData.name,
            description: formData.description || null,
            ingredients: formData.ingredients || null,
            instructions: formData.instructions || null,
            image_url: imageUrl,
          });

        if (error) throw error;

        toast({
          title: "Recipe added",
          description: `${formData.name} has been added to ${formData.category}.`,
        });
      }

      await fetchRecipes();
      return true;
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteRecipe = async (id: string) => {
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

      await fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe.",
        variant: "destructive",
      });
    }
  };

  const addCategory = (categoryName: string) => {
    const newCategory = categoryName.trim();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      toast({
        title: "Category added",
        description: `${newCategory} has been added to your categories.`,
      });
      return true;
    }
    return false;
  };

  const getRecipesByCategory = (category: string) => {
    return recipes.filter(r => r.category === category);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    recipes,
    categories,
    isLoading,
    saveRecipe,
    deleteRecipe,
    addCategory,
    getRecipesByCategory,
  };
};

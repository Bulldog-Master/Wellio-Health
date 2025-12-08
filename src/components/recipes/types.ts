export interface Recipe {
  id: string;
  category: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  instructions: string | null;
  image_url: string | null;
}

export interface RecipeFormData {
  category: string;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  image: File | null;
  imagePreview: string | null;
}

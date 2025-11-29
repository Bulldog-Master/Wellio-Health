-- Create saved_meals table for reusable meal templates
CREATE TABLE public.saved_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meal_name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_grams INTEGER,
  carbs_grams INTEGER,
  fat_grams INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_meals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own saved meals"
  ON public.saved_meals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved meals"
  ON public.saved_meals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved meals"
  ON public.saved_meals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved meals"
  ON public.saved_meals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_meals_updated_at
  BEFORE UPDATE ON public.saved_meals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
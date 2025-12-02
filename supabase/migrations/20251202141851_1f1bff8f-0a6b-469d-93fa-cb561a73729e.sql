-- Drop the existing check constraint and add a new one that includes 'fast'
ALTER TABLE public.nutrition_logs DROP CONSTRAINT IF EXISTS nutrition_logs_meal_type_check;

ALTER TABLE public.nutrition_logs ADD CONSTRAINT nutrition_logs_meal_type_check 
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'fast'));
-- Drop the existing check constraint
ALTER TABLE public.ai_insights DROP CONSTRAINT IF EXISTS ai_insights_insight_type_check;

-- Add new check constraint with additional types
ALTER TABLE public.ai_insights ADD CONSTRAINT ai_insights_insight_type_check 
CHECK (insight_type IN ('recommendation', 'trend', 'alert', 'achievement', 'workout_recommendations', 'meal_suggestions', 'general'));
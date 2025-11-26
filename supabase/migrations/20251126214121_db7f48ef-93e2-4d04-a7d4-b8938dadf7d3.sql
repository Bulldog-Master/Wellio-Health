-- Add onboarding and notification preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_meal_logging BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reminder_workout BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reminder_weigh_in BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reminder_habits BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reminder_time_meal TEXT DEFAULT '12:00',
ADD COLUMN IF NOT EXISTS reminder_time_workout TEXT DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS reminder_time_weigh_in TEXT DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS fitness_level TEXT DEFAULT 'beginner';

-- Add comment
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Tracks if user has completed onboarding flow';
COMMENT ON COLUMN public.profiles.fitness_level IS 'User fitness level: beginner, intermediate, advanced';
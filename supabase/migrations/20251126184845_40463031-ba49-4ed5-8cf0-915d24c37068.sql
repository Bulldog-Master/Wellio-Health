-- Add custom goal fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN move_goal integer DEFAULT 500,
ADD COLUMN exercise_goal integer DEFAULT 30,
ADD COLUMN stand_goal integer DEFAULT 12;

COMMENT ON COLUMN public.profiles.move_goal IS 'Daily calories goal for Move ring';
COMMENT ON COLUMN public.profiles.exercise_goal IS 'Daily minutes goal for Exercise ring';
COMMENT ON COLUMN public.profiles.stand_goal IS 'Daily hours goal for Stand ring';
-- Make health metrics private by default

-- Add show_health_metrics_to_followers column with private default
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_health_metrics_to_followers BOOLEAN DEFAULT false;

-- Update existing profiles to have metrics private by default
UPDATE public.profiles 
SET show_health_metrics_to_followers = false 
WHERE show_health_metrics_to_followers IS NULL;

-- Add NOT NULL constraint after setting defaults
ALTER TABLE public.profiles 
ALTER COLUMN show_health_metrics_to_followers SET NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.show_health_metrics_to_followers IS 'When false (default), health metrics (age, weight, height) are only visible to the user. When true, followers can also see these metrics.';

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Encrypt professional applicant contact info columns
ALTER TABLE public.professional_applications
ADD COLUMN IF NOT EXISTS email_encrypted TEXT,
ADD COLUMN IF NOT EXISTS phone_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.professional_applications.email_encrypted IS 'Encrypted email address';
COMMENT ON COLUMN public.professional_applications.phone_encrypted IS 'Encrypted phone number';

-- Add privacy settings for challenge participation
ALTER TABLE public.challenge_participants
ALTER COLUMN is_public SET DEFAULT false;

-- Update existing challenge participants to be private by default
UPDATE public.challenge_participants
SET is_public = false
WHERE is_public IS NULL;

-- Add constraint to ensure is_public has a value
ALTER TABLE public.challenge_participants
ALTER COLUMN is_public SET NOT NULL;

COMMENT ON COLUMN public.challenge_participants.is_public IS 'When false (default), challenge progress is only visible to the user. When true, others can see progress on public leaderboards.';
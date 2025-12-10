-- Add 'coach' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coach';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'practitioner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'clinician';
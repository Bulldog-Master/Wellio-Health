-- Add 2FA support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN two_factor_enabled boolean DEFAULT false,
ADD COLUMN two_factor_secret text;
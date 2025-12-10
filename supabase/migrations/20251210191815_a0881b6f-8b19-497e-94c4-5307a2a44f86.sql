-- Fix cookie_consents RLS: remove anonymous session_id exposure
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view their own cookie consents" ON public.cookie_consents;
DROP POLICY IF EXISTS "Users can insert their own cookie consents" ON public.cookie_consents;
DROP POLICY IF EXISTS "Users can update their own cookie consents" ON public.cookie_consents;
DROP POLICY IF EXISTS "Anyone can insert cookie consents" ON public.cookie_consents;
DROP POLICY IF EXISTS "Anyone can view cookie consents by session" ON public.cookie_consents;
DROP POLICY IF EXISTS "Anyone can update cookie consents by session" ON public.cookie_consents;

-- Create secure policies: authenticated users only, no session_id exposure
CREATE POLICY "Authenticated users can view their own cookie consents"
ON public.cookie_consents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own cookie consents"
ON public.cookie_consents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own cookie consents"
ON public.cookie_consents
FOR UPDATE
USING (auth.uid() = user_id);
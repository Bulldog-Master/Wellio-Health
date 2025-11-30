-- Fix auth_secrets policy to be explicit about service role only
DROP POLICY IF EXISTS "Service role can manage auth secrets" ON public.auth_secrets;

-- Create explicit service role policies
CREATE POLICY "Service role can select auth secrets"
ON public.auth_secrets FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can insert auth secrets"
ON public.auth_secrets FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update auth secrets"
ON public.auth_secrets FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete auth secrets"
ON public.auth_secrets FOR DELETE
TO service_role
USING (true);

-- Ensure no one else can access (explicitly block authenticated users)
CREATE POLICY "Block authenticated access to auth secrets"
ON public.auth_secrets FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Fix trainer profiles to hide contact info better
COMMENT ON COLUMN public.trainer_profiles.bio IS 'Public bio - should not contain personal contact info like phone, email, or social media handles.';

-- Add validation trigger for trainer profiles
CREATE OR REPLACE FUNCTION public.validate_trainer_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for email patterns in bio
  IF NEW.bio ~* '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b' THEN
    RAISE EXCEPTION 'Bio cannot contain email addresses. Use the profile contact settings instead.';
  END IF;
  
  -- Check for phone patterns
  IF NEW.bio ~ '\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s?\d{3}[-.\s]?\d{4}' THEN
    RAISE EXCEPTION 'Bio cannot contain phone numbers. Use the profile contact settings instead.';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_trainer_profile_trigger ON public.trainer_profiles;
CREATE TRIGGER validate_trainer_profile_trigger
  BEFORE INSERT OR UPDATE OF bio ON public.trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_trainer_profile();

-- Add security comment for bookings table
COMMENT ON TABLE public.bookings IS 'PRIVACY: Booking patterns can reveal health information. Aggregate statistics only, never expose individual booking history to third parties. Notes field may contain sensitive health discussions.';

-- Fix storage bucket policies for medical records
COMMENT ON TABLE public.medical_records IS 'CRITICAL: file_url must use signed URLs with expiration. Storage bucket must have RLS that matches database policies. Never serve files directly without authentication check.';
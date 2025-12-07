-- Add rate limiting for cookie consent inserts to prevent abuse
-- Uses the existing rate_limit_tracking table and check_rate_limit function

-- Create a trigger to enforce rate limiting on cookie_consents
CREATE OR REPLACE FUNCTION public.validate_cookie_consent_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  session_or_user TEXT;
BEGIN
  -- Use user_id if available, otherwise use session_id
  session_or_user := COALESCE(NEW.user_id::text, NEW.session_id);
  
  -- If neither is provided, allow the insert (edge case for very early consent)
  IF session_or_user IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check rate limit: max 10 consent records per session/user per hour
  -- This allows legitimate consent changes while preventing abuse
  IF NOT public.check_rate_limit(
    COALESCE(NEW.user_id, gen_random_uuid()), -- Use user_id or generate temp UUID for session-based
    'cookie_consent_' || session_or_user,
    10,
    60
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded for cookie consent';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS enforce_cookie_consent_rate_limit ON public.cookie_consents;
CREATE TRIGGER enforce_cookie_consent_rate_limit
  BEFORE INSERT ON public.cookie_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_cookie_consent_rate_limit();
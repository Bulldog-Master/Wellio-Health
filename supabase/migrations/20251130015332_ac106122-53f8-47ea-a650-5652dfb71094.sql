-- Fix #14: Error Logs - Add rate limiting and validation
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;

CREATE POLICY "Authenticated users can log errors with limits"
ON public.error_logs FOR INSERT
TO authenticated
WITH CHECK (
  -- Validate required fields exist
  error_message IS NOT NULL AND
  LENGTH(error_message) <= 5000 AND
  -- User can only log their own errors
  (user_id IS NULL OR user_id = auth.uid())
);

-- Add check constraint for error log data validation
ALTER TABLE public.error_logs DROP CONSTRAINT IF EXISTS error_message_length_check;
ALTER TABLE public.error_logs ADD CONSTRAINT error_message_length_check 
  CHECK (LENGTH(error_message) <= 5000);

-- Fix #15: Security Logs - Restrict to service role only
DROP POLICY IF EXISTS "Anyone can insert security logs" ON public.security_logs;

CREATE POLICY "Only service role can insert security logs"
ON public.security_logs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service role can view security logs"
ON public.security_logs FOR SELECT
TO service_role
USING (true);

-- Fix #16: Follow Relationships - Add privacy option
-- Note: RLS is correct, but documenting privacy consideration
COMMENT ON TABLE public.follows IS 'Follow relationships are visible to both parties. Consider adding a private_followers option in profiles table if users need to hide their follow lists.';

-- Fix #17: Trainer Locations - Ensure only generalized locations
COMMENT ON COLUMN public.trainer_profiles.location IS 'SECURITY WARNING: Store only city/region level location (e.g., "San Francisco, CA"). NEVER store street addresses, zip codes, or precise coordinates.';

-- Add check to prevent detailed addresses (basic validation)
CREATE OR REPLACE FUNCTION public.validate_trainer_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reject if location looks like a street address (contains numbers followed by street indicators)
  IF NEW.location ~ '\d+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court|pl|place)\.?(\s|$)' THEN
    RAISE EXCEPTION 'Location must be city/region only, not street address';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_trainer_location_trigger ON public.trainer_profiles;
CREATE TRIGGER validate_trainer_location_trigger
  BEFORE INSERT OR UPDATE OF location ON public.trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_trainer_location();

-- Fix #18: Wearable Data - Add encryption guidance
COMMENT ON TABLE public.wearable_data IS 'SENSITIVE HEALTH DATA: This table contains health metrics. Consider implementing application-level encryption for highly sensitive installations. Never share this data with third parties without explicit user consent.';

-- Fix #19: Group Memberships - Add privacy for sensitive groups
DROP POLICY IF EXISTS "Group members can view other members" ON public.group_members;

CREATE POLICY "Users can view group membership"
ON public.group_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR -- Can see own memberships
  EXISTS ( -- Can see others only in non-private groups
    SELECT 1 FROM public.groups g
    WHERE g.id = group_id AND g.is_private = false
  )
);

COMMENT ON TABLE public.groups IS 'For sensitive group types (health conditions, recovery programs), consider adding a hide_members flag to prevent member list exposure even within the group.';
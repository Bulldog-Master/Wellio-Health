-- Fix function search path warning
CREATE OR REPLACE FUNCTION public.validate_trainer_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reject if location looks like a street address (contains numbers followed by street indicators)
  IF NEW.location ~ '\d+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court|pl|place)\.?(\s|$)' THEN
    RAISE EXCEPTION 'Location must be city/region only, not street address';
  END IF;
  RETURN NEW;
END;
$$;
-- Add comprehensive security comments for sensitive tables (skip non-existent tables)
COMMENT ON TABLE public.medications IS 'SENSITIVE HEALTH DATA: Contains prescription information. Never share without explicit consent. Consider encryption for highly regulated environments (HIPAA).';

COMMENT ON TABLE public.symptoms IS 'SENSITIVE HEALTH DATA: Contains health condition tracking. Protected by RLS. Never expose to third parties.';

COMMENT ON TABLE public.nutrition_logs IS 'HEALTH DATA: May reveal eating disorders or health conditions. Protect privacy and never share aggregated data without anonymization.';

-- Add trigger to prevent sensitive data in post metadata
CREATE OR REPLACE FUNCTION public.validate_post_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if metadata contains suspicious keys that might store sensitive data
  IF NEW.metadata ? 'ip_address' OR 
     NEW.metadata ? 'device_id' OR 
     NEW.metadata ? 'location' OR
     NEW.metadata ? 'coordinates' OR
     NEW.metadata ? 'lat' OR
     NEW.metadata ? 'lon' OR
     NEW.metadata ? 'tracking_id' THEN
    RAISE EXCEPTION 'Post metadata cannot contain location, IP, or tracking data';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_post_metadata_trigger ON public.posts;
CREATE TRIGGER validate_post_metadata_trigger
  BEFORE INSERT OR UPDATE OF metadata ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_post_metadata();

-- Add rate limiting comment for posts
COMMENT ON TABLE public.posts IS 'RATE LIMITING: Implement rate limits on post creation to prevent spam. Check edit_count to prevent abuse of edit feature.';

-- Enhance notification security
COMMENT ON TABLE public.notifications IS 'SECURITY: Only system triggers can create notifications. User-created notifications blocked to prevent phishing/spam.';

-- Add privacy notes for stories
COMMENT ON TABLE public.stories IS 'PRIVACY: close_friends_only stories should have aggregated view counts to prevent relationship inference.';

-- Document wearable data encryption
COMMENT ON TABLE public.wearable_data IS 'CRITICAL HEALTH DATA: Steps, heart rate, sleep hours reveal health conditions. Consider application-level encryption. RLS protects at database level but encryption adds defense in depth.';
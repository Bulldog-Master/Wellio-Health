-- Remove duplicate 2FA columns from profiles table
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS two_factor_secret,
  DROP COLUMN IF EXISTS two_factor_enabled;

-- Add last_accessed timestamp to medical records for audit trail
ALTER TABLE public.medical_records
  ADD COLUMN IF NOT EXISTS last_accessed_at timestamp with time zone;

-- Add last_accessed timestamp to medical test results
ALTER TABLE public.medical_test_results
  ADD COLUMN IF NOT EXISTS last_accessed_at timestamp with time zone;

-- Update trigger for medical records to track access
CREATE OR REPLACE FUNCTION public.update_medical_access_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_medical_records_access ON public.medical_records;
CREATE TRIGGER update_medical_records_access
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medical_access_time();

DROP TRIGGER IF EXISTS update_medical_test_access ON public.medical_test_results;
CREATE TRIGGER update_medical_test_access
  BEFORE UPDATE ON public.medical_test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medical_access_time();
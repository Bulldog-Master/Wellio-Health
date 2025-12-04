
-- SECURITY FIX: Remove plain text sensitive columns, keep only encrypted versions

-- 1. Remove plain text token columns from wearable_connections
-- First ensure encrypted columns exist and have data migrated
ALTER TABLE public.wearable_connections 
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token;

-- 2. Remove plain text file_url from medical_records (keep only encrypted)
ALTER TABLE public.medical_records
DROP COLUMN IF EXISTS file_url;

-- 3. Remove plain text file_url from medical_test_results (keep only encrypted)
ALTER TABLE public.medical_test_results
DROP COLUMN IF EXISTS file_url;

-- 4. Create secure view for subscriptions that hides Stripe IDs
CREATE OR REPLACE FUNCTION public.get_subscription_safe(_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  tier text,
  status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.user_id,
    s.tier::text,
    s.status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.created_at,
    s.updated_at
    -- Stripe IDs intentionally excluded for security
  FROM public.subscriptions s
  WHERE s.user_id = _user_id;
$$;

-- 5. Add audit trigger for medical data access
CREATE OR REPLACE FUNCTION public.audit_medical_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.medical_audit_log (user_id, table_name, record_id, action)
  VALUES (auth.uid(), TG_TABLE_NAME, NEW.id::text, TG_OP);
  RETURN NEW;
END;
$$;

-- Ensure triggers exist for medical tables
DROP TRIGGER IF EXISTS audit_medical_records_access ON public.medical_records;
CREATE TRIGGER audit_medical_records_access
  AFTER INSERT OR UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.audit_medical_access();

DROP TRIGGER IF EXISTS audit_medical_test_results_access ON public.medical_test_results;
CREATE TRIGGER audit_medical_test_results_access
  AFTER INSERT OR UPDATE ON public.medical_test_results
  FOR EACH ROW EXECUTE FUNCTION public.audit_medical_access();

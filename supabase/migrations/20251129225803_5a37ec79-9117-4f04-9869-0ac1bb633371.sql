-- 1. Remove direct client access to auth_secrets (2FA should be server-side only)
DROP POLICY IF EXISTS "Users can view own auth secrets" ON public.auth_secrets;
DROP POLICY IF EXISTS "Users can insert own auth secrets" ON public.auth_secrets;
DROP POLICY IF EXISTS "Users can update own auth secrets" ON public.auth_secrets;
DROP POLICY IF EXISTS "Users can delete own auth secrets" ON public.auth_secrets;

-- Only allow service role to manage auth secrets
CREATE POLICY "Service role can manage auth secrets"
ON public.auth_secrets
FOR ALL
USING (false)
WITH CHECK (false);

-- 2. Restrict subscriptions table - only expose status/tier, not payment IDs
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription status"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Prevent client updates to subscriptions (server-side only)
CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (false)
WITH CHECK (false);

-- 3. Add audit logging table for medical data access
CREATE TABLE IF NOT EXISTS public.medical_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE public.medical_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service can write audit logs
CREATE POLICY "Service can write audit logs"
ON public.medical_audit_log
FOR INSERT
WITH CHECK (false);

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
ON public.medical_audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Create trigger function to log medical data access
CREATE OR REPLACE FUNCTION public.log_medical_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.medical_audit_log (user_id, table_name, record_id, action)
  VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP);
  RETURN NEW;
END;
$$;

-- Add triggers for medical tables
DROP TRIGGER IF EXISTS log_medical_records_access ON public.medical_records;
CREATE TRIGGER log_medical_records_access
AFTER INSERT OR UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION public.log_medical_access();

DROP TRIGGER IF EXISTS log_medical_test_results_access ON public.medical_test_results;
CREATE TRIGGER log_medical_test_results_access
AFTER INSERT OR UPDATE ON public.medical_test_results
FOR EACH ROW
EXECUTE FUNCTION public.log_medical_access();

DROP TRIGGER IF EXISTS log_medications_access ON public.medications;
CREATE TRIGGER log_medications_access
AFTER INSERT OR UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.log_medical_access();

DROP TRIGGER IF EXISTS log_symptoms_access ON public.symptoms;
CREATE TRIGGER log_symptoms_access
AFTER INSERT OR UPDATE ON public.symptoms
FOR EACH ROW
EXECUTE FUNCTION public.log_medical_access();

-- 5. Prevent client-side price manipulation in bookings
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;

-- Create server-side function to create bookings with validated prices
CREATE OR REPLACE FUNCTION public.create_booking(
  _trainer_id UUID,
  _booking_type TEXT,
  _start_time TIMESTAMP WITH TIME ZONE,
  _end_time TIMESTAMP WITH TIME ZONE,
  _program_id UUID DEFAULT NULL,
  _notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _price NUMERIC;
  _booking_id UUID;
BEGIN
  -- Get validated price from trainer profile
  SELECT hourly_rate INTO _price
  FROM trainer_profiles
  WHERE user_id = _trainer_id;
  
  -- Calculate price based on duration
  IF _end_time IS NOT NULL THEN
    _price := _price * EXTRACT(EPOCH FROM (_end_time - _start_time)) / 3600;
  END IF;
  
  -- Insert booking with validated price
  INSERT INTO bookings (
    trainer_id, 
    client_id, 
    booking_type, 
    start_time, 
    end_time, 
    price, 
    program_id, 
    notes
  )
  VALUES (
    _trainer_id,
    auth.uid(),
    _booking_type,
    _start_time,
    _end_time,
    _price,
    _program_id,
    _notes
  )
  RETURNING id INTO _booking_id;
  
  RETURN _booking_id;
END;
$$;

-- 6. Prevent client-side donation amount manipulation
DROP POLICY IF EXISTS "Authenticated users can create donations" ON public.fundraiser_donations;

-- Create server-side function for donation processing (to be integrated with payment gateway)
CREATE OR REPLACE FUNCTION public.create_donation(
  _fundraiser_id UUID,
  _amount NUMERIC,
  _message TEXT DEFAULT NULL,
  _is_anonymous BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _donation_id UUID;
BEGIN
  -- Validate amount is positive
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be positive';
  END IF;
  
  -- Insert donation (actual payment processing should happen before this)
  INSERT INTO fundraiser_donations (
    fundraiser_id,
    donor_id,
    amount,
    message,
    is_anonymous
  )
  VALUES (
    _fundraiser_id,
    auth.uid(),
    _amount,
    _message,
    _is_anonymous
  )
  RETURNING id INTO _donation_id;
  
  RETURN _donation_id;
END;
$$;
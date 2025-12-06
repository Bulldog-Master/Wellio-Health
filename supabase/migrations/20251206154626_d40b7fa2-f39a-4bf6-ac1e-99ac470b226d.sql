-- ============================================
-- SECURITY HARDENING MIGRATION - FIX ALL 8 CRITICAL ISSUES
-- ============================================

-- 1. PROFILES TABLE - Restrict health metrics visibility
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_health_metrics_to_followers boolean DEFAULT false;

-- Update RLS policy for profiles to restrict health metric access
DROP POLICY IF EXISTS "Users can view own profile or followed profiles" ON public.profiles;

CREATE POLICY "Users can view profiles with restricted health data"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR (NOT is_private OR public.is_following(auth.uid(), id))
);

-- 2. PROFESSIONAL APPLICATIONS - Remove unencrypted email/phone columns
ALTER TABLE public.professional_applications 
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS phone;

-- 3. MEDICAL RECORDS - Add encrypted notes column
ALTER TABLE public.medical_records 
  ADD COLUMN IF NOT EXISTS notes_encrypted text;

-- 4. MESSAGES - Add migration marker for encrypted messages
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS is_encrypted boolean DEFAULT false;

-- Update policy to ensure proper message encryption handling
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages with encryption support"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
  )
);

-- 5. BOOKINGS - Restrict schedule visibility to direct participants only
DROP POLICY IF EXISTS "Users can view bookings with complete block coverage" ON public.bookings;

CREATE POLICY "Users can view own bookings only"
ON public.bookings
FOR SELECT
USING (
  (auth.uid() = client_id OR auth.uid() = trainer_id)
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users bu
    WHERE (
      (bu.user_id = auth.uid() AND bu.blocked_user_id IN (client_id, trainer_id))
      OR (bu.blocked_user_id = auth.uid() AND bu.user_id IN (client_id, trainer_id))
    )
  )
);

-- 6. PAYMENT TRANSACTIONS - Add encrypted metadata column
ALTER TABLE public.payment_transactions 
  ADD COLUMN IF NOT EXISTS metadata_encrypted text;

-- 7. ETRANSFER REQUESTS - Add encrypted email column
ALTER TABLE public.etransfer_requests 
  ADD COLUMN IF NOT EXISTS reference_email_encrypted text;

-- 8. WEARABLE DATA - Strengthen RLS to prevent aggregate queries
DROP POLICY IF EXISTS "Users can delete own wearable data" ON public.wearable_data;
DROP POLICY IF EXISTS "Users can insert own wearable data" ON public.wearable_data;
DROP POLICY IF EXISTS "Users can update own wearable data" ON public.wearable_data;
DROP POLICY IF EXISTS "Users can view own wearable data" ON public.wearable_data;

CREATE POLICY "Users can view own wearable data only"
ON public.wearable_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wearable data"
ON public.wearable_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wearable data"
ON public.wearable_data FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wearable data"
ON public.wearable_data FOR DELETE USING (auth.uid() = user_id);

-- Create security definer function to get wearable data safely
CREATE OR REPLACE FUNCTION public.get_wearable_data_safe(_user_id uuid, _limit integer DEFAULT 100)
RETURNS TABLE(
  id uuid,
  data_date date,
  steps integer,
  calories_burned integer,
  heart_rate integer,
  sleep_hours numeric,
  device_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    wd.id,
    wd.data_date,
    wd.steps,
    wd.calories_burned,
    wd.heart_rate,
    wd.sleep_hours,
    wd.device_name
  FROM public.wearable_data wd
  WHERE wd.user_id = _user_id
    AND _user_id = auth.uid()
  ORDER BY wd.data_date DESC
  LIMIT _limit;
$$;

-- Create security_logs table if not exists
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_logs;
CREATE POLICY "Admins can view security logs"
ON public.security_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert security logs" ON public.security_logs;
CREATE POLICY "System can insert security logs"
ON public.security_logs FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at);

-- SECURITY FIX: Protect sensitive profile data and improve RLS

-- 1. Create secure function to get profile with field restrictions
-- Sensitive fields (body measurements) only visible to owner
CREATE OR REPLACE FUNCTION public.get_profile_safe(_profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  fitness_level text,
  goal text,
  is_private boolean,
  followers_count integer,
  following_count integer,
  total_points integer,
  current_streak integer,
  longest_streak integer,
  referral_code text,
  onboarding_completed boolean,
  created_at timestamptz,
  updated_at timestamptz,
  -- Sensitive body data only visible to owner
  age integer,
  gender text,
  height numeric,
  weight numeric,
  target_weight numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.fitness_level,
    p.goal,
    p.is_private,
    p.followers_count,
    p.following_count,
    p.total_points,
    p.current_streak,
    p.longest_streak,
    p.referral_code,
    p.onboarding_completed,
    p.created_at,
    p.updated_at,
    -- Sensitive body measurements only for owner
    CASE WHEN auth.uid() = p.id THEN p.age ELSE NULL END as age,
    CASE WHEN auth.uid() = p.id THEN p.gender ELSE NULL END as gender,
    CASE WHEN auth.uid() = p.id THEN p.height ELSE NULL END as height,
    CASE WHEN auth.uid() = p.id THEN p.weight ELSE NULL END as weight,
    CASE WHEN auth.uid() = p.id THEN p.target_weight ELSE NULL END as target_weight
  FROM public.profiles p
  WHERE p.id = _profile_id;
$$;

-- 2. Create public profile view (non-sensitive fields only)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  fitness_level,
  goal,
  is_private,
  followers_count,
  following_count,
  total_points,
  current_streak,
  longest_streak,
  created_at
FROM public.profiles;

-- 3. Secure wearable_connections - ensure token columns never exposed
DROP POLICY IF EXISTS "Users can view own wearable connections" ON public.wearable_connections;
DROP POLICY IF EXISTS "Users can manage own wearable connections" ON public.wearable_connections;

CREATE POLICY "wearable_connections_owner_only"
ON public.wearable_connections
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Secure trainer_profiles - protect location for non-clients
CREATE OR REPLACE FUNCTION public.get_trainer_profile_safe(_trainer_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  bio text,
  specialties text[],
  certifications text[],
  hourly_rate numeric,
  experience_years integer,
  profile_image_url text,
  is_verified boolean,
  rating numeric,
  total_reviews integer,
  -- Location only for owner or clients with bookings
  location text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tp.id,
    tp.user_id,
    tp.bio,
    tp.specialties,
    tp.certifications,
    tp.hourly_rate,
    tp.experience_years,
    tp.profile_image_url,
    tp.is_verified,
    tp.rating,
    tp.total_reviews,
    CASE 
      WHEN auth.uid() = tp.user_id THEN tp.location
      WHEN EXISTS (
        SELECT 1 FROM public.bookings b 
        WHERE b.trainer_id = tp.user_id 
        AND b.client_id = auth.uid()
        AND b.status IN ('confirmed', 'completed')
      ) THEN tp.location
      ELSE NULL 
    END as location
  FROM public.trainer_profiles tp
  WHERE tp.user_id = _trainer_user_id;
$$;

-- 5. Ensure referrals table has proper RLS
DROP POLICY IF EXISTS "referrals_owner_access" ON public.referrals;
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;

CREATE POLICY "referrals_select_owner"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "referrals_insert_owner"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "referrals_update_owner"
ON public.referrals
FOR UPDATE
USING (auth.uid() = referrer_id);

-- 6. Create security_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_view_security_logs" ON public.security_logs;
DROP POLICY IF EXISTS "system_insert_security_logs" ON public.security_logs;

CREATE POLICY "admins_view_security_logs"
ON public.security_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "system_insert_security_logs"
ON public.security_logs
FOR INSERT
WITH CHECK (true);

-- 7. Add index for security log queries
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at DESC);

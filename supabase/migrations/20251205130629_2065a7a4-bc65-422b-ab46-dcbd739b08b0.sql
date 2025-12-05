-- =============================================
-- SECURITY ENHANCEMENT: Profile Visibility - Followers Only
-- =============================================

-- Drop existing profile SELECT policies
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles they follow" ON public.profiles;
DROP POLICY IF EXISTS "Users can view non-private profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- Create helper function to check if user is following another user
CREATE OR REPLACE FUNCTION public.is_following(_follower_id uuid, _following_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.follows
    WHERE follower_id = _follower_id
      AND following_id = _following_id
  )
$$;

-- New policy: Users can ONLY view their own profile OR profiles they follow
CREATE POLICY "Users can view own profile or followed profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  public.is_following(auth.uid(), id) OR
  public.has_role(auth.uid(), 'admin')
);

-- =============================================
-- SECURITY ENHANCEMENT: Medical Re-authentication Tracking
-- =============================================

-- Table to track medical access sessions (re-auth required every 15 minutes)
CREATE TABLE IF NOT EXISTS public.medical_access_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  authenticated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medical_access_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own sessions
CREATE POLICY "Users can manage own medical sessions"
ON public.medical_access_sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to check if user has valid medical access session
CREATE OR REPLACE FUNCTION public.has_valid_medical_session(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.medical_access_sessions
    WHERE user_id = _user_id
      AND expires_at > now()
  )
$$;

-- Function to create/refresh medical access session
CREATE OR REPLACE FUNCTION public.create_medical_session(_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _session_id uuid;
BEGIN
  -- Delete expired sessions for this user
  DELETE FROM public.medical_access_sessions
  WHERE user_id = _user_id AND expires_at < now();
  
  -- Create new session
  INSERT INTO public.medical_access_sessions (user_id, authenticated_at, expires_at)
  VALUES (_user_id, now(), now() + interval '15 minutes')
  RETURNING id INTO _session_id;
  
  RETURN _session_id;
END;
$$;

-- Update medical_records policies to require valid session
DROP POLICY IF EXISTS "Users can view own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can insert own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can update own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can delete own medical records" ON public.medical_records;

CREATE POLICY "Users can view own medical records with valid session"
ON public.medical_records
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id AND 
  (public.has_valid_medical_session(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can insert own medical records with valid session"
ON public.medical_records
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  (public.has_valid_medical_session(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can update own medical records with valid session"
ON public.medical_records
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND 
  (public.has_valid_medical_session(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can delete own medical records with valid session"
ON public.medical_records
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND 
  (public.has_valid_medical_session(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);

-- Same for medical_test_results
DROP POLICY IF EXISTS "Users can view own test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can insert own test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can update own test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can delete own test results" ON public.medical_test_results;

CREATE POLICY "Users can view own test results with valid session"
ON public.medical_test_results
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id AND 
  (public.has_valid_medical_session(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can insert own test results with valid session"
ON public.medical_test_results
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  (public.has_valid_medical_session(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can update own test results with valid session"
ON public.medical_test_results
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND 
  (public.has_valid_medical_session(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can delete own test results with valid session"
ON public.medical_test_results
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND 
  (public.has_valid_medical_session(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);
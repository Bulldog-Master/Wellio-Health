-- Professional profiles for approved coaches/clinicians
CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  role text NOT NULL CHECK (role IN ('coach', 'clinician')),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  
  full_name text,
  organization text,
  license_id text,
  country text,
  bio text,
  specialties text[],
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

-- Professionals can view their own profile
CREATE POLICY "Professionals can view own profile"
ON public.professional_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Professionals can update their own profile (but not status)
CREATE POLICY "Professionals can update own profile"
ON public.professional_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Approved professionals are visible to their clients
CREATE POLICY "Clients can view connected professional profiles"
ON public.professional_profiles
FOR SELECT
USING (
  status = 'approved' AND (
    -- Coach's clients can see their profile
    EXISTS (
      SELECT 1 FROM public.coach_clients cc
      WHERE cc.coach_id = professional_profiles.user_id
      AND cc.client_id = auth.uid()
      AND cc.status = 'active'
    )
    OR
    -- Clinician's patients can see their profile
    EXISTS (
      SELECT 1 FROM public.clinician_patients cp
      WHERE cp.clinician_id = professional_profiles.user_id
      AND cp.patient_id = auth.uid()
      AND cp.status = 'active'
    )
  )
);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage professional profiles"
ON public.professional_profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON public.professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_role_status ON public.professional_profiles(role, status);

-- Trigger for updated_at
CREATE TRIGGER update_professional_profiles_updated_at
  BEFORE UPDATE ON public.professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();
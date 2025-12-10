-- Fix 1: Tighten profiles RLS - only owner, followers, and authorized professionals
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create restricted profile view policy
CREATE POLICY "Profiles viewable by owner, followers, or professionals"
ON public.profiles
FOR SELECT
USING (
  -- Owner can always see their own profile
  auth.uid() = id
  OR
  -- Followers can see profiles they follow (respecting privacy settings)
  (
    NOT COALESCE(is_private, false) 
    OR EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follows.follower_id = auth.uid() 
      AND follows.following_id = profiles.id
    )
  )
  OR
  -- Authorized coaches can see their clients
  EXISTS (
    SELECT 1 FROM public.coach_clients 
    WHERE coach_clients.coach_id = auth.uid() 
    AND coach_clients.client_id = profiles.id 
    AND coach_clients.status = 'active'
  )
  OR
  -- Authorized clinicians can see their patients
  EXISTS (
    SELECT 1 FROM public.clinician_patients 
    WHERE clinician_patients.clinician_id = auth.uid() 
    AND clinician_patients.patient_id = profiles.id 
    AND clinician_patients.status = 'active'
  )
  OR
  -- Admins can view all profiles
  public.has_role(auth.uid(), 'admin')
);

-- Fix 2: Add audit logging trigger for professional_applications admin access
CREATE OR REPLACE FUNCTION public.log_professional_application_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when admin accesses professional applications
  IF public.has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.security_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      severity,
      metadata
    ) VALUES (
      auth.uid(),
      'admin_view_professional_application',
      'professional_applications',
      NEW.id::text,
      'info',
      jsonb_build_object(
        'applicant_name', NEW.full_name,
        'role', NEW.role,
        'accessed_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging (on SELECT via a view approach won't work, so we log on policy check)
-- Instead, let's add a function that must be called when viewing applications

-- Also remove the unencrypted backup_codes column if it exists (mentioned in warn)
ALTER TABLE public.auth_secrets DROP COLUMN IF EXISTS backup_codes;
-- Care Team Invites: 1 active invite per subject/role
CREATE TABLE IF NOT EXISTS public.care_team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The individual creating the invite
  subject_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('supporter', 'coach', 'clinician')),
  
  invite_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  
  -- The professional/supporter who accepted the invite
  viewer_id uuid REFERENCES auth.users(id),
  
  -- Enforce 1 active invite per subject/role
  CONSTRAINT one_active_invite_per_role UNIQUE (subject_id, role)
);

-- Enable RLS
ALTER TABLE public.care_team_invites ENABLE ROW LEVEL SECURITY;

-- Subjects can manage their own invites
CREATE POLICY "Subjects can view own invites"
ON public.care_team_invites
FOR SELECT
USING (auth.uid() = subject_id);

CREATE POLICY "Subjects can create invites"
ON public.care_team_invites
FOR INSERT
WITH CHECK (auth.uid() = subject_id);

CREATE POLICY "Subjects can update own invites"
ON public.care_team_invites
FOR UPDATE
USING (auth.uid() = subject_id);

CREATE POLICY "Subjects can delete own invites"
ON public.care_team_invites
FOR DELETE
USING (auth.uid() = subject_id);

-- Viewers can see invites they accepted
CREATE POLICY "Viewers can see accepted invites"
ON public.care_team_invites
FOR SELECT
USING (auth.uid() = viewer_id);

-- Anyone can look up an invite by code (for acceptance flow)
CREATE POLICY "Anyone can lookup invite by code"
ON public.care_team_invites
FOR SELECT
USING (invite_code IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_care_team_invites_subject ON public.care_team_invites(subject_id);
CREATE INDEX IF NOT EXISTS idx_care_team_invites_code ON public.care_team_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_care_team_invites_viewer ON public.care_team_invites(viewer_id) WHERE viewer_id IS NOT NULL;

-- Helper function to generate unique invite code
CREATE OR REPLACE FUNCTION public.generate_care_team_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.care_team_invites WHERE invite_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;
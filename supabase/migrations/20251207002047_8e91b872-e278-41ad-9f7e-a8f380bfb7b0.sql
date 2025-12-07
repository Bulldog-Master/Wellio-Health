-- Add CCPA and HIPAA compliance fields to user_privacy_preferences
ALTER TABLE public.user_privacy_preferences 
ADD COLUMN IF NOT EXISTS do_not_sell_data boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hipaa_authorization boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hipaa_authorization_date timestamptz,
ADD COLUMN IF NOT EXISTS pipeda_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pipeda_consent_date timestamptz,
ADD COLUMN IF NOT EXISTS accessibility_preferences jsonb DEFAULT '{"high_contrast": false, "reduce_motion": false, "large_text": false, "screen_reader_optimized": false}'::jsonb;

-- Create HIPAA authorization log for compliance tracking
CREATE TABLE IF NOT EXISTS public.hipaa_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  authorization_type text NOT NULL CHECK (authorization_type IN ('treatment', 'payment', 'healthcare_operations', 'research', 'marketing', 'other')),
  authorized_recipient text,
  authorized_data text[] NOT NULL,
  purpose text NOT NULL,
  expiration_date timestamptz,
  is_revoked boolean DEFAULT false,
  revoked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hipaa_authorizations ENABLE ROW LEVEL SECURITY;

-- Users can only view/manage their own authorizations
CREATE POLICY "Users can view own HIPAA authorizations"
  ON public.hipaa_authorizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own HIPAA authorizations"
  ON public.hipaa_authorizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own HIPAA authorizations"
  ON public.hipaa_authorizations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create accessibility audit log
CREATE TABLE IF NOT EXISTS public.accessibility_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  wcag_level text NOT NULL CHECK (wcag_level IN ('A', 'AA', 'AAA')),
  criteria_id text NOT NULL,
  criteria_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('pass', 'fail', 'partial', 'not_applicable')),
  notes text,
  remediation_date timestamptz,
  audited_at timestamptz DEFAULT now(),
  audited_by uuid REFERENCES auth.users(id)
);

-- Enable RLS - only admins can manage audit
ALTER TABLE public.accessibility_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage accessibility audit"
  ON public.accessibility_audit FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view accessibility audit"
  ON public.accessibility_audit FOR SELECT
  USING (true);
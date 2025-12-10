-- Data access audit log for tracking when professionals view client/patient data
CREATE TABLE public.data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  client_id UUID NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view_score', 'view_trend', 'view_details', 'export')),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE public.data_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own access logs"
ON public.data_access_log FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Clients can view access to their data"
ON public.data_access_log FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Authenticated users can insert access logs"
ON public.data_access_log FOR INSERT
WITH CHECK (auth.uid() = professional_id);

-- Professional invite codes table
CREATE TABLE public.professional_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('coach', 'clinician')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 10,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.professional_invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own codes"
ON public.professional_invite_codes FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create codes"
ON public.professional_invite_codes FOR INSERT
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update own codes"
ON public.professional_invite_codes FOR UPDATE
USING (auth.uid() = professional_id);

CREATE POLICY "Anyone can lookup active codes"
ON public.professional_invite_codes FOR SELECT
USING (is_active = true);

-- Relationship requests table
CREATE TABLE public.professional_relationship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  client_id UUID NOT NULL,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('coach', 'clinician')),
  invite_code_id UUID REFERENCES public.professional_invite_codes(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  consent_given_at TIMESTAMPTZ,
  consent_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(professional_id, client_id, professional_type)
);

ALTER TABLE public.professional_relationship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view sent requests"
ON public.professional_relationship_requests FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Clients can view received requests"
ON public.professional_relationship_requests FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can create requests"
ON public.professional_relationship_requests FOR INSERT
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Clients can update requests"
ON public.professional_relationship_requests FOR UPDATE
USING (auth.uid() = client_id);

-- Indexes
CREATE INDEX idx_invite_codes_code ON public.professional_invite_codes(code) WHERE is_active = true;
CREATE INDEX idx_relationship_requests_client ON public.professional_relationship_requests(client_id, status);
CREATE INDEX idx_data_access_log_client ON public.data_access_log(client_id, accessed_at DESC);
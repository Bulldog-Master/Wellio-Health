-- User consent tracking table
CREATE TABLE public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT, -- Stored only for legal compliance proof
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, consent_type)
);

-- User privacy preferences table
CREATE TABLE public.user_privacy_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  data_retention_days INTEGER DEFAULT 365,
  allow_analytics BOOLEAN DEFAULT true,
  allow_marketing_emails BOOLEAN DEFAULT false,
  allow_ai_processing BOOLEAN DEFAULT true,
  share_with_trainers BOOLEAN DEFAULT false,
  share_with_practitioners BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data export requests table
CREATE TABLE public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_url TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Account deletion requests table
CREATE TABLE public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  reason TEXT,
  scheduled_deletion_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- User consents policies
CREATE POLICY "Users can view own consents" ON public.user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own consents" ON public.user_consents
  FOR ALL USING (auth.uid() = user_id);

-- Privacy preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_privacy_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON public.user_privacy_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Data export policies
CREATE POLICY "Users can view own exports" ON public.data_export_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can request exports" ON public.data_export_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deletion request policies
CREATE POLICY "Users can view own deletion requests" ON public.account_deletion_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can request deletion" ON public.account_deletion_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own deletion" ON public.account_deletion_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admin policies for data export and deletion management
CREATE POLICY "Admins can manage all exports" ON public.data_export_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all deletions" ON public.account_deletion_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to initialize user privacy preferences on signup
CREATE OR REPLACE FUNCTION public.initialize_privacy_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_privacy_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create privacy preferences when profile is created
CREATE TRIGGER on_profile_created_privacy
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_privacy_preferences();

-- Update timestamp trigger for privacy preferences
CREATE TRIGGER update_privacy_preferences_timestamp
  BEFORE UPDATE ON public.user_privacy_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Age verification tracking
CREATE TABLE IF NOT EXISTS public.age_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_over_13 BOOLEAN NOT NULL DEFAULT false,
  is_over_18 BOOLEAN DEFAULT false,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cookie consent tracking
CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  essential BOOLEAN NOT NULL DEFAULT true,
  analytics BOOLEAN NOT NULL DEFAULT false,
  marketing BOOLEAN NOT NULL DEFAULT false,
  consented_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data breach notifications
CREATE TABLE IF NOT EXISTS public.data_breach_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  breach_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_data TEXT[] NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User breach acknowledgments
CREATE TABLE IF NOT EXISTS public.user_breach_acknowledgments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  breach_id UUID REFERENCES public.data_breach_notifications(id) ON DELETE CASCADE NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, breach_id)
);

-- Enable RLS
ALTER TABLE public.age_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_breach_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_breach_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own age verification" ON public.age_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own age verification" ON public.age_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own cookie consent" ON public.cookie_consents
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert cookie consent" ON public.cookie_consents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own cookie consent" ON public.cookie_consents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "All users can view breach notifications" ON public.data_breach_notifications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage breach notifications" ON public.data_breach_notifications
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own acknowledgments" ON public.user_breach_acknowledgments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can acknowledge breaches" ON public.user_breach_acknowledgments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
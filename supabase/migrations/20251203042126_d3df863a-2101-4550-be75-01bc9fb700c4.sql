-- Subscription Add-ons System
CREATE TABLE public.subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_es TEXT,
  description TEXT,
  description_es TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User's purchased add-ons
CREATE TABLE public.user_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  addon_id UUID REFERENCES public.subscription_addons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, addon_id)
);

-- Enable RLS
ALTER TABLE public.subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_addons (public read, admin write)
CREATE POLICY "Anyone can view active addons"
ON public.subscription_addons FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage addons"
ON public.subscription_addons FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_addons
CREATE POLICY "Users can view own addons"
ON public.user_addons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addons"
ON public.user_addons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addons"
ON public.user_addons FOR UPDATE
USING (auth.uid() = user_id);

-- Seed initial add-ons
INSERT INTO public.subscription_addons (addon_key, name, name_es, description, description_es, price_monthly, price_yearly, features, sort_order) VALUES
('ai_coach', 'AI Fitness Coach', 'Entrenador de Fitness IA', 'Personal AI-powered fitness coaching and guidance', 'Entrenamiento personal de fitness con IA', 9.99, 99.99, '["Personalized workout plans", "Real-time form feedback", "24/7 chat support"]', 1),
('ai_analytics', 'AI Analytics Pro', 'Análisis IA Pro', 'Advanced AI-driven insights and predictions', 'Análisis avanzados e predicciones con IA', 7.99, 79.99, '["Predictive analytics", "Performance forecasting", "Custom reports"]', 2),
('ai_nutrition', 'AI Nutrition Advisor', 'Asesor Nutricional IA', 'AI-powered meal planning and nutrition guidance', 'Planificación de comidas y guía nutricional con IA', 6.99, 69.99, '["Meal plan generation", "Macro optimization", "Recipe suggestions"]', 3),
('trainer_access', 'Trainer Marketplace', 'Mercado de Entrenadores', 'Access to book certified trainers', 'Acceso para reservar entrenadores certificados', 4.99, 49.99, '["Browse trainers", "Book sessions", "Message trainers"]', 4),
('practitioner_access', 'Health Practitioners', 'Profesionales de Salud', 'Access to health and wellness practitioners', 'Acceso a profesionales de salud y bienestar', 4.99, 49.99, '["Browse practitioners", "Book appointments", "Health consultations"]', 5),
('recovery_tracking', 'Recovery Hub Pro', 'Centro de Recuperación Pro', 'Advanced recovery tracking and analytics', 'Seguimiento avanzado de recuperación y análisis', 3.99, 39.99, '["Unlimited sessions", "Recovery analytics", "Recommendations"]', 6),
('live_sessions', 'Live Workout Sessions', 'Sesiones de Entrenamiento en Vivo', 'Host and join live workout sessions', 'Organizar y unirse a sesiones en vivo', 5.99, 59.99, '["Host unlimited sessions", "Join any session", "Recording access"]', 7);

-- Professional Applications System
CREATE TABLE public.professional_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('trainer', 'practitioner')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  specialties TEXT[],
  certifications TEXT[],
  years_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  location TEXT,
  website_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Certification documents storage
CREATE TABLE public.professional_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.professional_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('certification', 'license', 'insurance', 'id', 'other')),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Client relationships for trainers/practitioners
CREATE TABLE public.professional_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  client_id UUID NOT NULL,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('trainer', 'practitioner')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, client_id, professional_type)
);

-- Enable RLS
ALTER TABLE public.professional_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_clients ENABLE ROW LEVEL SECURITY;

-- RLS for professional_applications
CREATE POLICY "Users can view own application"
ON public.professional_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own application"
ON public.professional_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending application"
ON public.professional_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all applications"
ON public.professional_applications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.professional_applications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for professional_documents
CREATE POLICY "Users can view own documents"
ON public.professional_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents"
ON public.professional_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents"
ON public.professional_documents FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update documents"
ON public.professional_documents FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for professional_clients
CREATE POLICY "Professionals can view own clients"
ON public.professional_clients FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Clients can view own relationships"
ON public.professional_clients FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can manage own clients"
ON public.professional_clients FOR ALL
USING (auth.uid() = professional_id)
WITH CHECK (auth.uid() = professional_id);

-- Function to check if user is approved professional
CREATE OR REPLACE FUNCTION public.is_approved_professional(_user_id UUID, _type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.professional_applications
    WHERE user_id = _user_id
    AND professional_type = _type
    AND status = 'approved'
  )
$$;

-- Storage bucket for professional documents
INSERT INTO storage.buckets (id, name, public) VALUES ('professional-documents', 'professional-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'professional-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'professional-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all professional documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'professional-documents' AND public.has_role(auth.uid(), 'admin'));
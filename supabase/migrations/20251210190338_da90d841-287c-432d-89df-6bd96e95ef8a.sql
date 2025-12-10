-- Create professional_subscriptions table to track coach/clinician tiers
CREATE TABLE IF NOT EXISTS public.professional_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('coach', 'clinician')),
  tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, professional_type)
);

-- Enable RLS
ALTER TABLE public.professional_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own professional subscriptions
CREATE POLICY "Users can view own professional subscriptions"
  ON public.professional_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system (via service role) can insert/update
CREATE POLICY "Service role can manage professional subscriptions"
  ON public.professional_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to check if user has active professional tier
CREATE OR REPLACE FUNCTION public.get_professional_tier(_user_id UUID, _professional_type TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tier
  FROM public.professional_subscriptions
  WHERE user_id = _user_id
    AND professional_type = _professional_type
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > now())
  LIMIT 1;
$$;

-- Create function to check if user has any active professional subscription
CREATE OR REPLACE FUNCTION public.has_professional_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.professional_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;

-- Trigger for updated_at
CREATE TRIGGER update_professional_subscriptions_updated_at
  BEFORE UPDATE ON public.professional_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
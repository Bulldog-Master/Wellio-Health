-- Create subscription tiers enum
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create subscription features table
CREATE TABLE IF NOT EXISTS public.subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL,
  feature_key TEXT NOT NULL,
  feature_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tier, feature_key)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for subscription features (read-only for all authenticated users)
CREATE POLICY "Anyone can view subscription features"
  ON public.subscription_features FOR SELECT
  USING (true);

-- Insert default feature limits
INSERT INTO public.subscription_features (tier, feature_key, feature_value) VALUES
  ('free', 'trainer_search', 'false'),
  ('free', 'custom_challenges', 'false'),
  ('free', 'advanced_analytics', 'false'),
  ('free', 'ai_insights', 'false'),
  ('free', 'live_sessions', 'false'),
  ('free', 'max_workouts_per_month', '10'),
  ('pro', 'trainer_search', 'true'),
  ('pro', 'custom_challenges', 'true'),
  ('pro', 'advanced_analytics', 'true'),
  ('pro', 'ai_insights', 'true'),
  ('pro', 'live_sessions', 'false'),
  ('pro', 'max_workouts_per_month', 'unlimited'),
  ('enterprise', 'trainer_search', 'true'),
  ('enterprise', 'custom_challenges', 'true'),
  ('enterprise', 'advanced_analytics', 'true'),
  ('enterprise', 'ai_insights', 'true'),
  ('enterprise', 'live_sessions', 'true'),
  ('enterprise', 'max_workouts_per_month', 'unlimited')
ON CONFLICT (tier, feature_key) DO NOTHING;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Function to initialize subscription on user creation
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_subscription();
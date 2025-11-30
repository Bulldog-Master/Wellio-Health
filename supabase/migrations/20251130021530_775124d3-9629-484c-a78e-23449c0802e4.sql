-- Create rewards catalog table
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('subscription', 'feature', 'marketplace', 'badge')),
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  duration_days INTEGER, -- NULL for permanent rewards
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user reward redemptions table
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create points transactions table for history
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'expired')),
  description TEXT NOT NULL,
  related_id UUID, -- referral_id, reward_redemption_id, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Rewards policies (public read for catalog)
CREATE POLICY "Anyone can view active rewards"
  ON public.rewards FOR SELECT
  USING (is_active = true);

-- Redemption policies (users see their own)
CREATE POLICY "Users can view own redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions"
  ON public.reward_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Points transactions policies
CREATE POLICY "Users can view own transactions"
  ON public.points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON public.points_transactions FOR INSERT
  WITH CHECK (true);

-- Function to redeem reward
CREATE OR REPLACE FUNCTION public.redeem_reward(
  _reward_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _reward RECORD;
  _current_points INTEGER;
  _redemption_id UUID;
  _expires_at TIMESTAMPTZ;
BEGIN
  _user_id := auth.uid();
  
  -- Get reward details
  SELECT * INTO _reward
  FROM public.rewards
  WHERE id = _reward_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;
  
  -- Get user's current points
  SELECT referral_points INTO _current_points
  FROM public.profiles
  WHERE id = _user_id;
  
  -- Check if user has enough points
  IF _current_points < _reward.points_cost THEN
    RAISE EXCEPTION 'Insufficient points. Need % but have %', _reward.points_cost, _current_points;
  END IF;
  
  -- Calculate expiration
  IF _reward.duration_days IS NOT NULL THEN
    _expires_at := now() + (_reward.duration_days || ' days')::INTERVAL;
  END IF;
  
  -- Deduct points
  UPDATE public.profiles
  SET referral_points = referral_points - _reward.points_cost
  WHERE id = _user_id;
  
  -- Create redemption record
  INSERT INTO public.reward_redemptions (
    user_id,
    reward_id,
    points_spent,
    expires_at,
    metadata
  )
  VALUES (
    _user_id,
    _reward_id,
    _reward.points_cost,
    _expires_at,
    _reward.metadata
  )
  RETURNING id INTO _redemption_id;
  
  -- Record transaction
  INSERT INTO public.points_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    related_id
  )
  VALUES (
    _user_id,
    -_reward.points_cost,
    'spent',
    'Redeemed: ' || _reward.name,
    _redemption_id
  );
  
  -- Apply reward based on category
  IF _reward.category = 'subscription' THEN
    -- Extend subscription period
    UPDATE public.subscriptions
    SET 
      current_period_end = COALESCE(
        CASE 
          WHEN current_period_end > now() THEN current_period_end
          ELSE now()
        END + (_reward.duration_days || ' days')::INTERVAL,
        now() + (_reward.duration_days || ' days')::INTERVAL
      ),
      status = 'active',
      tier = COALESCE((_reward.metadata->>'tier')::text::subscription_tier, 'pro')
    WHERE user_id = _user_id;
  END IF;
  
  RETURN _redemption_id;
END;
$$;

-- Function to record points earned
CREATE OR REPLACE FUNCTION public.award_referral_points(
  _user_id UUID,
  _amount INTEGER,
  _description TEXT,
  _related_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add points to profile
  UPDATE public.profiles
  SET referral_points = referral_points + _amount
  WHERE id = _user_id;
  
  -- Record transaction
  INSERT INTO public.points_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    related_id
  )
  VALUES (
    _user_id,
    _amount,
    'earned',
    _description,
    _related_id
  );
END;
$$;

-- Insert default rewards catalog
INSERT INTO public.rewards (name, description, category, points_cost, duration_days, metadata) VALUES
  -- Subscription rewards
  ('1 Month Pro', 'Unlock Pro features for 1 month', 'subscription', 500, 30, '{"tier": "pro"}'::jsonb),
  ('3 Months Pro', 'Unlock Pro features for 3 months', 'subscription', 1000, 90, '{"tier": "pro"}'::jsonb),
  ('6 Months Pro', 'Unlock Pro features for 6 months', 'subscription', 2500, 180, '{"tier": "pro"}'::jsonb),
  ('1 Year Pro', 'Unlock Pro features for 1 year', 'subscription', 5000, 365, '{"tier": "pro"}'::jsonb),
  
  -- Badge rewards
  ('Verified Badge', 'Get the verified checkmark on your profile', 'badge', 100, NULL, '{"badge_type": "verified"}'::jsonb),
  ('Elite Trainer Badge', 'Show you''re a top trainer in the community', 'badge', 1000, NULL, '{"badge_type": "elite_trainer"}'::jsonb),
  ('Community Leader Badge', 'Recognize your contribution to the community', 'badge', 2000, NULL, '{"badge_type": "community_leader"}'::jsonb),
  
  -- Feature unlocks
  ('Profile Boost', 'Feature your profile for 7 days', 'feature', 200, 7, '{"feature_type": "profile_boost"}'::jsonb),
  ('Premium Templates', 'Access premium workout templates for 30 days', 'feature', 500, 30, '{"feature_type": "premium_templates"}'::jsonb),
  ('Advanced Analytics', 'Unlock advanced analytics permanently', 'feature', 1000, NULL, '{"feature_type": "advanced_analytics"}'::jsonb),
  
  -- Marketplace rewards
  ('Featured Trainer', 'Top placement in trainer search for 1 week', 'marketplace', 300, 7, '{"feature_type": "featured_trainer"}'::jsonb),
  ('Priority Listing', 'Priority placement in marketplace for 1 month', 'marketplace', 500, 30, '{"feature_type": "priority_listing"}'::jsonb),
  ('Premium Trainer Status', 'Premium trainer badge and benefits permanently', 'marketplace', 1000, NULL, '{"feature_type": "premium_trainer"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE public.rewards IS 'Catalog of rewards users can redeem with referral points';
COMMENT ON TABLE public.reward_redemptions IS 'Track user reward redemptions and active status';
COMMENT ON TABLE public.points_transactions IS 'Complete history of all points earned and spent';

-- Trigger to update rewards updated_at
CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
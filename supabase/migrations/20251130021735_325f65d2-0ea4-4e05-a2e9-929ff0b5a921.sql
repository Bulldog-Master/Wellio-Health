-- Update handle_new_user to award points
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  _referrer_id UUID;
BEGIN
  -- Get role from metadata or default to 'user'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'user'::app_role
  );

  -- Get referrer ID if exists
  _referrer_id := (NEW.raw_user_meta_data->>'referred_by')::UUID;

  -- Insert profile with referral code
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username,
    referral_code,
    referred_by
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    public.generate_referral_code(),
    _referrer_id
  );

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  -- If referred by someone, update referral and award points
  IF _referrer_id IS NOT NULL THEN
    -- Update referral status
    UPDATE public.referrals
    SET 
      referred_id = NEW.id,
      status = 'completed',
      completed_at = now(),
      reward_points = 50
    WHERE referrer_id = _referrer_id
      AND referred_email = NEW.email;
    
    -- Award points to referrer for signup
    PERFORM public.award_referral_points(
      _referrer_id,
      50,
      'New user signup: ' || COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
      NEW.id
    );
    
    -- Award welcome bonus to new user
    PERFORM public.award_referral_points(
      NEW.id,
      25,
      'Welcome bonus from referral',
      _referrer_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to award points when user completes onboarding
CREATE OR REPLACE FUNCTION public.award_onboarding_completion_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award points to referrer when referred user completes onboarding
  IF NEW.onboarding_completed = true AND OLD.onboarding_completed = false THEN
    IF NEW.referred_by IS NOT NULL THEN
      PERFORM public.award_referral_points(
        NEW.referred_by,
        100,
        'Referred user completed onboarding: ' || COALESCE(NEW.username, 'User'),
        NEW.id
      );
      
      -- Award bonus to new user
      PERFORM public.award_referral_points(
        NEW.id,
        50,
        'Onboarding completion bonus',
        NULL
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for onboarding completion
CREATE TRIGGER award_onboarding_points
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.onboarding_completed = true AND OLD.onboarding_completed = false)
  EXECUTE FUNCTION public.award_onboarding_completion_points();

-- Create function to check reward redemptions for subscription gate
CREATE OR REPLACE FUNCTION public.has_active_reward(
  _user_id UUID,
  _feature_type TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reward_redemptions rr
    JOIN public.rewards r ON r.id = rr.reward_id
    WHERE rr.user_id = _user_id
      AND rr.is_active = true
      AND (rr.expires_at IS NULL OR rr.expires_at > now())
      AND (
        r.metadata->>'feature_type' = _feature_type
        OR r.metadata->>'tier' IS NOT NULL
        OR r.metadata->>'badge_type' IS NOT NULL
      )
  );
$$;

COMMENT ON FUNCTION public.has_active_reward IS 'Check if user has an active reward for a specific feature type';
COMMENT ON FUNCTION public.award_referral_points IS 'Award points to user and record transaction';
COMMENT ON FUNCTION public.redeem_reward IS 'Redeem a reward with points and apply benefits';
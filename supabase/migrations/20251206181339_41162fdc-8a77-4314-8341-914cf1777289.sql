-- SECURITY FIX: Drop existing SELECT policy first, then recreate with proper restrictions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin can manage all subscriptions" ON public.subscriptions;

-- Users can only SELECT their subscription
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Only admin can modify subscriptions
CREATE POLICY "Admin can manage all subscriptions" 
ON public.subscriptions FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));


-- SECURITY FIX: points_transactions
DROP POLICY IF EXISTS "Users can insert their own points transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Users can view their own points transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Admin can manage points transactions" ON public.points_transactions;

CREATE POLICY "Users can view their own points transactions" 
ON public.points_transactions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage points transactions" 
ON public.points_transactions FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));


-- SECURITY FIX: trainer_profiles - prevent self-verification
DROP POLICY IF EXISTS "Trainers can update their own profile" ON public.trainer_profiles;
DROP POLICY IF EXISTS "Trainers can update their own profile except verification" ON public.trainer_profiles;

CREATE POLICY "Trainers can update their own profile except verification" 
ON public.trainer_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  (is_verified = (SELECT tp.is_verified FROM public.trainer_profiles tp WHERE tp.user_id = auth.uid()) 
   OR public.has_role(auth.uid(), 'admin'))
);


-- SECURITY FIX: fundraisers - prevent self-verification  
DROP POLICY IF EXISTS "Fundraiser owners can update their fundraisers" ON public.fundraisers;
DROP POLICY IF EXISTS "Fundraiser owners can update their fundraisers except verification" ON public.fundraisers;

CREATE POLICY "Fundraiser owners can update their fundraisers except verification" 
ON public.fundraisers FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  (verified = (SELECT f.verified FROM public.fundraisers f WHERE f.id = id) 
   OR public.has_role(auth.uid(), 'admin'))
);


-- SECURITY FIX: profiles - prevent stats manipulation via trigger
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  
  IF NEW.followers_count IS DISTINCT FROM OLD.followers_count THEN
    RAISE EXCEPTION 'Cannot directly modify followers_count';
  END IF;
  
  IF NEW.following_count IS DISTINCT FROM OLD.following_count THEN
    RAISE EXCEPTION 'Cannot directly modify following_count';
  END IF;
  
  IF NEW.total_points IS DISTINCT FROM OLD.total_points THEN
    RAISE EXCEPTION 'Cannot directly modify total_points';
  END IF;
  
  IF NEW.referral_points IS DISTINCT FROM OLD.referral_points THEN
    RAISE EXCEPTION 'Cannot directly modify referral_points';
  END IF;
  
  IF NEW.current_streak IS DISTINCT FROM OLD.current_streak THEN
    RAISE EXCEPTION 'Cannot directly modify current_streak';
  END IF;
  
  IF NEW.longest_streak IS DISTINCT FROM OLD.longest_streak THEN
    RAISE EXCEPTION 'Cannot directly modify longest_streak';
  END IF;
  
  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'Cannot modify referral_code';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_profile_update_trigger ON public.profiles;
CREATE TRIGGER validate_profile_update_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_update();

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
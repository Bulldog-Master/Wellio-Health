-- Fix #7: Anonymous Donations - Hide donor_id completely for anonymous donations
DROP POLICY IF EXISTS "Anyone can view non-anonymous donations" ON public.fundraiser_donations;
DROP POLICY IF EXISTS "Fundraiser creators can view all donations" ON public.fundraiser_donations;

CREATE POLICY "Users can view non-anonymous donations"
ON public.fundraiser_donations FOR SELECT
TO authenticated
USING (
  is_anonymous = false OR
  donor_id = auth.uid() OR -- Donors can always see their own donations
  EXISTS ( -- Fundraiser creators can see donation exists but not donor
    SELECT 1 FROM public.fundraisers
    WHERE id = fundraiser_id AND user_id = auth.uid()
  )
);

-- Create function to get anonymized donation data for fundraiser creators
CREATE OR REPLACE FUNCTION public.get_fundraiser_donations(_fundraiser_id UUID)
RETURNS TABLE (
  id UUID,
  amount NUMERIC,
  message TEXT,
  is_anonymous BOOLEAN,
  donor_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    d.id,
    d.amount,
    d.message,
    d.is_anonymous,
    CASE 
      WHEN d.is_anonymous = true AND d.donor_id != auth.uid() THEN NULL
      ELSE d.donor_id
    END as donor_id,
    d.created_at
  FROM fundraiser_donations d
  JOIN fundraisers f ON f.id = d.fundraiser_id
  WHERE d.fundraiser_id = _fundraiser_id
    AND (f.user_id = auth.uid() OR d.donor_id = auth.uid() OR d.is_anonymous = false);
$$;

-- Fix #8: Challenge Leaderboard - Fix system policy configuration
DROP POLICY IF EXISTS "System can manage leaderboard entries" ON public.challenge_leaderboard;

-- Only allow viewing leaderboard, not manual updates
CREATE POLICY "Users can view challenge leaderboard"
ON public.challenge_leaderboard FOR SELECT
TO authenticated
USING (true);

-- Prevent manual inserts/updates (should only happen via triggers/functions)
CREATE POLICY "Only system can manage leaderboard"
ON public.challenge_leaderboard FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Fix #9: Notification Spam - Restrict creation to service role only
DROP POLICY IF EXISTS "System can create notifications for users" ON public.notifications;

CREATE POLICY "Only triggers can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (false); -- Prevents direct inserts from users

-- Allow service role to insert (for triggers/functions)
CREATE POLICY "Service role can create notifications"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (true);
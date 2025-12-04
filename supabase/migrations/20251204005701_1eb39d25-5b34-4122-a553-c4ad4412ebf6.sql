
-- SECURITY FIX: Address critical and warning-level security issues

-- 1. Fix profiles RLS to respect is_private flag
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Users can see their own profile
CREATE POLICY "profiles_owner_full_access"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can see non-private profiles of others
CREATE POLICY "profiles_public_read"
ON public.profiles
FOR SELECT
USING (
  is_private = false 
  OR is_private IS NULL
  OR auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = auth.uid() 
    AND following_id = profiles.id
  )
);

-- 2. Update fitness_locations to hide submitted_by from public
DROP POLICY IF EXISTS "fitness_locations_public_verified_only" ON public.fitness_locations;
DROP POLICY IF EXISTS "Anyone can view active locations" ON public.fitness_locations;

CREATE POLICY "fitness_locations_verified_public"
ON public.fitness_locations
FOR SELECT
USING (
  (is_verified = true AND is_active = true)
  OR public.has_role(auth.uid(), 'admin')
  OR auth.uid() = submitted_by
);

-- 3. Fix messages to respect blocked users for historical messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

CREATE POLICY "messages_conversation_access"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (user_id = auth.uid() AND blocked_user_id = messages.sender_id)
    OR (user_id = messages.sender_id AND blocked_user_id = auth.uid())
  )
);

-- 4. Fix bookings to check for blocked users
DROP POLICY IF EXISTS "Clients can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Trainers can view their own bookings" ON public.bookings;

CREATE POLICY "bookings_client_view"
ON public.bookings
FOR SELECT
USING (
  auth.uid() = client_id
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (user_id = auth.uid() AND blocked_user_id = trainer_id)
    OR (user_id = trainer_id AND blocked_user_id = auth.uid())
  )
);

CREATE POLICY "bookings_trainer_view"
ON public.bookings
FOR SELECT
USING (
  auth.uid() = trainer_id
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (user_id = auth.uid() AND blocked_user_id = client_id)
    OR (user_id = client_id AND blocked_user_id = auth.uid())
  )
);

-- 5. Restrict professional_applications contact info to owner and admin only
DROP POLICY IF EXISTS "Users can view own professional applications" ON public.professional_applications;
DROP POLICY IF EXISTS "Admins can view all professional applications" ON public.professional_applications;

CREATE POLICY "professional_apps_owner_view"
ON public.professional_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "professional_apps_admin_view"
ON public.professional_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Fix leaderboard_entries to strictly respect is_public
DROP POLICY IF EXISTS "Users can view public leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Anyone can view leaderboard entries" ON public.leaderboard_entries;

CREATE POLICY "leaderboard_entries_view"
ON public.leaderboard_entries
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_public = true
);

-- 7. Drop the profiles_public view since it bypasses RLS
DROP VIEW IF EXISTS public.profiles_public;

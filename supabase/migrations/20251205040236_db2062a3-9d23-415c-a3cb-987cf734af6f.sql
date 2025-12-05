-- =====================================================
-- SECURITY FIX: Remaining tables with correct column names
-- =====================================================

-- =====================================================
-- 9. FIX RECIPES - Protect private recipe content (uses user_id, not creator_id)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view public recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view accessible recipes" ON public.recipes;

CREATE POLICY "Users can view accessible recipes"
ON public.recipes FOR SELECT
TO authenticated
USING (
  is_public = true
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.recipe_collaborations rc
    WHERE rc.recipe_id = id AND rc.collaborator_id = auth.uid()
  )
);

-- =====================================================
-- 10. FIX RECIPE_COLLABORATIONS - Respect recipe privacy
-- =====================================================

DROP POLICY IF EXISTS "Users can view collaborations" ON public.recipe_collaborations;
DROP POLICY IF EXISTS "Users can view collaborations for accessible recipes" ON public.recipe_collaborations;

CREATE POLICY "Users can view collaborations for accessible recipes"
ON public.recipe_collaborations FOR SELECT
TO authenticated
USING (
  collaborator_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id
    AND (r.is_public = true OR r.user_id = auth.uid())
  )
);

-- =====================================================
-- 11. FIX BOOKINGS - Handle blocked users properly
-- =====================================================

DROP POLICY IF EXISTS "Users can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings excluding blocked" ON public.bookings;

CREATE POLICY "Users can view their own bookings excluding blocked"
ON public.bookings FOR SELECT
TO authenticated
USING (
  (client_id = auth.uid() OR trainer_id = auth.uid())
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users bu
    WHERE (bu.user_id = auth.uid() AND bu.blocked_user_id IN (client_id, trainer_id))
    OR (bu.blocked_user_id = auth.uid() AND bu.user_id IN (client_id, trainer_id))
  )
);

-- =====================================================
-- 6. FIX GROUP_POSTS - Protect private group content
-- =====================================================

DROP POLICY IF EXISTS "Users can view group posts" ON public.group_posts;
DROP POLICY IF EXISTS "Group members can view posts" ON public.group_posts;
DROP POLICY IF EXISTS "Members can view group posts" ON public.group_posts;

CREATE POLICY "Members can view group posts"
ON public.group_posts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_id
    AND (
      g.is_private = false
      OR EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
      )
    )
  )
);

-- =====================================================
-- 7. FIX LIVE_WORKOUT_SESSIONS - Protect private sessions
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view live sessions" ON public.live_workout_sessions;
DROP POLICY IF EXISTS "Users can view sessions" ON public.live_workout_sessions;
DROP POLICY IF EXISTS "Users can view accessible sessions" ON public.live_workout_sessions;

CREATE POLICY "Users can view accessible sessions"
ON public.live_workout_sessions FOR SELECT
TO authenticated
USING (
  is_private = false OR is_private IS NULL
  OR host_id = auth.uid()
  OR public.is_session_participant(auth.uid(), id)
);

-- =====================================================
-- 8. FIX SESSION_PARTICIPANTS - Hide private session participants  
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view session participants" ON public.session_participants;
DROP POLICY IF EXISTS "Users can view participants" ON public.session_participants;
DROP POLICY IF EXISTS "Users can view participants in accessible sessions" ON public.session_participants;

CREATE POLICY "Users can view participants in accessible sessions"
ON public.session_participants FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.live_workout_sessions lws
    WHERE lws.id = session_id
    AND (lws.is_private = false OR lws.is_private IS NULL OR lws.host_id = auth.uid())
  )
);
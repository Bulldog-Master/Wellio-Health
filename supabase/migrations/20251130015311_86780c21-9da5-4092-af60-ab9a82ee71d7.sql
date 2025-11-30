-- Fix #10: Post Metadata Privacy - Add guidance on safe metadata storage
COMMENT ON COLUMN public.posts.metadata IS 'SECURITY WARNING: Do not store sensitive data like precise location, device IDs, IP addresses, or tracking data. Only store non-sensitive display metadata like formatting preferences.';

-- Fix #11: Story Views - Add privacy for close friends stories
CREATE OR REPLACE FUNCTION public.get_story_view_count(_story_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM story_views
  WHERE story_id = _story_id;
$$;

COMMENT ON TABLE public.story_views IS 'For close_friends_only stories, aggregate view counts instead of exposing individual viewer identities to prevent relationship mapping.';

-- Fix #12: Workout Session Participants - Add privacy controls
DROP POLICY IF EXISTS "Participants can view session participants" ON public.session_participants;

CREATE POLICY "Participants can view session info"
ON public.session_participants FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR -- Can see own participation
  EXISTS ( -- Can see others only in public sessions
    SELECT 1 FROM public.live_workout_sessions s
    WHERE s.id = session_id 
      AND s.is_private = false
  )
);

-- Fix #13: Recipe Collaborations - Limit visibility
DROP POLICY IF EXISTS "Users can view collaborations on accessible recipes" ON public.recipe_collaborations;

CREATE POLICY "Users can view own recipe collaborations"
ON public.recipe_collaborations FOR SELECT
TO authenticated
USING (
  collaborator_id = auth.uid() OR
  invited_by = auth.uid() OR
  recipe_id IN (
    SELECT id FROM public.recipes WHERE user_id = auth.uid()
  )
);
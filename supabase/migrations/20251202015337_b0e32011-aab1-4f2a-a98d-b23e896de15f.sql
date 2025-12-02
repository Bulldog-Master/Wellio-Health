-- Drop the buggy policy and create a corrected one
DROP POLICY IF EXISTS "Users can view non-private sessions or sessions they host/joine" ON public.live_workout_sessions;

CREATE POLICY "Users can view non-private sessions or sessions they host/join" 
ON public.live_workout_sessions 
FOR SELECT 
USING (
  is_private = false 
  OR auth.uid() = host_id 
  OR EXISTS (
    SELECT 1 FROM session_participants sp
    WHERE sp.session_id = live_workout_sessions.id 
    AND sp.user_id = auth.uid()
  )
);
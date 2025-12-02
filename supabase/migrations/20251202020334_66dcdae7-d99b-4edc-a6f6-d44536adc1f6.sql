-- Create security definer function to check session participation
CREATE OR REPLACE FUNCTION public.is_session_participant(_user_id uuid, _session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.session_participants
    WHERE user_id = _user_id
      AND session_id = _session_id
  )
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view non-private sessions or sessions they host/join" ON public.live_workout_sessions;

-- Create a fixed policy using the security definer function
CREATE POLICY "Users can view accessible sessions" 
ON public.live_workout_sessions 
FOR SELECT 
USING (
  is_private = false 
  OR auth.uid() = host_id 
  OR public.is_session_participant(auth.uid(), id)
);
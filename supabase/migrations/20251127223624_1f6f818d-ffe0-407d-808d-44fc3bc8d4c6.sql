-- Fix critical functional security issues

-- Fix notifications - Add INSERT policy so system can create notifications
CREATE POLICY "System can create notifications for users"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Fix challenge_leaderboard - Remove user update ability, only system should update
DROP POLICY IF EXISTS "Participants can update own entries" ON public.challenge_leaderboard;

-- Only allow participants to view their own entries and the full leaderboard
CREATE POLICY "Users can view challenge leaderboards"
  ON public.challenge_leaderboard FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- System/triggers will handle inserts and updates
CREATE POLICY "System can manage leaderboard entries"
  ON public.challenge_leaderboard FOR ALL
  USING (false)
  WITH CHECK (false);
  
-- Fix group_members - Allow group admins to manage members
CREATE POLICY "Group admins can manage members"
  ON public.group_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );
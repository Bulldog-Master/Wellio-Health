-- Fix #4: Private Messages - Prevent blocked users from reading messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users cannot view messages from blocked users" ON public.messages;

-- Create comprehensive policy that checks blocks in both directions
CREATE POLICY "Users can view unblocked conversation messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  -- User is in the conversation
  conversation_id IN (
    SELECT id FROM public.conversations
    WHERE participant1_id = auth.uid() OR participant2_id = auth.uid()
  )
  AND
  -- Neither user has blocked the other
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (
      (user_id = auth.uid() AND blocked_user_id = sender_id) OR
      (blocked_user_id = auth.uid() AND user_id = sender_id)
    )
  )
);

-- Fix #5: Bookings - Restrict trainer access to only their own bookings
DROP POLICY IF EXISTS "Trainers can view confirmed bookings" ON public.bookings;
DROP POLICY IF EXISTS "Trainers can view their bookings" ON public.bookings;

CREATE POLICY "Trainers can view their own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
  trainer_id = auth.uid() OR
  client_id = auth.uid()
);

-- Fix #6: Hide Stripe IDs from user queries
-- Create a view without sensitive payment fields
CREATE OR REPLACE VIEW public.user_subscription_info AS
SELECT 
  user_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
FROM public.subscriptions;

GRANT SELECT ON public.user_subscription_info TO authenticated;

COMMENT ON VIEW public.user_subscription_info IS 'Safe subscription view without Stripe IDs. Use this instead of querying subscriptions table directly for user-facing data.';
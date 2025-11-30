-- Fix duplicate leaderboard policies (remove redundant ones)
DROP POLICY IF EXISTS "Anyone can view public challenge leaderboards" ON public.challenge_leaderboard;
DROP POLICY IF EXISTS "Users can view challenge leaderboards" ON public.challenge_leaderboard;
DROP POLICY IF EXISTS "Participants can update their own leaderboard entries" ON public.challenge_leaderboard;

-- Keep only the simplified policies we created earlier
-- Users can view challenge leaderboard (already exists)
-- Only system can manage leaderboard (already exists)

-- Add comprehensive documentation
COMMENT ON TABLE public.challenge_leaderboard IS 'SECURITY: Leaderboard can only be updated by system functions/triggers. Direct user manipulation blocked to prevent cheating.';

-- Ensure progress photos have proper privacy
COMMENT ON TABLE public.progress_photos IS 'SENSITIVE DATA: Progress photos may reveal body image, health conditions. Protected by user_id RLS. Never make public without explicit consent.';

-- Add security for voice notes
COMMENT ON TABLE public.voice_notes IS 'PRIVACY: Voice recordings may contain identifiable voice patterns and personal information. Ensure proper access controls and consider encryption.';

-- Document recipe privacy
COMMENT ON TABLE public.recipes IS 'PRIVACY: Recipe ownership and collaboration should not expose user relationships to non-collaborators. Protected by RLS.';

-- Add security notes for subscriptions
COMMENT ON TABLE public.subscriptions IS 'CRITICAL: stripe_customer_id and stripe_subscription_id must NEVER be exposed to clients. Query only: tier, status, dates, cancel_at_period_end.';

-- Document proper profile querying
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: When querying profiles publicly, select ONLY: id, username, full_name, avatar_url, followers_count, following_count, total_points, current_streak, is_private. NEVER expose: age, weight, height, goal, fitness_level, gender, target_weight to non-followers.';
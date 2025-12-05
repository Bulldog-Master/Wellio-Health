-- Fix 1: Professional Applications - restrict access to owner and admins only
DROP POLICY IF EXISTS "Users can view own applications" ON public.professional_applications;
DROP POLICY IF EXISTS "Users can create applications" ON public.professional_applications;
DROP POLICY IF EXISTS "Admins can manage applications" ON public.professional_applications;

CREATE POLICY "Users can view own applications" 
ON public.professional_applications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" 
ON public.professional_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending applications" 
ON public.professional_applications FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all applications" 
ON public.professional_applications FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Conversations - add blocked user check
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations excluding blocked" 
ON public.conversations FOR SELECT 
USING (
  (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users bu
    WHERE (bu.user_id = auth.uid() AND bu.blocked_user_id IN (participant1_id, participant2_id))
       OR (bu.blocked_user_id = auth.uid() AND bu.user_id IN (participant1_id, participant2_id))
  )
);

-- Fix 3: Challenge leaderboard - respect is_public flag from participants
DROP POLICY IF EXISTS "Users can view challenge leaderboard" ON public.challenge_leaderboard;

CREATE POLICY "Users can view challenge leaderboard respecting privacy" 
ON public.challenge_leaderboard FOR SELECT 
USING (
  user_id = auth.uid() -- Own entries
  OR EXISTS (
    SELECT 1 FROM challenge_participants cp
    WHERE cp.challenge_id = challenge_leaderboard.challenge_id
      AND cp.user_id = challenge_leaderboard.user_id
      AND cp.is_public = true
  )
);

-- Fix 4: Error logs - add data retention constraint (prevent excessive context)
DROP POLICY IF EXISTS "Authenticated users can log errors with limits" ON public.error_logs;

CREATE POLICY "Authenticated users can log errors with strict limits" 
ON public.error_logs FOR INSERT 
WITH CHECK (
  error_message IS NOT NULL 
  AND length(error_message) <= 5000
  AND (user_id IS NULL OR user_id = auth.uid())
  AND (context IS NULL OR length(context::text) <= 1000)
);

-- Fix 5: Bookings - ensure complete blocking coverage with cleaner policy
DROP POLICY IF EXISTS "Users can view their own bookings excluding blocked" ON public.bookings;
DROP POLICY IF EXISTS "bookings_client_view" ON public.bookings;
DROP POLICY IF EXISTS "bookings_trainer_view" ON public.bookings;

CREATE POLICY "Users can view bookings with complete block coverage" 
ON public.bookings FOR SELECT 
USING (
  (auth.uid() = client_id OR auth.uid() = trainer_id)
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users bu
    WHERE (bu.user_id = auth.uid() AND bu.blocked_user_id IN (client_id, trainer_id))
       OR (bu.blocked_user_id = auth.uid() AND bu.user_id IN (client_id, trainer_id))
  )
);

-- Fix 6: Bookings - allow authenticated users to create bookings
CREATE POLICY "Authenticated users can create bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Fix 7: Medical records - verify strict owner-only access
DROP POLICY IF EXISTS "Users can view own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can insert own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can update own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can delete own medical records" ON public.medical_records;

CREATE POLICY "Owner only - view medical records" 
ON public.medical_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Owner only - insert medical records" 
ON public.medical_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner only - update medical records" 
ON public.medical_records FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Owner only - delete medical records" 
ON public.medical_records FOR DELETE 
USING (auth.uid() = user_id);

-- Fix 8: Medical test results - verify strict owner-only access
DROP POLICY IF EXISTS "Users can view own test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can insert own test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can update own test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can delete own test results" ON public.medical_test_results;

CREATE POLICY "Owner only - view test results" 
ON public.medical_test_results FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Owner only - insert test results" 
ON public.medical_test_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner only - update test results" 
ON public.medical_test_results FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Owner only - delete test results" 
ON public.medical_test_results FOR DELETE 
USING (auth.uid() = user_id);

-- Fix 9: Wearable connections - verify strict owner-only access
DROP POLICY IF EXISTS "Users can view own wearable connections" ON public.wearable_connections;
DROP POLICY IF EXISTS "Users can insert own wearable connections" ON public.wearable_connections;
DROP POLICY IF EXISTS "Users can update own wearable connections" ON public.wearable_connections;
DROP POLICY IF EXISTS "Users can delete own wearable connections" ON public.wearable_connections;

CREATE POLICY "Owner only - view wearable connections" 
ON public.wearable_connections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Owner only - insert wearable connections" 
ON public.wearable_connections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner only - update wearable connections" 
ON public.wearable_connections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Owner only - delete wearable connections" 
ON public.wearable_connections FOR DELETE 
USING (auth.uid() = user_id);

-- Fix 10: Profiles - ensure PII is protected (use existing get_profile_safe function)
-- The profiles table already has get_profile_safe() function that hides sensitive data
-- Add comment to document this
COMMENT ON TABLE public.profiles IS 'User profiles. Use get_profile_safe() function to access with PII protection. Direct table access should be limited.';

-- Fix 11: Trainer profiles - document use of safe function
COMMENT ON TABLE public.trainer_profiles IS 'Trainer profiles. Use get_trainer_profile_safe() function to access with location privacy.';

-- Fix 12: News items - document use of safe function  
COMMENT ON TABLE public.news_items IS 'News items. Use get_news_items_safe() function to hide creator identity from non-admins.';

-- Fix 13: Fitness locations - document use of safe function
COMMENT ON TABLE public.fitness_locations IS 'Fitness locations. Use get_fitness_locations_safe() function to hide submitter identity from non-admins.';
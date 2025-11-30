-- Final security lockdown - ensure no public access remains

-- Drop ALL existing policies on profiles and recreate from scratch
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Profiles: Only authenticated users can view their own or followed profiles
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can view followed profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() AND following_id = profiles.id
  )
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "New users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure wearable_data is properly restricted
DROP POLICY IF EXISTS "Users can view own wearable data" ON wearable_data;
DROP POLICY IF EXISTS "Users can insert own wearable data" ON wearable_data;
DROP POLICY IF EXISTS "Users can update own wearable data" ON wearable_data;
DROP POLICY IF EXISTS "Users can delete own wearable data" ON wearable_data;

CREATE POLICY "Users can manage own wearable data"
ON wearable_data FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Lock down trainer_profiles to ONLY show when there's an actual relationship
DROP POLICY IF EXISTS "Users can view trainers they interact with" ON trainer_profiles;
DROP POLICY IF EXISTS "Trainers can view own profile" ON trainer_profiles;

CREATE POLICY "Trainers can manage own profile"
ON trainer_profiles FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view trainers with active bookings"
ON trainer_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE trainer_id = trainer_profiles.user_id 
    AND client_id = auth.uid()
    AND status IN ('confirmed', 'completed')
  )
);

-- Ensure signed URLs are enforced for medical files (comment for developers)
COMMENT ON COLUMN medical_records.file_url IS 'SECURITY: Must use signed URLs with expiration. Never store plain URLs.';
COMMENT ON COLUMN medical_test_results.file_url IS 'SECURITY: Must use signed URLs with expiration. Never store plain URLs.';

-- Add privacy flag for challenge participation
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

CREATE POLICY "Users can view challenge participants if public or self"
ON challenge_participants FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  (is_public = true AND EXISTS (
    SELECT 1 FROM custom_challenges
    WHERE id = challenge_participants.challenge_id AND is_public = true
  ))
);

-- Add privacy setting for leaderboard
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

DROP POLICY IF EXISTS "Authenticated users can view leaderboard" ON leaderboard_entries;

CREATE POLICY "Users can view public leaderboard entries or own"
ON leaderboard_entries FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_public = true);
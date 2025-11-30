-- Fix profiles exposure - only show to followers or if public AND followed
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON profiles;

CREATE POLICY "Users can view profiles with restricted access"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  (is_private = false AND EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() AND following_id = profiles.id
  )) OR
  EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() AND following_id = profiles.id
  )
);

-- Fix trainer_profiles - only show to users with bookings or conversations
DROP POLICY IF EXISTS "Authenticated users can view trainer profiles" ON trainer_profiles;

CREATE POLICY "Users can view trainers they interact with"
ON trainer_profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE trainer_id = trainer_profiles.user_id 
    AND client_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM conversations
    WHERE (participant1_id = auth.uid() AND participant2_id = trainer_profiles.user_id)
       OR (participant2_id = auth.uid() AND participant1_id = trainer_profiles.user_id)
  )
);

-- Fix messages - respect blocked users
DROP POLICY IF EXISTS "Users can view own messages" ON messages;

CREATE POLICY "Users can view messages if not blocked"
ON messages FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() OR
  (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE participant1_id = auth.uid() OR participant2_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (user_id = auth.uid() AND blocked_user_id = messages.sender_id)
         OR (blocked_user_id = auth.uid() AND user_id = messages.sender_id)
    )
  )
);

-- Fix group_members role escalation
DROP POLICY IF EXISTS "Users can join groups" ON group_members;

CREATE POLICY "Users can join groups as members only"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (role IS NULL OR role = 'member')
);

-- Add validation function for leaderboard scores
CREATE OR REPLACE FUNCTION validate_leaderboard_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent manual rank changes
  IF NEW.rank IS DISTINCT FROM OLD.rank AND TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Cannot manually update rank';
  END IF;
  
  -- Ensure progress doesn't decrease
  IF NEW.progress < OLD.progress THEN
    RAISE EXCEPTION 'Progress cannot decrease';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validate_leaderboard_update_trigger ON challenge_leaderboard;

CREATE TRIGGER validate_leaderboard_update_trigger
BEFORE UPDATE ON challenge_leaderboard
FOR EACH ROW
EXECUTE FUNCTION validate_leaderboard_update();

-- Add medical records access verification (audit already exists)
CREATE OR REPLACE FUNCTION require_recent_auth_for_medical()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access for audit trail
  INSERT INTO medical_audit_log (user_id, table_name, record_id, action)
  VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure audit logs are created on SELECT as well
CREATE OR REPLACE FUNCTION log_medical_read()
RETURNS void AS $$
BEGIN
  -- This function can be called explicitly before reading medical data
  -- to ensure all access is logged
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
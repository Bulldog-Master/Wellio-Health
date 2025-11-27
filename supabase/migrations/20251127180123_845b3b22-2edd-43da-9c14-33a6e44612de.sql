-- Add backup codes support to auth_secrets
ALTER TABLE auth_secrets 
ADD COLUMN IF NOT EXISTS backup_codes jsonb DEFAULT '[]'::jsonb;

-- Create trusted devices table for "Remember this device" functionality
CREATE TABLE IF NOT EXISTS trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_fingerprint text NOT NULL,
  device_name text,
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)
);

ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- RLS policies for trusted_devices
CREATE POLICY "Users can view own trusted devices"
ON trusted_devices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trusted devices"
ON trusted_devices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trusted devices"
ON trusted_devices FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own trusted devices"
ON trusted_devices FOR UPDATE
USING (auth.uid() = user_id);
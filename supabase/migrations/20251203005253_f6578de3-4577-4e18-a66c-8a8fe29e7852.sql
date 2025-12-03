-- Create wearable_connections table for storing OAuth tokens
CREATE TABLE IF NOT EXISTS public.wearable_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;

-- Users can only view their own connections
CREATE POLICY "Users can view their own wearable connections"
  ON public.wearable_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own connections
CREATE POLICY "Users can insert their own wearable connections"
  ON public.wearable_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update their own wearable connections"
  ON public.wearable_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own wearable connections"
  ON public.wearable_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add unique constraint on wearable_data for upsert
CREATE UNIQUE INDEX IF NOT EXISTS wearable_data_user_device_date_idx 
  ON public.wearable_data (user_id, device_name, data_date);
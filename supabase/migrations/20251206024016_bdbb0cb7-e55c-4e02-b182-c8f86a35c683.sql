-- E2E Encryption Key Exchange Infrastructure
-- User encryption keys for E2E messaging

-- Create table for user encryption keys
CREATE TABLE IF NOT EXISTS public.user_encryption_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  public_key_created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  key_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read anyone's public key (needed for encryption)
CREATE POLICY "Users can read all public keys" 
ON public.user_encryption_keys 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Policy: Users can only insert/update their own key
CREATE POLICY "Users can manage their own key" 
ON public.user_encryption_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own key" 
ON public.user_encryption_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to get public key for a user (safe accessor)
CREATE OR REPLACE FUNCTION public.get_user_public_key(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public_key 
  FROM public.user_encryption_keys 
  WHERE user_id = _user_id;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_user_encryption_keys_updated_at
BEFORE UPDATE ON public.user_encryption_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
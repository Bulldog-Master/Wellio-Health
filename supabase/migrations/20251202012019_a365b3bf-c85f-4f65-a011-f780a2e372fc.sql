-- Create a VIP passes table for tracking expiration and metadata
CREATE TABLE public.vip_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  expires_at timestamp with time zone, -- NULL means permanent
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.vip_passes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage VIP passes
CREATE POLICY "Admins can manage VIP passes"
ON public.vip_passes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view their own VIP status
CREATE POLICY "Users can view own VIP pass"
ON public.vip_passes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
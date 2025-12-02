-- Create function to check if user has active VIP status
CREATE OR REPLACE FUNCTION public.has_active_vip(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vip_passes
    WHERE user_id = _user_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin', 'vip')
  )
$$;

-- Create function to grant VIP pass (admin only)
CREATE OR REPLACE FUNCTION public.grant_vip_pass(
  _user_id uuid,
  _reason text DEFAULT NULL,
  _expires_at timestamp with time zone DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pass_id uuid;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can grant VIP passes';
  END IF;

  -- Insert or update VIP pass
  INSERT INTO public.vip_passes (user_id, granted_by, reason, expires_at)
  VALUES (_user_id, auth.uid(), _reason, _expires_at)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    granted_by = auth.uid(),
    reason = COALESCE(_reason, vip_passes.reason),
    expires_at = _expires_at,
    is_active = true,
    updated_at = now()
  RETURNING id INTO _pass_id;

  RETURN _pass_id;
END;
$$;

-- Create function to revoke VIP pass
CREATE OR REPLACE FUNCTION public.revoke_vip_pass(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can revoke VIP passes';
  END IF;

  UPDATE public.vip_passes
  SET is_active = false, updated_at = now()
  WHERE user_id = _user_id;

  RETURN FOUND;
END;
$$;
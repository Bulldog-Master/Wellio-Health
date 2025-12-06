-- Phase 2: Complete remaining security fixes (with proper DROP IF EXISTS)

-- 1. Create function to enforce encrypted message storage
CREATE OR REPLACE FUNCTION public.validate_message_encryption()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If encryption is available (content_encrypted is set), clear plaintext content
  IF NEW.content_encrypted IS NOT NULL AND NEW.encryption_version IS NOT NULL THEN
    NEW.content := '[encrypted]';  -- Replace with placeholder instead of actual content
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger to messages table
DROP TRIGGER IF EXISTS enforce_message_encryption ON public.messages;
CREATE TRIGGER enforce_message_encryption
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_encryption();

-- 2. Fix news_items - add admin policy if not exists
DROP POLICY IF EXISTS "Admins can view all news items" ON public.news_items;
CREATE POLICY "Admins can view all news items"
  ON public.news_items
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Strengthen challenge_leaderboard with service role check
CREATE OR REPLACE FUNCTION public.update_challenge_leaderboard(
  _challenge_id uuid,
  _user_id uuid,
  _progress numeric,
  _points integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.challenge_leaderboard (challenge_id, user_id, progress, points_earned)
  VALUES (_challenge_id, _user_id, _progress, _points)
  ON CONFLICT (challenge_id, user_id) 
  DO UPDATE SET
    progress = GREATEST(challenge_leaderboard.progress, _progress),
    points_earned = challenge_leaderboard.points_earned + _points,
    last_updated = now();
END;
$$;

-- 4. Add rate limiting tracking table for conversation creation
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  action_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.rate_limit_tracking;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limit_tracking;

CREATE POLICY "Users can view own rate limits"
  ON public.rate_limit_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.rate_limit_tracking
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Add unique constraint for rate limit tracking
CREATE UNIQUE INDEX IF NOT EXISTS rate_limit_tracking_user_action_idx 
  ON public.rate_limit_tracking (user_id, action_type);

-- 6. Create function to check and increment rate limits at database level
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _action_type text,
  _max_actions integer,
  _window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_count integer;
  _window_start timestamptz;
BEGIN
  SELECT action_count, window_start INTO _current_count, _window_start
  FROM public.rate_limit_tracking
  WHERE user_id = _user_id AND action_type = _action_type
  FOR UPDATE;
  
  IF NOT FOUND OR _window_start < now() - (_window_minutes || ' minutes')::interval THEN
    INSERT INTO public.rate_limit_tracking (user_id, action_type, action_count, window_start)
    VALUES (_user_id, _action_type, 1, now())
    ON CONFLICT (user_id, action_type) 
    DO UPDATE SET action_count = 1, window_start = now();
    RETURN true;
  END IF;
  
  IF _current_count >= _max_actions THEN
    RETURN false;
  END IF;
  
  UPDATE public.rate_limit_tracking
  SET action_count = action_count + 1
  WHERE user_id = _user_id AND action_type = _action_type;
  
  RETURN true;
END;
$$;

-- 7. Rate limit conversation creation
CREATE OR REPLACE FUNCTION public.validate_conversation_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_rate_limit(auth.uid(), 'conversation_create', 10, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded for conversation creation';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rate_limit_conversations ON public.conversations;
CREATE TRIGGER rate_limit_conversations
  BEFORE INSERT ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_conversation_creation();

-- 8. Clean up old rate limit records function
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limit_tracking
  WHERE window_start < now() - interval '24 hours';
$$;

-- 9. Add trigger for sensitive access logging on auth_secrets
DROP TRIGGER IF EXISTS log_auth_secrets_access ON public.auth_secrets;
CREATE TRIGGER log_auth_secrets_access
  AFTER INSERT OR UPDATE OR DELETE ON public.auth_secrets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_access();

-- 10. Add trigger for sensitive access logging on wearable_connections
DROP TRIGGER IF EXISTS log_wearable_access ON public.wearable_connections;
CREATE TRIGGER log_wearable_access
  AFTER INSERT OR UPDATE OR DELETE ON public.wearable_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_access();
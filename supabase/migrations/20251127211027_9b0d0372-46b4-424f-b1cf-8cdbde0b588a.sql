-- Create notification for mentions
CREATE OR REPLACE FUNCTION public.create_mention_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Don't create notification if user mentions themselves
  IF NEW.mentioned_by_user_id = NEW.mentioned_user_id THEN
    RETURN NEW;
  END IF;

  -- Create notification for mention
  INSERT INTO public.notifications (user_id, actor_id, type, post_id, comment_id)
  VALUES (
    NEW.mentioned_user_id,
    NEW.mentioned_by_user_id,
    'mention',
    NEW.post_id,
    NEW.comment_id
  );

  RETURN NEW;
END;
$$;

-- Create trigger for mention notifications
DROP TRIGGER IF EXISTS create_mention_notification_trigger ON public.mentions;
CREATE TRIGGER create_mention_notification_trigger
AFTER INSERT ON public.mentions
FOR EACH ROW
EXECUTE FUNCTION public.create_mention_notification();

-- Create notification for follow requests
CREATE OR REPLACE FUNCTION public.create_follow_request_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create notification for pending requests
  IF NEW.status = 'pending' THEN
    INSERT INTO public.notifications (user_id, actor_id, type)
    VALUES (NEW.requested_id, NEW.requester_id, 'follow_request');
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for follow request notifications
DROP TRIGGER IF EXISTS create_follow_request_notification_trigger ON public.follow_requests;
CREATE TRIGGER create_follow_request_notification_trigger
AFTER INSERT ON public.follow_requests
FOR EACH ROW
EXECUTE FUNCTION public.create_follow_request_notification();
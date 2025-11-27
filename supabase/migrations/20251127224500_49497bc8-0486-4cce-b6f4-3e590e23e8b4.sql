-- Enable realtime for tables (skip already added ones)
DO $$ 
BEGIN
  -- Try to add posts
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Table already added
  END;
  
  -- Try to add post_likes
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Try to add comments
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Try to add notifications
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Try to add session_participants
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Try to add session_messages
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Enable REPLICA IDENTITY FULL for complete row data during updates
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
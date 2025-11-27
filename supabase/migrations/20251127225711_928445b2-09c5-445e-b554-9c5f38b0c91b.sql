-- Enable realtime for reactions table (try to add, ignore if already exists)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_post_reactions_count_trigger ON public.reactions;

-- Drop function if exists
DROP FUNCTION IF EXISTS public.update_post_reactions_count();

-- Create function to update post likes count based on reactions
CREATE OR REPLACE FUNCTION public.update_post_reactions_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only increment for 'like' reactions
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.posts
      SET likes_count = likes_count + 1
      WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Only decrement for 'like' reactions
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.posts
      SET likes_count = likes_count - 1
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger
CREATE TRIGGER update_post_reactions_count_trigger
AFTER INSERT OR DELETE ON public.reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_post_reactions_count();
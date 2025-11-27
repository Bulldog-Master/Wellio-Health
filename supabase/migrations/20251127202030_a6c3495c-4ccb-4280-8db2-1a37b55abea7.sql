-- Create hashtags table
CREATE TABLE public.post_hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster hashtag searches
CREATE INDEX idx_post_hashtags_hashtag ON public.post_hashtags(hashtag);
CREATE INDEX idx_post_hashtags_post_id ON public.post_hashtags(post_id);

-- Enable RLS
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view hashtags"
  ON public.post_hashtags FOR SELECT
  USING (true);

CREATE POLICY "Users can insert hashtags for own posts"
  ON public.post_hashtags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_id AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete hashtags from own posts"
  ON public.post_hashtags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_id AND posts.user_id = auth.uid()
    )
  );

-- Function to extract and store hashtags
CREATE OR REPLACE FUNCTION public.extract_hashtags_from_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hashtag_match TEXT;
BEGIN
  -- Delete existing hashtags for this post
  DELETE FROM public.post_hashtags WHERE post_id = NEW.id;

  -- Extract hashtags (words starting with #)
  FOR hashtag_match IN
    SELECT DISTINCT lower(regexp_replace(match[1], '^#', ''))
    FROM regexp_matches(NEW.content, '#(\w+)', 'g') AS match
  LOOP
    INSERT INTO public.post_hashtags (post_id, hashtag)
    VALUES (NEW.id, hashtag_match)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger to automatically extract hashtags
CREATE TRIGGER extract_hashtags_on_post
  AFTER INSERT OR UPDATE OF content ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.extract_hashtags_from_post();
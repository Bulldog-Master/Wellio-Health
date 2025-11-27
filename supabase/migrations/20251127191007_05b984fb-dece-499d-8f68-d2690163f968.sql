-- Create creator_subscriptions table for following creators
CREATE TABLE public.creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, creator_id)
);

-- Enable RLS
ALTER TABLE public.creator_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all subscriptions"
  ON public.creator_subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own subscriptions"
  ON public.creator_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.creator_subscriptions FOR DELETE
  USING (auth.uid() = subscriber_id);

-- Create creator_content table for published content
CREATE TABLE public.creator_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('workout', 'recipe', 'meal_plan', 'article')),
  title TEXT NOT NULL,
  description TEXT,
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  price DECIMAL,
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published content"
  ON public.creator_content FOR SELECT
  USING (is_published = true OR auth.uid() = creator_id);

CREATE POLICY "Creators can manage own content"
  ON public.creator_content FOR ALL
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Create content_likes table
CREATE TABLE public.content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID REFERENCES public.creator_content(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view likes"
  ON public.content_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON public.content_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.content_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update likes count
CREATE OR REPLACE FUNCTION public.update_content_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.creator_content
    SET likes_count = likes_count + 1
    WHERE id = NEW.content_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.creator_content
    SET likes_count = likes_count - 1
    WHERE id = OLD.content_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for likes count
CREATE TRIGGER update_content_likes_count_trigger
AFTER INSERT OR DELETE ON public.content_likes
FOR EACH ROW EXECUTE FUNCTION public.update_content_likes_count();

-- Trigger for updated_at
CREATE TRIGGER update_creator_content_updated_at
BEFORE UPDATE ON public.creator_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
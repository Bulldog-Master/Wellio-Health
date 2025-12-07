-- Create micro_challenges table for viral challenge system
CREATE TABLE public.micro_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('quick_burst', 'daily_dare', 'friend_face_off', 'community_wave')),
  target_value INTEGER NOT NULL DEFAULT 1,
  target_unit TEXT NOT NULL DEFAULT 'reps',
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  points_reward INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  share_code TEXT UNIQUE,
  total_completions INTEGER DEFAULT 0,
  viral_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create micro_challenge_completions table
CREATE TABLE public.micro_challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.micro_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_taken_seconds INTEGER,
  shared_to_feed BOOLEAN DEFAULT false,
  referred_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.micro_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_challenge_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for micro_challenges
CREATE POLICY "Anyone can view active micro challenges" ON public.micro_challenges
  FOR SELECT USING (is_active = true OR creator_id = auth.uid());

CREATE POLICY "Authenticated users can create micro challenges" ON public.micro_challenges
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their challenges" ON public.micro_challenges
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their challenges" ON public.micro_challenges
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS policies for completions
CREATE POLICY "Users can view all completions" ON public.micro_challenge_completions
  FOR SELECT USING (true);

CREATE POLICY "Users can record their completions" ON public.micro_challenge_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update completion count
CREATE OR REPLACE FUNCTION public.update_micro_challenge_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.micro_challenges
  SET 
    total_completions = total_completions + 1,
    viral_score = viral_score + CASE WHEN NEW.shared_to_feed THEN 5 ELSE 1 END,
    updated_at = now()
  WHERE id = NEW.challenge_id;
  RETURN NEW;
END;
$$;

-- Trigger for completion stats
CREATE TRIGGER update_micro_challenge_stats_trigger
AFTER INSERT ON public.micro_challenge_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_micro_challenge_stats();

-- Add unique constraint
CREATE UNIQUE INDEX idx_micro_challenge_user_completion 
ON public.micro_challenge_completions(challenge_id, user_id);

-- Generate share codes
CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.micro_challenges WHERE share_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;
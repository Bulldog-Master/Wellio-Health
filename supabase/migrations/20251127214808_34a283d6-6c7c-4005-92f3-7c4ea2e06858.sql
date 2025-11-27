-- Create custom_challenges table
CREATE TABLE public.custom_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('weight_loss', 'distance', 'workout_count', 'streak', 'custom')),
  target_value NUMERIC NOT NULL,
  target_unit TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  points_reward INTEGER DEFAULT 100,
  badge_image_url TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'extreme')),
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_milestones table
CREATE TABLE public.challenge_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.custom_challenges(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  points_reward INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.custom_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_progress NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Create milestone_achievements table
CREATE TABLE public.milestone_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.challenge_participants(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.challenge_milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_id, milestone_id)
);

-- Create challenge_leaderboard table (materialized view alternative)
CREATE TABLE public.challenge_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.custom_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress NUMERIC DEFAULT 0,
  rank INTEGER,
  points_earned INTEGER DEFAULT 0,
  milestones_completed INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.custom_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_challenges
CREATE POLICY "Users can view public challenges or challenges they created/joined"
ON public.custom_challenges FOR SELECT
USING (
  is_public = true 
  OR auth.uid() = creator_id
  OR EXISTS (
    SELECT 1 FROM public.challenge_participants 
    WHERE challenge_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own challenges"
ON public.custom_challenges FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own challenges"
ON public.custom_challenges FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own challenges"
ON public.custom_challenges FOR DELETE
USING (auth.uid() = creator_id);

-- RLS Policies for challenge_milestones
CREATE POLICY "Users can view milestones for accessible challenges"
ON public.challenge_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.custom_challenges 
    WHERE id = challenge_id 
    AND (is_public = true OR creator_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.challenge_participants 
      WHERE challenge_id = custom_challenges.id AND user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Challenge creators can manage milestones"
ON public.challenge_milestones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.custom_challenges 
    WHERE id = challenge_id AND creator_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.custom_challenges 
    WHERE id = challenge_id AND creator_id = auth.uid()
  )
);

-- RLS Policies for challenge_participants
CREATE POLICY "Users can view participants of accessible challenges"
ON public.challenge_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.custom_challenges 
    WHERE id = challenge_id 
    AND (is_public = true OR creator_id = auth.uid() OR user_id = auth.uid())
  )
);

CREATE POLICY "Users can join challenges"
ON public.challenge_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON public.challenge_participants FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for milestone_achievements
CREATE POLICY "Users can view achievements for accessible challenges"
ON public.milestone_achievements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participants cp
    JOIN public.custom_challenges cc ON cp.challenge_id = cc.id
    WHERE cp.id = participant_id 
    AND (cc.is_public = true OR cc.creator_id = auth.uid() OR cp.user_id = auth.uid())
  )
);

CREATE POLICY "Users can create their own achievements"
ON public.milestone_achievements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.challenge_participants 
    WHERE id = participant_id AND user_id = auth.uid()
  )
);

-- RLS Policies for challenge_leaderboard
CREATE POLICY "Anyone can view public challenge leaderboards"
ON public.challenge_leaderboard FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.custom_challenges 
    WHERE id = challenge_id AND is_public = true
  )
);

CREATE POLICY "Participants can update their own leaderboard entries"
ON public.challenge_leaderboard FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_challenges_updated_at
BEFORE UPDATE ON public.custom_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_leaderboard;
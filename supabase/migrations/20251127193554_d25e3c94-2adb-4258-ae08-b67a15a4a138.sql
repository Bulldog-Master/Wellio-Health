-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'milestone')),
  category TEXT NOT NULL CHECK (category IN ('steps', 'workout', 'nutrition', 'hydration', 'sleep', 'meditation')),
  target_value INTEGER NOT NULL,
  target_unit TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 10,
  badge_reward TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT
  USING (is_active = true);

-- Create challenge_completions table
CREATE TABLE public.challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress_value INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own completions"
  ON public.challenge_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON public.challenge_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_code TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_code)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all badges"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create leaderboard table
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('daily_steps', 'weekly_workouts', 'monthly_challenges', 'total_points', 'streak')),
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, leaderboard_type, period_start)
);

-- Enable RLS
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own entries"
  ON public.leaderboard_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add gamification fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Function to award points and update streak
CREATE OR REPLACE FUNCTION public.award_points_and_streak(
  _user_id UUID,
  _points INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _last_activity DATE;
  _current_streak INTEGER;
BEGIN
  -- Get current profile data
  SELECT last_activity_date, current_streak
  INTO _last_activity, _current_streak
  FROM public.profiles
  WHERE id = _user_id;

  -- Update points
  UPDATE public.profiles
  SET total_points = total_points + _points
  WHERE id = _user_id;

  -- Update streak
  IF _last_activity IS NULL OR _last_activity < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Reset streak if more than 1 day gap
    IF _last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Consecutive day, increment streak
      UPDATE public.profiles
      SET 
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE
      WHERE id = _user_id;
    ELSE
      -- Streak broken, reset to 1
      UPDATE public.profiles
      SET 
        current_streak = 1,
        last_activity_date = CURRENT_DATE
      WHERE id = _user_id;
    END IF;
  END IF;
END;
$$;

-- Trigger for challenge completions to award points
CREATE OR REPLACE FUNCTION public.award_challenge_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _points INTEGER;
BEGIN
  -- Get points from challenge
  SELECT points_reward INTO _points
  FROM public.challenges
  WHERE id = NEW.challenge_id;

  -- Award points and update streak
  PERFORM public.award_points_and_streak(NEW.user_id, _points);

  RETURN NEW;
END;
$$;

CREATE TRIGGER award_challenge_points_trigger
AFTER INSERT ON public.challenge_completions
FOR EACH ROW EXECUTE FUNCTION public.award_challenge_points();

-- Trigger for updated_at
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
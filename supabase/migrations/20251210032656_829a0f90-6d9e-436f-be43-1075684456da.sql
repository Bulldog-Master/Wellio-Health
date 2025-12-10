-- ========================================
-- COACH DASHBOARD TABLES
-- ========================================

-- Coach-Client relationship mapping table
CREATE TABLE public.coach_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  client_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

-- Add foreign key constraints to profiles
ALTER TABLE public.coach_clients 
  ADD CONSTRAINT coach_clients_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT coach_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_clients
CREATE POLICY "Users can view their own coach relationships"
ON public.coach_clients FOR SELECT
USING (auth.uid() = client_id OR auth.uid() = coach_id);

CREATE POLICY "Coaches can invite clients"
ON public.coach_clients FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their client relationships"
ON public.coach_clients FOR UPDATE
USING (auth.uid() = coach_id);

CREATE POLICY "Clients can update their own relationship status"
ON public.coach_clients FOR UPDATE
USING (auth.uid() = client_id);

CREATE POLICY "Coaches can remove clients"
ON public.coach_clients FOR DELETE
USING (auth.uid() = coach_id);

-- Daily scores table for aggregated behavioral metrics
CREATE TABLE public.daily_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  workout_completion NUMERIC(3,2) CHECK (workout_completion >= 0 AND workout_completion <= 1),
  meals_completion NUMERIC(3,2) CHECK (meals_completion >= 0 AND meals_completion <= 1),
  hydration_completion NUMERIC(3,2) CHECK (hydration_completion >= 0 AND hydration_completion <= 1),
  mood_score NUMERIC(3,2) CHECK (mood_score >= 0 AND mood_score <= 1),
  sleep_completion NUMERIC(3,2) CHECK (sleep_completion >= 0 AND sleep_completion <= 1),
  streak_days INTEGER NOT NULL DEFAULT 0,
  streak_frozen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_scores
-- Users can see their own scores
CREATE POLICY "Users can view their own daily scores"
ON public.daily_scores FOR SELECT
USING (auth.uid() = user_id);

-- Coaches can see scores for their active clients
CREATE POLICY "Coaches can view active clients scores"
ON public.daily_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coach_clients cc
    WHERE cc.coach_id = auth.uid()
      AND cc.client_id = daily_scores.user_id
      AND cc.status = 'active'
  )
);

-- Users can insert their own scores
CREATE POLICY "Users can insert their own daily scores"
ON public.daily_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "Users can update their own daily scores"
ON public.daily_scores FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own scores
CREATE POLICY "Users can delete their own daily scores"
ON public.daily_scores FOR DELETE
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_coach_clients_coach_id ON public.coach_clients(coach_id);
CREATE INDEX idx_coach_clients_client_id ON public.coach_clients(client_id);
CREATE INDEX idx_coach_clients_status ON public.coach_clients(status);
CREATE INDEX idx_daily_scores_user_id ON public.daily_scores(user_id);
CREATE INDEX idx_daily_scores_date ON public.daily_scores(date);
CREATE INDEX idx_daily_scores_user_date ON public.daily_scores(user_id, date);

-- Update timestamp trigger for coach_clients
CREATE TRIGGER update_coach_clients_updated_at
  BEFORE UPDATE ON public.coach_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamp trigger for daily_scores
CREATE TRIGGER update_daily_scores_updated_at
  BEFORE UPDATE ON public.daily_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
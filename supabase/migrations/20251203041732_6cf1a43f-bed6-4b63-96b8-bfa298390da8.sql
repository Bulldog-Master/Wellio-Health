-- Create recovery_sessions table for tracking recovery therapies
CREATE TABLE public.recovery_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  therapy_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT DEFAULT 'medium',
  temperature TEXT,
  location TEXT,
  cost NUMERIC,
  notes TEXT,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recovery_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own recovery sessions"
ON public.recovery_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery sessions"
ON public.recovery_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery sessions"
ON public.recovery_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recovery sessions"
ON public.recovery_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_recovery_sessions_user_date ON public.recovery_sessions(user_id, session_date DESC);
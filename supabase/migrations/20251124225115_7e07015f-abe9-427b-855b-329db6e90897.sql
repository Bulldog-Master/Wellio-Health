-- Create interval_timers table for storing custom interval timer configurations
CREATE TABLE public.interval_timers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  text_to_speech BOOLEAN DEFAULT false,
  include_sets BOOLEAN DEFAULT false,
  include_reps BOOLEAN DEFAULT false,
  use_for_notifications BOOLEAN DEFAULT false,
  countdown_beeps BOOLEAN DEFAULT false,
  use_interim_interval BOOLEAN DEFAULT false,
  interim_interval_seconds INTEGER DEFAULT 10,
  end_with_interim BOOLEAN DEFAULT false,
  show_line_numbers BOOLEAN DEFAULT false,
  show_elapsed_time BOOLEAN DEFAULT false,
  intervals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interval_timers ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own interval timers"
ON public.interval_timers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interval timers"
ON public.interval_timers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interval timers"
ON public.interval_timers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interval timers"
ON public.interval_timers
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interval_timers_updated_at
BEFORE UPDATE ON public.interval_timers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
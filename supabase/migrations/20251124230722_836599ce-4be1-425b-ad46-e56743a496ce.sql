-- Create timer_folders table
CREATE TABLE public.timer_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add folder_id to interval_timers
ALTER TABLE public.interval_timers
ADD COLUMN folder_id UUID REFERENCES public.timer_folders(id) ON DELETE SET NULL;

-- Enable RLS on timer_folders
ALTER TABLE public.timer_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for timer_folders
CREATE POLICY "Users can view own folders"
ON public.timer_folders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
ON public.timer_folders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
ON public.timer_folders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
ON public.timer_folders FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_timer_folders_updated_at
BEFORE UPDATE ON public.timer_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
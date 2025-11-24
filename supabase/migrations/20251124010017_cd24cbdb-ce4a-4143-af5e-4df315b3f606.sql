-- Create workout routines table
CREATE TABLE public.workout_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own routines"
  ON public.workout_routines
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON public.workout_routines
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON public.workout_routines
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
  ON public.workout_routines
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create workout media table
CREATE TABLE public.workout_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_log_id UUID REFERENCES public.activity_logs(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own media"
  ON public.workout_media
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media"
  ON public.workout_media
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media"
  ON public.workout_media
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for workout media
INSERT INTO storage.buckets (id, name, public)
VALUES ('workout-media', 'workout-media', true);

-- Create storage policies
CREATE POLICY "Users can view workout media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'workout-media');

CREATE POLICY "Users can upload workout media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'workout-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own workout media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'workout-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add trigger for updated_at
CREATE TRIGGER update_workout_routines_updated_at
  BEFORE UPDATE ON public.workout_routines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
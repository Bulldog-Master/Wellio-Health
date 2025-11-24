-- Create table for sample workout routines
CREATE TABLE public.sample_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  source_platform TEXT,
  source_url TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sample_routines ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own sample routines"
ON public.sample_routines
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sample routines"
ON public.sample_routines
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sample routines"
ON public.sample_routines
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sample routines"
ON public.sample_routines
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sample_routines_updated_at
BEFORE UPDATE ON public.sample_routines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
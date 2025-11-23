-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  record_name TEXT NOT NULL,
  record_date DATE NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own medical records"
ON public.medical_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical records"
ON public.medical_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical records"
ON public.medical_records
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical records"
ON public.medical_records
FOR DELETE
USING (auth.uid() = user_id);
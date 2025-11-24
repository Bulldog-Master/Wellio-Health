-- Create supplements table
CREATE TABLE public.supplements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  dosage TEXT,
  frequency TEXT,
  product_link TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own supplements" 
ON public.supplements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplements" 
ON public.supplements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplements" 
ON public.supplements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplements" 
ON public.supplements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_supplements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_supplements_updated_at
BEFORE UPDATE ON public.supplements
FOR EACH ROW
EXECUTE FUNCTION public.update_supplements_updated_at();
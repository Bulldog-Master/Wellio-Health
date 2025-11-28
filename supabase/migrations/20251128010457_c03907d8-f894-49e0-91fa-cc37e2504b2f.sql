-- Add verified field to fundraisers table
ALTER TABLE public.fundraisers 
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Create storage bucket for fundraiser images
INSERT INTO storage.buckets (id, name, public)
VALUES ('fundraiser-images', 'fundraiser-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for fundraiser images
CREATE POLICY "Anyone can view fundraiser images"
ON storage.objects FOR SELECT
USING (bucket_id = 'fundraiser-images');

CREATE POLICY "Authenticated users can upload fundraiser images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fundraiser-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own fundraiser images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fundraiser-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own fundraiser images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fundraiser-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true);

-- Add image_url column to nutrition_logs table
ALTER TABLE public.nutrition_logs
ADD COLUMN image_url text;

-- Create RLS policies for food-images bucket
CREATE POLICY "Users can view own food images"
ON storage.objects FOR SELECT
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own food images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own food images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own food images"
ON storage.objects FOR DELETE
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);
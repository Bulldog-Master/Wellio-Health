-- Create storage bucket for exercise videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-videos', 'exercise-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for exercise videos
CREATE POLICY "Anyone can view exercise videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-videos');

CREATE POLICY "Authenticated users can upload exercise videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exercise-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete exercise videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'exercise-videos' AND public.has_role(auth.uid(), 'admin'));
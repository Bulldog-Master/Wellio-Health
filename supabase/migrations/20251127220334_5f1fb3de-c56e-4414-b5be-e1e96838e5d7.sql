-- Create storage bucket for voice notes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-notes', 'voice-notes', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for voice notes
CREATE POLICY "Users can upload own voice notes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-notes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own voice notes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voice-notes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own voice notes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-notes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view voice notes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-notes');
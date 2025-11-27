-- Create voice notes table
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  transcription TEXT,
  category TEXT NOT NULL, -- workout, meal, progress, general
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice notes"
  ON voice_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own voice notes"
  ON voice_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice notes"
  ON voice_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice notes"
  ON voice_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_voice_notes_user ON voice_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_category ON voice_notes(category);
CREATE INDEX IF NOT EXISTS idx_voice_notes_recorded_at ON voice_notes(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_notes_favorite ON voice_notes(is_favorite) WHERE is_favorite = true;

-- Add trigger for updated_at
CREATE TRIGGER update_voice_notes_updated_at
  BEFORE UPDATE ON voice_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE voice_notes;
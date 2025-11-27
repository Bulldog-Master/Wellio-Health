-- Create personal records table
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_category TEXT NOT NULL, -- strength, cardio, flexibility, endurance
  record_type TEXT NOT NULL, -- weight, reps, time, distance
  record_value NUMERIC NOT NULL,
  record_unit TEXT NOT NULL, -- lbs, kg, minutes, miles, km, etc
  notes TEXT,
  video_url TEXT,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records"
  ON personal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own records"
  ON personal_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON personal_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records"
  ON personal_records FOR DELETE
  USING (auth.uid() = user_id);

-- Create PR history table for tracking progress over time
CREATE TABLE IF NOT EXISTS pr_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pr_id UUID NOT NULL REFERENCES personal_records(id) ON DELETE CASCADE,
  previous_value NUMERIC NOT NULL,
  new_value NUMERIC NOT NULL,
  improvement_percentage NUMERIC,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for PR history
ALTER TABLE pr_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PR history"
  ON pr_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own PR history"
  ON pr_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_category ON personal_records(exercise_category);
CREATE INDEX IF NOT EXISTS idx_pr_history_pr ON pr_history(pr_id);
CREATE INDEX IF NOT EXISTS idx_pr_history_achieved_at ON pr_history(achieved_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_personal_records_updated_at
  BEFORE UPDATE ON personal_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE personal_records;
ALTER PUBLICATION supabase_realtime ADD TABLE pr_history;
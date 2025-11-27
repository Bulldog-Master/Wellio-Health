-- Add missing columns to workout_programs
ALTER TABLE workout_programs ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add workout program structure and exercises
CREATE TABLE IF NOT EXISTS program_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for program_exercises
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exercises from public programs"
  ON program_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE workout_programs.id = program_exercises.program_id
      AND (workout_programs.is_public = true OR workout_programs.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage exercises in own programs"
  ON program_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE workout_programs.id = program_exercises.program_id
      AND workout_programs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE workout_programs.id = program_exercises.program_id
      AND workout_programs.user_id = auth.uid()
    )
  );

-- Add program enrollments
CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id, started_at)
);

-- Add RLS policies for program_enrollments
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON program_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments"
  ON program_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments"
  ON program_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_program_exercises_program ON program_exercises(program_id);
CREATE INDEX IF NOT EXISTS idx_program_exercises_week_day ON program_exercises(week_number, day_number);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_user ON program_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program ON program_enrollments(program_id);

-- Enable realtime for enrollments
ALTER PUBLICATION supabase_realtime ADD TABLE program_enrollments;
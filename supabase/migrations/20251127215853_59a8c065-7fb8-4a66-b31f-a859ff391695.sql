-- Create fitness events calendar table
CREATE TABLE IF NOT EXISTS fitness_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- workout, meal, cardio, rest, etc.
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- daily, weekly, monthly
  color TEXT,
  reminder_minutes INTEGER DEFAULT 30,
  completed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE fitness_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON fitness_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
  ON fitness_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON fitness_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON fitness_events FOR DELETE
  USING (auth.uid() = user_id);

-- Create event reminders table
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES fitness_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for reminders
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reminders"
  ON event_reminders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fitness_events_user ON fitness_events(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_events_start_time ON fitness_events(start_time);
CREATE INDEX IF NOT EXISTS idx_fitness_events_type ON fitness_events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_reminders_event ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_remind_at ON event_reminders(remind_at);

-- Add trigger for updated_at
CREATE TRIGGER update_fitness_events_updated_at
  BEFORE UPDATE ON fitness_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE fitness_events;
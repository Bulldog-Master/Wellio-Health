-- Create video_sessions table for live coaching/consultation sessions
CREATE TABLE public.video_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('coach', 'clinician')),
  status text NOT NULL CHECK (status IN ('scheduled', 'in_session', 'completed', 'cancelled')),
  meeting_url text NOT NULL,
  label text, -- e.g., 'check-in', 'program review'
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX video_sessions_professional_id_idx ON video_sessions (professional_id);
CREATE INDEX video_sessions_client_id_idx ON video_sessions (client_id);
CREATE INDEX video_sessions_status_idx ON video_sessions (status);

-- Enable RLS
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;

-- Professionals can view and manage their own sessions
CREATE POLICY "Professionals can view their sessions"
  ON video_sessions FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create sessions"
  ON video_sessions FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their sessions"
  ON video_sessions FOR UPDATE
  USING (auth.uid() = professional_id);

-- Clients can only view sessions where they are the client
CREATE POLICY "Clients can view their sessions"
  ON video_sessions FOR SELECT
  USING (auth.uid() = client_id);
-- Create live_workout_sessions table
CREATE TABLE public.live_workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  workout_type TEXT,
  difficulty_level TEXT,
  max_participants INTEGER,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_participants table
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(session_id, user_id)
);

-- Create session_messages table for live chat
CREATE TABLE public.session_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.live_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_workout_sessions
CREATE POLICY "Users can view non-private sessions or sessions they host/joined"
ON public.live_workout_sessions FOR SELECT
USING (
  is_private = false 
  OR auth.uid() = host_id
  OR EXISTS (
    SELECT 1 FROM public.session_participants 
    WHERE session_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own sessions"
ON public.live_workout_sessions FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own sessions"
ON public.live_workout_sessions FOR UPDATE
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own sessions"
ON public.live_workout_sessions FOR DELETE
USING (auth.uid() = host_id);

-- RLS Policies for session_participants
CREATE POLICY "Users can view participants of sessions they can access"
ON public.session_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.live_workout_sessions 
    WHERE id = session_id 
    AND (is_private = false OR auth.uid() = host_id OR user_id = auth.uid())
  )
);

CREATE POLICY "Users can join sessions"
ON public.session_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON public.session_participants FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for session_messages
CREATE POLICY "Users can view messages in sessions they participate in"
ON public.session_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_messages.session_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.live_workout_sessions 
    WHERE id = session_messages.session_id AND host_id = auth.uid()
  )
);

CREATE POLICY "Participants can send messages"
ON public.session_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.session_participants 
      WHERE session_id = session_messages.session_id AND user_id = auth.uid() AND is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM public.live_workout_sessions 
      WHERE id = session_messages.session_id AND host_id = auth.uid()
    )
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_live_workout_sessions_updated_at
BEFORE UPDATE ON public.live_workout_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_workout_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages;
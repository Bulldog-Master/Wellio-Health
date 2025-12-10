-- Create secure_messages table for SecureChatApi
CREATE TABLE public.secure_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  ciphertext text NOT NULL,
  nonce text NOT NULL,
  kem_ciphertext text,
  version integer NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.secure_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only conversation participants can read/write
-- For coach-client conversations
CREATE POLICY "Coaches can view secure messages with their clients"
  ON public.secure_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_clients cc
      WHERE cc.status = 'active'
        AND ((cc.coach_id = auth.uid() AND cc.client_id = sender_id)
          OR (cc.client_id = auth.uid() AND cc.coach_id = sender_id)
          OR (cc.coach_id = auth.uid() AND EXISTS (
              SELECT 1 FROM secure_messages sm2 
              WHERE sm2.conversation_id = secure_messages.conversation_id 
                AND sm2.sender_id = cc.client_id
            ))
          OR (cc.client_id = auth.uid() AND EXISTS (
              SELECT 1 FROM secure_messages sm2 
              WHERE sm2.conversation_id = secure_messages.conversation_id 
                AND sm2.sender_id = cc.coach_id
            )))
    )
  );

-- For clinician-patient conversations
CREATE POLICY "Clinicians can view secure messages with their patients"
  ON public.secure_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clinician_patients cp
      WHERE cp.status = 'active'
        AND ((cp.clinician_id = auth.uid() AND cp.patient_id = sender_id)
          OR (cp.patient_id = auth.uid() AND cp.clinician_id = sender_id)
          OR (cp.clinician_id = auth.uid() AND EXISTS (
              SELECT 1 FROM secure_messages sm2 
              WHERE sm2.conversation_id = secure_messages.conversation_id 
                AND sm2.sender_id = cp.patient_id
            ))
          OR (cp.patient_id = auth.uid() AND EXISTS (
              SELECT 1 FROM secure_messages sm2 
              WHERE sm2.conversation_id = secure_messages.conversation_id 
                AND sm2.sender_id = cp.clinician_id
            )))
    )
  );

-- Users can view their own sent messages
CREATE POLICY "Users can view own secure messages"
  ON public.secure_messages FOR SELECT
  USING (auth.uid() = sender_id);

-- Users can insert their own messages
CREATE POLICY "Users can send secure messages"
  ON public.secure_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create index for faster lookups
CREATE INDEX idx_secure_messages_conversation ON public.secure_messages(conversation_id);
CREATE INDEX idx_secure_messages_sender ON public.secure_messages(sender_id);
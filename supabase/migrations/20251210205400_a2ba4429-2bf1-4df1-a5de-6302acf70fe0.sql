-- Fix infinite recursion in secure_messages RLS policies
-- Step 1: Create SECURITY DEFINER function to check if user can access a conversation

CREATE OR REPLACE FUNCTION public.can_access_secure_conversation(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _can_access boolean := false;
BEGIN
  -- Check if user sent any message in this conversation
  SELECT EXISTS (
    SELECT 1 FROM public.secure_messages 
    WHERE conversation_id = _conversation_id AND sender_id = _user_id
  ) INTO _can_access;
  
  IF _can_access THEN
    RETURN true;
  END IF;
  
  -- Check if user is a coach with client who participates in conversation
  SELECT EXISTS (
    SELECT 1 FROM public.coach_clients cc
    JOIN public.secure_messages sm ON sm.sender_id IN (cc.coach_id, cc.client_id)
    WHERE cc.status = 'active'
      AND sm.conversation_id = _conversation_id
      AND (cc.coach_id = _user_id OR cc.client_id = _user_id)
  ) INTO _can_access;
  
  IF _can_access THEN
    RETURN true;
  END IF;
  
  -- Check if user is a clinician with patient who participates in conversation
  SELECT EXISTS (
    SELECT 1 FROM public.clinician_patients cp
    JOIN public.secure_messages sm ON sm.sender_id IN (cp.clinician_id, cp.patient_id)
    WHERE cp.status = 'active'
      AND sm.conversation_id = _conversation_id
      AND (cp.clinician_id = _user_id OR cp.patient_id = _user_id)
  ) INTO _can_access;
  
  RETURN _can_access;
END;
$$;

-- Step 2: Drop existing problematic policies
DROP POLICY IF EXISTS "Coaches can view secure messages with their clients" ON public.secure_messages;
DROP POLICY IF EXISTS "Clinicians can view secure messages with their patients" ON public.secure_messages;
DROP POLICY IF EXISTS "Users can view own secure messages" ON public.secure_messages;
DROP POLICY IF EXISTS "Users can send secure messages" ON public.secure_messages;

-- Step 3: Create new non-recursive policies using the helper function

-- Policy for viewing messages (covers users, coaches, and clinicians)
CREATE POLICY "Users can view accessible secure messages"
ON public.secure_messages
FOR SELECT
USING (
  auth.uid() = sender_id 
  OR public.can_access_secure_conversation(auth.uid(), conversation_id)
);

-- Policy for sending messages (only direct participants)
CREATE POLICY "Users can send secure messages"
ON public.secure_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Policy for updating own messages
CREATE POLICY "Users can update their own secure messages"
ON public.secure_messages
FOR UPDATE
USING (auth.uid() = sender_id);

-- Policy for deleting own messages
CREATE POLICY "Users can delete their own secure messages"
ON public.secure_messages
FOR DELETE
USING (auth.uid() = sender_id);
-- Fix critical privilege escalation vulnerability in user_roles table
-- Remove policy that allows users to self-assign any role (including admin)
DROP POLICY IF EXISTS "Users can insert their own roles during signup" ON public.user_roles;

-- Create restricted policy: users can only assign themselves the 'user' role
CREATE POLICY "Users can only insert default user role during signup"
ON public.user_roles FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND role = 'user'
);
-- Drop legacy conflicting RLS policies on profiles table
-- These policies override the new "followers only" policy because PostgreSQL combines SELECT policies with OR logic

DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- The remaining policy "Users can view own profile or followed profiles" will now be the only active SELECT policy
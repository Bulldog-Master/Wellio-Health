-- Remove remaining public profile policies that allow unauthenticated access
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view followed profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of users they follow" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Ensure only the authenticated policy remains (it should already exist from previous migration)
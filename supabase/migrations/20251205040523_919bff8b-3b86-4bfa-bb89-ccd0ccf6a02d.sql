-- Remove all legacy public-access policies on profiles
DROP POLICY IF EXISTS "profiles_owner_full_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "Limited profile data visible to authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
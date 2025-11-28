-- Skip creating enum if it already exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('user', 'trainer', 'creator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create helper function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles during signup"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix profiles table RLS - only show to owner and approved followers
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of users they follow" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of users they follow"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = auth.uid() 
      AND following_id = profiles.id
    )
  );

CREATE POLICY "Users can view public profiles"
  ON public.profiles
  FOR SELECT
  USING (is_private = false OR is_private IS NULL);

-- Fix trainer_profiles RLS - trainers control visibility
DROP POLICY IF EXISTS "Trainers can manage own profiles" ON public.trainer_profiles;
DROP POLICY IF EXISTS "Anyone can view trainer profiles" ON public.trainer_profiles;
DROP POLICY IF EXISTS "Trainers can manage their own profile" ON public.trainer_profiles;
DROP POLICY IF EXISTS "Authenticated users can view public trainer info" ON public.trainer_profiles;

CREATE POLICY "Trainers can manage their own profile"
  ON public.trainer_profiles
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view verified trainers"
  ON public.trainer_profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    (is_verified = true OR user_id = auth.uid())
  );

-- Fix bookings RLS - verify booking acceptance
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Trainers can view bookings for accepted sessions" ON public.bookings;
DROP POLICY IF EXISTS "Trainers can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can update their own bookings" ON public.bookings;

CREATE POLICY "Clients can view their bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view confirmed bookings"
  ON public.bookings
  FOR SELECT
  USING (
    auth.uid() = trainer_id AND 
    status IN ('confirmed', 'completed')
  );

CREATE POLICY "Trainers can update bookings"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can update pending bookings"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid() = client_id AND status = 'pending');

-- Create trigger to auto-assign role after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert role from user metadata if it exists
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id, 
      (NEW.raw_user_meta_data->>'role')::app_role
    )
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default to 'user' role if no role specified
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();
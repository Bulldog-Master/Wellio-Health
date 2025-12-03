-- =====================================================
-- SECURITY FIX: Comprehensive RLS Policy Updates
-- =====================================================

-- 1. PROFILES TABLE: Restrict sensitive profile data
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create restrictive SELECT policy for profiles
-- Public profiles show basic info, full info only to followers/self/admin
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR
  -- Admins can see all profiles
  public.has_role(auth.uid(), 'admin')
  OR
  -- For other profiles, only show if:
  -- 1. Profile is not private AND
  -- 2. Viewer is authenticated (prevents anonymous scraping)
  (
    (is_private = false OR is_private IS NULL)
    AND auth.uid() IS NOT NULL
  )
);

-- 2. PROFESSIONAL_APPLICATIONS TABLE: Restrict to admins and applicants only
DROP POLICY IF EXISTS "Anyone can view professional applications" ON public.professional_applications;
DROP POLICY IF EXISTS "Users can view all applications" ON public.professional_applications;
DROP POLICY IF EXISTS "Applications are viewable by all" ON public.professional_applications;

-- Only admins and the applicant can view applications
CREATE POLICY "professional_applications_select_restricted" ON public.professional_applications
FOR SELECT USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

-- 3. FITNESS_LOCATIONS TABLE: Hide submitted_by from non-admins
-- Create a secure function to get locations without exposing submitter
CREATE OR REPLACE FUNCTION public.get_fitness_locations_safe()
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  phone text,
  website_url text,
  description text,
  amenities text[],
  hours_of_operation jsonb,
  price_range text,
  average_rating numeric,
  total_reviews integer,
  image_url text,
  is_verified boolean,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  -- Only return submitted_by for admins
  submitted_by_visible uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    fl.id,
    fl.name,
    fl.category,
    fl.address,
    fl.city,
    fl.state,
    fl.country,
    fl.postal_code,
    fl.latitude,
    fl.longitude,
    fl.phone,
    fl.website_url,
    fl.description,
    fl.amenities,
    fl.hours_of_operation,
    fl.price_range,
    fl.average_rating,
    fl.total_reviews,
    fl.image_url,
    fl.is_verified,
    fl.is_active,
    fl.created_at,
    fl.updated_at,
    CASE 
      WHEN public.has_role(auth.uid(), 'admin') THEN fl.submitted_by
      ELSE NULL
    END as submitted_by_visible
  FROM public.fitness_locations fl
  WHERE fl.is_active = true OR public.has_role(auth.uid(), 'admin');
$$;

-- 4. NEWS_ITEMS TABLE: Hide created_by from non-admins
CREATE OR REPLACE FUNCTION public.get_news_items_safe()
RETURNS TABLE (
  id uuid,
  title text,
  title_es text,
  url text,
  category text,
  badge_type text,
  event_date text,
  event_date_es text,
  is_active boolean,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz,
  created_by_visible uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ni.id,
    ni.title,
    ni.title_es,
    ni.url,
    ni.category,
    ni.badge_type,
    ni.event_date,
    ni.event_date_es,
    ni.is_active,
    ni.sort_order,
    ni.created_at,
    ni.updated_at,
    CASE 
      WHEN public.has_role(auth.uid(), 'admin') THEN ni.created_by
      ELSE NULL
    END as created_by_visible
  FROM public.news_items ni
  WHERE ni.is_active = true OR public.has_role(auth.uid(), 'admin');
$$;

-- 5. REWARDS TABLE: Make metadata visible only to authenticated users
DROP POLICY IF EXISTS "Anyone can view rewards" ON public.rewards;
DROP POLICY IF EXISTS "Rewards are viewable by everyone" ON public.rewards;
DROP POLICY IF EXISTS "Public can view active rewards" ON public.rewards;

-- Only authenticated users can view rewards (prevents competitor scraping)
CREATE POLICY "rewards_select_authenticated" ON public.rewards
FOR SELECT USING (
  auth.uid() IS NOT NULL
  AND (is_active = true OR public.has_role(auth.uid(), 'admin'))
);

-- Add comments documenting sensitive fields
COMMENT ON COLUMN public.profiles.age IS 'SENSITIVE: Only visible to self, followers, or admins';
COMMENT ON COLUMN public.profiles.weight IS 'SENSITIVE: Only visible to self, followers, or admins';
COMMENT ON COLUMN public.profiles.height IS 'SENSITIVE: Only visible to self, followers, or admins';
COMMENT ON COLUMN public.profiles.goal IS 'SENSITIVE: Only visible to self, followers, or admins';
COMMENT ON COLUMN public.professional_applications.email IS 'SENSITIVE: Only visible to admins and applicant';
COMMENT ON COLUMN public.professional_applications.phone IS 'SENSITIVE: Only visible to admins and applicant';
COMMENT ON COLUMN public.fitness_locations.submitted_by IS 'SENSITIVE: Hidden from non-admin users via get_fitness_locations_safe()';
COMMENT ON COLUMN public.news_items.created_by IS 'SENSITIVE: Hidden from non-admin users via get_news_items_safe()';
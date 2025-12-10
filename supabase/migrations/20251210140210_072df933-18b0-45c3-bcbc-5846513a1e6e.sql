-- Fix the view to use SECURITY INVOKER (queries use caller's permissions)
DROP VIEW IF EXISTS public.fitness_locations_public;
CREATE VIEW public.fitness_locations_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  description,
  category,
  address,
  city,
  state,
  country,
  postal_code,
  latitude,
  longitude,
  phone,
  website_url,
  image_url,
  amenities,
  hours_of_operation,
  price_range,
  average_rating,
  total_reviews,
  is_verified,
  is_active,
  created_at,
  updated_at
FROM fitness_locations
WHERE is_active = true;

GRANT SELECT ON public.fitness_locations_public TO authenticated;
GRANT SELECT ON public.fitness_locations_public TO anon;
COMMENT ON VIEW public.fitness_locations_public IS 'Public view of fitness locations that hides submitter identity for privacy';
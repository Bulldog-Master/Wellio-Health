-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  description_es TEXT,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create advertisements table for banner ads
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_es TEXT,
  description TEXT,
  description_es TEXT,
  image_url TEXT,
  link_url TEXT,
  placement TEXT NOT NULL DEFAULT 'dashboard' CHECK (placement IN ('dashboard', 'activity', 'feed', 'news', 'global')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fitness locations table
CREATE TABLE public.fitness_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gym', 'crossfit', 'mma', 'yoga', 'swimming', 'cycling', 'climbing', 'boxing', 'pilates', 'other')),
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website_url TEXT,
  image_url TEXT,
  amenities TEXT[],
  hours_of_operation JSONB,
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  submitted_by UUID REFERENCES auth.users(id),
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create location reviews table
CREATE TABLE public.location_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.fitness_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(location_id, user_id)
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_reviews ENABLE ROW LEVEL SECURITY;

-- Sponsors policies (public read, admin write)
CREATE POLICY "Anyone can view active sponsors" ON public.sponsors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sponsors" ON public.sponsors
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Advertisements policies (public read, admin write)
CREATE POLICY "Anyone can view active ads" ON public.advertisements
  FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

CREATE POLICY "Admins can manage advertisements" ON public.advertisements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fitness locations policies
CREATE POLICY "Anyone can view active locations" ON public.fitness_locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can submit locations" ON public.fitness_locations
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all locations" ON public.fitness_locations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Submitters can update their unverified locations" ON public.fitness_locations
  FOR UPDATE USING (auth.uid() = submitted_by AND is_verified = false);

-- Location reviews policies
CREATE POLICY "Anyone can view reviews" ON public.location_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.location_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.location_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.location_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update location rating when review is added/updated
CREATE OR REPLACE FUNCTION public.update_location_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fitness_locations
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
      FROM public.location_reviews
      WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.location_reviews
      WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for rating updates
CREATE TRIGGER update_location_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.location_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_location_rating();
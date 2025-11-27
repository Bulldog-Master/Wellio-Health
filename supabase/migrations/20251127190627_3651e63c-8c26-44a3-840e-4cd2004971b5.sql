-- Create trainer profiles table
CREATE TABLE public.trainer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  experience_years INTEGER,
  profile_image_url TEXT,
  location TEXT,
  availability_calendar JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trainer programs table
CREATE TABLE public.trainer_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  price DECIMAL(10,2),
  program_type TEXT DEFAULT 'online' CHECK (program_type IN ('online', 'in-person', 'hybrid')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  max_participants INTEGER,
  thumbnail_url TEXT,
  program_content JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.trainer_programs(id) ON DELETE SET NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('session', 'program')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.trainer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reviewer_id, booking_id)
);

-- Enable RLS
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer_profiles
CREATE POLICY "Anyone can view trainer profiles"
  ON public.trainer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Trainers can update own profile"
  ON public.trainer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Trainers can create own profile"
  ON public.trainer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trainer_programs
CREATE POLICY "Anyone can view active programs"
  ON public.trainer_programs FOR SELECT
  USING (is_active = true OR auth.uid() = trainer_id);

CREATE POLICY "Trainers can manage own programs"
  ON public.trainer_programs FOR ALL
  TO authenticated
  USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Clients can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = trainer_id);

-- RLS Policies for trainer_reviews
CREATE POLICY "Anyone can view reviews"
  ON public.trainer_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for completed bookings"
  ON public.trainer_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_id
      AND bookings.client_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

CREATE POLICY "Reviewers can update own reviews"
  ON public.trainer_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- Function to update trainer rating
CREATE OR REPLACE FUNCTION public.update_trainer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trainer_profiles
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.trainer_reviews
      WHERE trainer_id = NEW.trainer_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.trainer_reviews
      WHERE trainer_id = NEW.trainer_id
    )
  WHERE user_id = NEW.trainer_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update trainer ratings
CREATE TRIGGER update_trainer_rating_trigger
AFTER INSERT OR UPDATE ON public.trainer_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_trainer_rating();

-- Trigger for updated_at
CREATE TRIGGER update_trainer_profiles_updated_at
BEFORE UPDATE ON public.trainer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trainer_programs_updated_at
BEFORE UPDATE ON public.trainer_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
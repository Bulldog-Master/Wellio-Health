-- Create fundraisers table
CREATE TABLE IF NOT EXISTS public.fundraisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount NUMERIC(10, 2) NOT NULL CHECK (goal_amount > 0),
  current_amount NUMERIC(10, 2) DEFAULT 0 CHECK (current_amount >= 0),
  category TEXT NOT NULL CHECK (category IN ('medical', 'community_event', 'charity', 'equipment', 'other')),
  location TEXT,
  image_url TEXT,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS public.fundraiser_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID REFERENCES public.fundraisers(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraiser_donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fundraisers
CREATE POLICY "Anyone can view active fundraisers"
  ON public.fundraisers
  FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create fundraisers"
  ON public.fundraisers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update their fundraisers"
  ON public.fundraisers
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can delete their fundraisers"
  ON public.fundraisers
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for donations
CREATE POLICY "Anyone can view non-anonymous donations"
  ON public.fundraiser_donations
  FOR SELECT
  USING (
    NOT is_anonymous OR 
    auth.uid() = donor_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.fundraisers WHERE id = fundraiser_id
    )
  );

CREATE POLICY "Authenticated users can create donations"
  ON public.fundraiser_donations
  FOR INSERT
  WITH CHECK (auth.uid() = donor_id OR donor_id IS NULL);

-- Trigger to update fundraiser amount when donation is added
CREATE OR REPLACE FUNCTION public.update_fundraiser_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fundraisers
    SET 
      current_amount = current_amount + NEW.amount,
      status = CASE 
        WHEN current_amount + NEW.amount >= goal_amount THEN 'completed'
        ELSE status
      END,
      updated_at = now()
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_donation_added
  AFTER INSERT ON public.fundraiser_donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fundraiser_amount();

-- Trigger to update updated_at
CREATE TRIGGER update_fundraisers_updated_at
  BEFORE UPDATE ON public.fundraisers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
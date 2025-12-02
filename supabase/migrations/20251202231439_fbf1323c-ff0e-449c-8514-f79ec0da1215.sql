-- Create recommended_products table for admin-curated product recommendations
CREATE TABLE public.recommended_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_es TEXT,
  description TEXT,
  description_es TEXT,
  personal_endorsement TEXT,
  personal_endorsement_es TEXT,
  category TEXT NOT NULL DEFAULT 'supplements',
  image_url TEXT,
  purchase_url TEXT,
  price_range TEXT,
  is_bulldogz_approved BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommended_products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Anyone can view active recommended products"
ON public.recommended_products
FOR SELECT
USING (is_active = true);

-- Only admins can manage products
CREATE POLICY "Admins can manage recommended products"
ON public.recommended_products
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_recommended_products_updated_at
BEFORE UPDATE ON public.recommended_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add check constraint for valid categories
ALTER TABLE public.recommended_products
ADD CONSTRAINT recommended_products_category_check
CHECK (category IN ('supplements', 'gear', 'apparel', 'equipment', 'recovery', 'nutrition', 'accessories'));
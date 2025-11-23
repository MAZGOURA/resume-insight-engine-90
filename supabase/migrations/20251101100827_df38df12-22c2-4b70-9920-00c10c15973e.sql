-- Phase 1: Fix Database Structure (complete)

-- 1. Create handle_new_user function FIRST
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$;

-- 2. Create shipping_cities table
CREATE TABLE IF NOT EXISTS public.shipping_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  shipping_price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipping_cities_active ON public.shipping_cities(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_cities_name ON public.shipping_cities(city_name);

-- Enable RLS
ALTER TABLE public.shipping_cities ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Shipping cities are viewable by everyone" ON public.shipping_cities;
DROP POLICY IF EXISTS "Admins can manage shipping cities" ON public.shipping_cities;

CREATE POLICY "Shipping cities are viewable by everyone"
  ON public.shipping_cities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage shipping cities"
  ON public.shipping_cities FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 3. Fix products foreign keys
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_brand_id_fkey'
  ) THEN
    ALTER TABLE public.products 
    ADD CONSTRAINT products_brand_id_fkey 
    FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE public.products 
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Create triggers
DROP TRIGGER IF EXISTS set_shipping_cities_updated_at ON public.shipping_cities;
CREATE TRIGGER set_shipping_cities_updated_at
  BEFORE UPDATE ON public.shipping_cities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Admin role helper function
CREATE OR REPLACE FUNCTION public.ensure_admin_role(admin_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email LIMIT 1;
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- 6. Add sample shipping cities
INSERT INTO public.shipping_cities (city_name, shipping_price, is_active)
VALUES 
  ('Dubai', 15.00, true),
  ('Abu Dhabi', 20.00, true),
  ('Sharjah', 15.00, true),
  ('Ajman', 18.00, true),
  ('Ras Al Khaimah', 25.00, true),
  ('Fujairah', 30.00, true),
  ('Umm Al Quwain', 22.00, true)
ON CONFLICT DO NOTHING;
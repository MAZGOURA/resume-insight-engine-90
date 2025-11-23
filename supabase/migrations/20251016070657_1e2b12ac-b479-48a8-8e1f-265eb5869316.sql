-- Create missing tables required by admin pages
-- NOTE: Uses permissive RLS for authenticated users until admin roles are wired to Supabase auth

-- Enable required extension for UUIDs if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) shipping_tax_configs
CREATE TABLE IF NOT EXISTS public.shipping_tax_configs (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL, -- 'shipping' | 'tax'
  rate_type text NOT NULL, -- 'flat' | 'percentage'
  rate_value numeric NOT NULL,
  min_order_amount numeric NULL,
  max_order_amount numeric NULL,
  is_active boolean DEFAULT true,
  description text NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.shipping_tax_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shipping_tax_configs' AND policyname = 'Shipping tax configs are viewable by everyone'
  ) THEN
    CREATE POLICY "Shipping tax configs are viewable by everyone"
    ON public.shipping_tax_configs
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shipping_tax_configs' AND policyname = 'Authenticated can insert shipping tax configs'
  ) THEN
    CREATE POLICY "Authenticated can insert shipping tax configs"
    ON public.shipping_tax_configs
    FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shipping_tax_configs' AND policyname = 'Authenticated can update shipping tax configs'
  ) THEN
    CREATE POLICY "Authenticated can update shipping tax configs"
    ON public.shipping_tax_configs
    FOR UPDATE
    USING ( auth.role() = 'authenticated' );
  END IF;
END $$;

-- 2) delivery_drivers
CREATE TABLE IF NOT EXISTS public.delivery_drivers (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  full_name text NOT NULL,
  phone text NULL,
  vehicle_type text NULL,
  vehicle_plate_number text NULL,
  license_number text NULL,
  user_id uuid NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Authenticated can view delivery drivers'
  ) THEN
    CREATE POLICY "Authenticated can view delivery drivers"
    ON public.delivery_drivers
    FOR SELECT
    USING ( auth.role() = 'authenticated' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Authenticated can insert delivery drivers'
  ) THEN
    CREATE POLICY "Authenticated can insert delivery drivers"
    ON public.delivery_drivers
    FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Authenticated can update delivery drivers'
  ) THEN
    CREATE POLICY "Authenticated can update delivery drivers"
    ON public.delivery_drivers
    FOR UPDATE
    USING ( auth.role() = 'authenticated' );
  END IF;
END $$;

-- 3) driver_payments
CREATE TABLE IF NOT EXISTS public.driver_payments (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  driver_id uuid NULL REFERENCES public.delivery_drivers(id) ON DELETE SET NULL,
  order_id uuid NULL REFERENCES public.orders(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  payment_date timestamptz NULL,
  notes text NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.driver_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'driver_payments' AND policyname = 'Authenticated can view driver payments'
  ) THEN
    CREATE POLICY "Authenticated can view driver payments"
    ON public.driver_payments
    FOR SELECT
    USING ( auth.role() = 'authenticated' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'driver_payments' AND policyname = 'Authenticated can insert driver payments'
  ) THEN
    CREATE POLICY "Authenticated can insert driver payments"
    ON public.driver_payments
    FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'driver_payments' AND policyname = 'Authenticated can update driver payments'
  ) THEN
    CREATE POLICY "Authenticated can update driver payments"
    ON public.driver_payments
    FOR UPDATE
    USING ( auth.role() = 'authenticated' );
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_driver_payments_driver_id ON public.driver_payments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_payments_order_id ON public.driver_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_drivers_active ON public.delivery_drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_tax_configs_active ON public.shipping_tax_configs(is_active);
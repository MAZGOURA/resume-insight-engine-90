-- PHASE 1: Fix RLS Infinite Recursion by updating all policies to use has_role() function
-- The has_role() function already exists as a SECURITY DEFINER, preventing recursion

-- ============================================================================
-- USER_ROLES TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- CATEGORIES TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- BRANDS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;
CREATE POLICY "Admins can manage brands" 
ON public.brands 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- ADDRESSES TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage addresses" ON public.addresses;
CREATE POLICY "Admins can manage addresses" 
ON public.addresses 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- CART_ITEMS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view all cart items" ON public.cart_items;
CREATE POLICY "Admins can view all cart items" 
ON public.cart_items 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- COUPONS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" 
ON public.coupons 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- DELIVERY_DRIVERS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage delivery drivers" ON public.delivery_drivers;
CREATE POLICY "Admins can manage delivery drivers" 
ON public.delivery_drivers 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delivery drivers are insertable by admins" ON public.delivery_drivers;
CREATE POLICY "Delivery drivers are insertable by admins" 
ON public.delivery_drivers 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delivery drivers are updatable by admins and the driver" ON public.delivery_drivers;
CREATE POLICY "Delivery drivers are updatable by admins and the driver" 
ON public.delivery_drivers 
FOR UPDATE 
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Delivery drivers are viewable by admins and the driver" ON public.delivery_drivers;
CREATE POLICY "Delivery drivers are viewable by admins and the driver" 
ON public.delivery_drivers 
FOR SELECT 
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- DRIVER_ASSIGNMENTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage driver assignments" ON public.driver_assignments;
CREATE POLICY "Admins can manage driver assignments" 
ON public.driver_assignments 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Driver assignments are viewable by admins, drivers, and custome" ON public.driver_assignments;
CREATE POLICY "Driver assignments are viewable by admins, drivers, and customers" 
ON public.driver_assignments 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM delivery_drivers 
    WHERE delivery_drivers.id = driver_assignments.driver_id 
    AND delivery_drivers.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM orders 
    JOIN driver_assignments da ON orders.id = da.order_id 
    WHERE da.id = driver_assignments.id 
    AND orders.user_id = auth.uid()
  )
);

-- ============================================================================
-- DRIVER_PAYMENTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage driver payments" ON public.driver_payments;
CREATE POLICY "Admins can manage driver payments" 
ON public.driver_payments 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Driver payments are viewable by admins and the driver" ON public.driver_payments;
CREATE POLICY "Driver payments are viewable by admins and the driver" 
ON public.driver_payments 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM delivery_drivers 
    WHERE delivery_drivers.id = driver_payments.driver_id 
    AND delivery_drivers.user_id = auth.uid()
  )
);

-- ============================================================================
-- INVENTORY TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;
CREATE POLICY "Admins can manage inventory" 
ON public.inventory 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PRODUCT_IMAGES TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
CREATE POLICY "Admins can manage product images" 
ON public.product_images 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- REVIEWS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews" 
ON public.reviews 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- SHIPPING_TAX_CONFIGS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage shipping tax configs" ON public.shipping_tax_configs;
CREATE POLICY "Admins can manage shipping tax configs" 
ON public.shipping_tax_configs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- INVOICES TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
CREATE POLICY "Admins can manage invoices" 
ON public.invoices 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- INVOICE_ITEMS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage invoice items" ON public.invoice_items;
CREATE POLICY "Admins can manage invoice items" 
ON public.invoice_items 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- ORDER_COUPONS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage order coupons" ON public.order_coupons;
CREATE POLICY "Admins can manage order coupons" 
ON public.order_coupons 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items" 
ON public.order_items 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" 
ON public.orders 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments" 
ON public.payments 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Drivers can update their own profile" ON public.profiles;
CREATE POLICY "Drivers can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM delivery_drivers 
    WHERE delivery_drivers.user_id = auth.uid() 
    AND delivery_drivers.user_id = delivery_drivers.id
  ) OR
  public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.profiles;
CREATE POLICY "Drivers can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM delivery_drivers 
    WHERE delivery_drivers.user_id = auth.uid() 
    AND delivery_drivers.user_id = delivery_drivers.id
  ) OR
  public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- WISHLISTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage wishlists" ON public.wishlists;
CREATE POLICY "Admins can manage wishlists" 
ON public.wishlists 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PHASE 3: Add missing columns and create new tables
-- ============================================================================

-- Add email column to profiles table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  response TEXT
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS for contact_messages
CREATE POLICY "Admins can manage contact messages" 
ON public.contact_messages 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS for newsletter_subscriptions
CREATE POLICY "Admins can manage newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can subscribe" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS for order_status_history
CREATE POLICY "Admins can manage order status history" 
ON public.order_status_history 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their order status history" 
ON public.order_status_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Add tracking fields to orders table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'carrier'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN carrier TEXT;
  END IF;
END $$;

-- Create trigger to automatically log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, status, changed_by, notes)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS order_status_change_trigger ON public.orders;
CREATE TRIGGER order_status_change_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION log_order_status_change();
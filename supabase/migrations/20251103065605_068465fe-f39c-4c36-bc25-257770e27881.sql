-- Fix RLS policies to allow anonymous users to view public data

-- Drop and recreate products policies for anonymous access
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (
    is_active = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  );

-- Fix categories policy
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (
    is_active = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  );

-- Fix brands policy
DROP POLICY IF EXISTS "Anyone can view active brands" ON brands;
CREATE POLICY "Anyone can view active brands"
  ON brands FOR SELECT
  USING (
    is_active = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  );

-- Fix collections policy
DROP POLICY IF EXISTS "Anyone can view active collections" ON collections;
CREATE POLICY "Anyone can view active collections"
  ON collections FOR SELECT
  USING (
    is_active = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  );

-- Fix coupons policy
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (
    is_active = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  );

-- Fix shipping cities policy
DROP POLICY IF EXISTS "Anyone can view active shipping cities" ON shipping_cities;
CREATE POLICY "Anyone can view active shipping cities"
  ON shipping_cities FOR SELECT
  USING (
    is_active = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  );

-- Fix shipping tax configs policy
DROP POLICY IF EXISTS "Anyone can view active shipping tax configs" ON shipping_tax_configs;
CREATE POLICY "Anyone can view active shipping tax configs"
  ON shipping_tax_configs FOR SELECT
  USING (
    is_active = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  );
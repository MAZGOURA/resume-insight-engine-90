-- ============================================
-- DATABASE OPTIMIZATION MIGRATION
-- ============================================
-- This migration:
-- 1. Drops all RLS policies and disables RLS
-- 2. Removes 6 unused tables
-- 3. Adds 21 missing foreign key constraints
-- 4. Adds performance indexes
-- ============================================

-- ============================================
-- STEP 1: DROP ALL RLS POLICIES
-- ============================================

-- Drop policies on cart_items
DROP POLICY IF EXISTS "Authenticated users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can delete their own cart items" ON cart_items;

-- Drop policies on categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

-- Drop policies on collections
DROP POLICY IF EXISTS "Collections are viewable by everyone" ON collections;

-- Drop policies on order_items
DROP POLICY IF EXISTS "Authenticated users can view their order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can insert order items" ON order_items;

-- Drop policies on orders
DROP POLICY IF EXISTS "Authenticated users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can insert their own orders" ON orders;

-- Drop policies on product_categories
DROP POLICY IF EXISTS "Product categories are viewable by everyone" ON product_categories;

-- Drop policies on product_collections
DROP POLICY IF EXISTS "Product collections are viewable by everyone" ON product_collections;

-- Drop policies on product_images
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;

-- Drop policies on products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

-- Drop policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Drop policies on reviews
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;

-- Drop policies on wishlists
DROP POLICY IF EXISTS "Authenticated users can view their own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Authenticated users can insert into their own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Authenticated users can delete from their own wishlist" ON wishlists;

-- ============================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_tax_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: DROP UNUSED TABLES
-- ============================================

DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS order_coupons CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;

-- ============================================
-- STEP 4: ADD FOREIGN KEY CONSTRAINTS
-- ============================================

-- Users and profiles
ALTER TABLE addresses 
  ADD CONSTRAINT fk_addresses_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE cart_items 
  ADD CONSTRAINT fk_cart_items_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE cart_items 
  ADD CONSTRAINT fk_cart_items_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE wishlists 
  ADD CONSTRAINT fk_wishlists_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE wishlists 
  ADD CONSTRAINT fk_wishlists_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE order_items 
  ADD CONSTRAINT fk_order_items_order 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items 
  ADD CONSTRAINT fk_order_items_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE order_status_history 
  ADD CONSTRAINT fk_order_status_history_order 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE reviews 
  ADD CONSTRAINT fk_reviews_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reviews 
  ADD CONSTRAINT fk_reviews_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE reviews 
  ADD CONSTRAINT fk_reviews_order 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE product_images 
  ADD CONSTRAINT fk_product_images_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE inventory 
  ADD CONSTRAINT fk_inventory_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_categories 
  ADD CONSTRAINT fk_product_categories_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_categories 
  ADD CONSTRAINT fk_product_categories_category 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

ALTER TABLE product_collections 
  ADD CONSTRAINT fk_product_collections_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_collections 
  ADD CONSTRAINT fk_product_collections_collection 
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

ALTER TABLE products 
  ADD CONSTRAINT fk_products_brand 
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;

ALTER TABLE products 
  ADD CONSTRAINT fk_products_category 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE user_roles 
  ADD CONSTRAINT fk_user_roles_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- STEP 5: ADD PERFORMANCE INDEXES
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Cart and wishlist indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Product relationships indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_product_id ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON product_collections(collection_id);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);

-- Categories and collections indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_is_active ON collections(is_active);

-- User roles index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
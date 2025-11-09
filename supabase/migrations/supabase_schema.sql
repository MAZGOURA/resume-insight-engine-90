-- =====================================================
-- ESSENCE EXPRESS E-COMMERCE DATABASE SCHEMA
-- Complete SQL schema for Supabase project
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

-- Product category enum
CREATE TYPE product_category AS ENUM ('men', 'women', 'unisex');

-- Order status enum
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Notification type enum
CREATE TYPE notification_type AS ENUM ('order_update', 'product_restock', 'price_drop', 'wishlist_available');

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    image TEXT NOT NULL,
    category product_category NOT NULL,
    description TEXT NOT NULL,
    notes TEXT[] DEFAULT '{}',
    size VARCHAR(100) NOT NULL,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COLLECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT COLLECTIONS TABLE (Many-to-Many relationship)
-- =====================================================

CREATE TABLE IF NOT EXISTS product_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, collection_id)
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- =====================================================
-- WISHLIST TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER PROFILES TABLE (Extended user information)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contact messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- Enable RLS on contact messages table
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Contact messages policies
-- Only authenticated admin users can view contact messages
CREATE POLICY "Admins can view contact messages" ON contact_messages
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.email = 'admin@essenceexpress.com'
        )
    ));

-- Anyone can insert contact messages
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(name);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);

-- Product collections indexes
CREATE INDEX IF NOT EXISTS idx_product_collections_product_id ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON product_collections(collection_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for new tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

-- Anyone can read active products
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Only authenticated users can insert products (admin functionality)
CREATE POLICY "Authenticated users can insert products" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update products (admin functionality)
CREATE POLICY "Authenticated users can update products" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete products (admin functionality)
CREATE POLICY "Authenticated users can delete products" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Categories policies
-- Anyone can read active categories
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

-- Only authenticated users can insert categories (admin functionality)
CREATE POLICY "Authenticated users can insert categories" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update categories (admin functionality)
CREATE POLICY "Authenticated users can update categories" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete categories (admin functionality)
CREATE POLICY "Authenticated users can delete categories" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Collections policies
-- Anyone can read active collections
CREATE POLICY "Anyone can view active collections" ON collections
    FOR SELECT USING (is_active = true);

-- Only authenticated users can insert collections (admin functionality)
CREATE POLICY "Authenticated users can insert collections" ON collections
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update collections (admin functionality)
CREATE POLICY "Authenticated users can update collections" ON collections
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete collections (admin functionality)
CREATE POLICY "Authenticated users can delete collections" ON collections
    FOR DELETE USING (auth.role() = 'authenticated');

-- Product collections policies
-- Anyone can read product collections
CREATE POLICY "Anyone can view product collections" ON product_collections
    FOR SELECT USING (true);

-- Only authenticated users can insert product collections (admin functionality)
CREATE POLICY "Authenticated users can insert product collections" ON product_collections
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can delete product collections (admin functionality)
CREATE POLICY "Authenticated users can delete product collections" ON product_collections
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own orders
CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- ORDER ITEMS POLICIES
-- =====================================================

-- Users can only see order items for their own orders
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Users can only insert order items for their own orders
CREATE POLICY "Users can insert own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- =====================================================
-- PRODUCT REVIEWS POLICIES
-- =====================================================

-- Anyone can read reviews
CREATE POLICY "Anyone can view reviews" ON product_reviews
    FOR SELECT USING (true);

-- Users can only insert their own reviews
CREATE POLICY "Users can insert own reviews" ON product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own reviews
CREATE POLICY "Users can update own reviews" ON product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own reviews
CREATE POLICY "Users can delete own reviews" ON product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- WISHLIST POLICIES
-- =====================================================

-- Users can only see their own wishlist
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert to their own wishlist
CREATE POLICY "Users can insert to own wishlist" ON wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete from their own wishlist
CREATE POLICY "Users can delete from own wishlist" ON wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own notifications
CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view all profiles (for display purposes)
CREATE POLICY "Anyone can view profiles" ON profiles
    FOR SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to get product rating statistics
CREATE OR REPLACE FUNCTION get_product_rating(product_uuid UUID)
RETURNS TABLE(average_rating DECIMAL, total_reviews BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(ROUND(AVG(rating)::DECIMAL, 2), 0) as average_rating,
        COUNT(*) as total_reviews
    FROM product_reviews 
    WHERE product_id = product_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement product stock
CREATE OR REPLACE FUNCTION decrement_stock(product_uuid UUID, quantity_to_decrement INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT stock_quantity INTO current_stock 
    FROM products 
    WHERE id = product_uuid AND is_active = true;
    
    -- Check if enough stock available
    IF current_stock IS NULL OR current_stock < quantity_to_decrement THEN
        RETURN FALSE;
    END IF;
    
    -- Decrement stock
    UPDATE products 
    SET stock_quantity = stock_quantity - quantity_to_decrement,
        updated_at = NOW()
    WHERE id = product_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product stock
CREATE OR REPLACE FUNCTION increment_stock(product_uuid UUID, quantity_to_increment INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE products 
    SET stock_quantity = stock_quantity + quantity_to_increment,
        updated_at = NOW()
    WHERE id = product_uuid AND is_active = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    brand VARCHAR,
    stock_quantity INTEGER,
    price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.brand,
        p.stock_quantity,
        p.price
    FROM products p
    WHERE p.stock_quantity <= threshold 
    AND p.is_active = true
    ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create order with items
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_user_id UUID,
    p_shipping_address JSONB,
    p_items JSONB
)
RETURNS UUID AS $$
DECLARE
    order_id UUID;
    item JSONB;
    total_amount DECIMAL := 0;
    item_total DECIMAL;
BEGIN
    -- Calculate total amount
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT (item->>'quantity')::INTEGER * (item->>'price')::DECIMAL INTO item_total;
        total_amount := total_amount + item_total;
    END LOOP;
    
    -- Create order
    INSERT INTO orders (user_id, shipping_address, total_amount)
    VALUES (p_user_id, p_shipping_address, total_amount)
    RETURNING id INTO order_id;
    
    -- Create order items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (
            order_id,
            (item->>'product_id')::UUID,
            (item->>'quantity')::INTEGER,
            (item->>'price')::DECIMAL
        );
        
        -- Decrement stock
        PERFORM decrement_stock(
            (item->>'product_id')::UUID,
            (item->>'quantity')::INTEGER
        );
    END LOOP;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample products
INSERT INTO products (name, brand, price, image, category, description, notes, size, stock_quantity) VALUES
('Sauvage', 'Dior', 89.99, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=600&fit=crop', 'men', 'A fresh and woody fragrance that captures the spirit of adventure.', ARRAY['Bergamot', 'Ambroxan', 'Cedar'], '100ml', 50),
('Chanel No. 5', 'Chanel', 125.00, 'https://images.unsplash.com/photo-1596462502278-27bffd403df9?w=400&h=600&fit=crop', 'women', 'The timeless classic that defines feminine elegance.', ARRAY['Rose', 'Jasmine', 'Sandalwood'], '100ml', 30),
('Black Opium', 'Yves Saint Laurent', 95.50, 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=600&fit=crop', 'women', 'A bold and addictive fragrance with coffee and vanilla notes.', ARRAY['Coffee', 'Vanilla', 'White Flowers'], '90ml', 25),
('Bleu de Chanel', 'Chanel', 110.00, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=600&fit=crop', 'men', 'A fresh and aromatic fragrance for the modern man.', ARRAY['Grapefruit', 'Mint', 'Cedar'], '100ml', 40),
('Good Girl', 'Carolina Herrera', 88.75, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=600&fit=crop', 'women', 'A seductive and mysterious fragrance with dual personality.', ARRAY['Tuberose', 'Cocoa', 'Tonka Bean'], '80ml', 35),
('Acqua di Gio', 'Giorgio Armani', 92.25, 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=600&fit=crop', 'men', 'A fresh aquatic fragrance inspired by the Mediterranean.', ARRAY['Marine Notes', 'Bergamot', 'Cedar'], '100ml', 45),
('La Vie Est Belle', 'Lancôme', 98.00, 'https://images.unsplash.com/photo-1596462502278-27bffd403df9?w=400&h=600&fit=crop', 'women', 'A gourmand fragrance that celebrates the joy of life.', ARRAY['Iris', 'Praline', 'Vanilla'], '75ml', 20),
('Tom Ford Oud Wood', 'Tom Ford', 285.00, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=600&fit=crop', 'unisex', 'A luxurious and sophisticated oud fragrance.', ARRAY['Oud', 'Rosewood', 'Cardamom'], '50ml', 15),
('Flowerbomb', 'Viktor & Rolf', 105.50, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=600&fit=crop', 'women', 'An explosive floral fragrance that celebrates femininity.', ARRAY['Jasmine', 'Rose', 'Patchouli'], '90ml', 28),
('Creed Aventus', 'Creed', 350.00, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=600&fit=crop', 'men', 'A fruity and woody fragrance inspired by the dramatic life of a historic emperor.', ARRAY['Pineapple', 'Black Currant', 'Musk'], '100ml', 12);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for products with ratings
CREATE OR REPLACE VIEW products_with_ratings AS
SELECT 
    p.*,
    COALESCE(r.average_rating, 0) as average_rating,
    COALESCE(r.total_reviews, 0) as total_reviews
FROM products p
LEFT JOIN (
    SELECT 
        product_id,
        ROUND(AVG(rating)::DECIMAL, 2) as average_rating,
        COUNT(*) as total_reviews
    FROM product_reviews
    GROUP BY product_id
) r ON p.id = r.product_id
WHERE p.is_active = true;

-- View for order details with items
CREATE OR REPLACE VIEW order_details AS
SELECT 
    o.*,
    json_agg(
        json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', p.name,
            'product_image', p.image,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.quantity * oi.price
        )
    ) as items
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
GROUP BY o.id, o.user_id, o.status, o.total_amount, o.shipping_address, o.created_at, o.updated_at;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users for public data
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON product_reviews TO anon;
GRANT SELECT ON profiles TO anon;
GRANT EXECUTE ON FUNCTION get_product_rating(UUID) TO anon;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This completes the database schema setup
-- The database is now ready for the ANAS FRAGRANCES e-commerce application

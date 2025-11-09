-- =====================================================
-- ADMIN ROLE SYSTEM IMPLEMENTATION
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('client', 'admin', 'super_admin');

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'client';

-- Create admin users table for separate admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Admin users policies (only admins can access)
CREATE POLICY "Only admins can view admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only super admins can manage admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Admin sessions policies
CREATE POLICY "Admins can manage own sessions" ON admin_sessions
    FOR ALL USING (
        admin_id IN (
            SELECT id FROM admin_users 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Create default super admin user
INSERT INTO admin_users (email, password_hash, first_name, last_name, role) 
VALUES (
    'admin@essenceexpress.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Super',
    'Admin',
    'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Create functions for admin authentication
CREATE OR REPLACE FUNCTION authenticate_admin(
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS TABLE(
    admin_id UUID,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    role user_role,
    token VARCHAR
) AS $$
DECLARE
    admin_record RECORD;
    session_token VARCHAR;
BEGIN
    -- Find admin user
    SELECT * INTO admin_record
    FROM admin_users
    WHERE email = p_email 
    AND is_active = true
    AND password_hash = crypt(p_password, password_hash);
    
    IF admin_record IS NULL THEN
        RAISE EXCEPTION 'Invalid credentials';
    END IF;
    
    -- Generate session token
    session_token := encode(gen_random_bytes(32), 'base64');
    
    -- Create session
    INSERT INTO admin_sessions (admin_id, token, expires_at)
    VALUES (admin_record.id, session_token, NOW() + INTERVAL '24 hours');
    
    -- Update last login
    UPDATE admin_users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE id = admin_record.id;
    
    -- Return admin info
    RETURN QUERY
    SELECT 
        admin_record.id,
        admin_record.email,
        admin_record.first_name,
        admin_record.last_name,
        admin_record.role,
        session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate admin session
CREATE OR REPLACE FUNCTION validate_admin_session(p_token VARCHAR)
RETURNS TABLE(
    admin_id UUID,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    role user_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.first_name,
        au.last_name,
        au.role
    FROM admin_users au
    JOIN admin_sessions s ON au.id = s.admin_id
    WHERE s.token = p_token
    AND s.expires_at > NOW()
    AND au.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to logout admin
CREATE OR REPLACE FUNCTION logout_admin(p_token VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM admin_sessions WHERE token = p_token;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing policies to check for admin role
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- New product policies with role check
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Update order policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders, admins can view all" ON orders
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Grant permissions
GRANT EXECUTE ON FUNCTION authenticate_admin(VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION validate_admin_session(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION logout_admin(VARCHAR) TO anon;

-- Create admin analytics view
CREATE OR REPLACE VIEW admin_analytics AS
SELECT 
    COUNT(DISTINCT o.user_id) as total_customers,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT pr.id) as total_reviews,
    AVG(pr.rating) as average_rating
FROM orders o
FULL OUTER JOIN products p ON true
FULL OUTER JOIN product_reviews pr ON true;

-- Grant access to analytics view
GRANT SELECT ON admin_analytics TO authenticated;

SELECT 'Admin role system created successfully!' as status;

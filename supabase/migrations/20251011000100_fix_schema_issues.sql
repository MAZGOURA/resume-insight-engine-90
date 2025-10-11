-- Fix Schema Issues for Fragrance Finesse
-- This migration addresses issues found in the database schema

-- Add missing date_of_birth column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Ensure all app_role ENUM values are properly recognized
-- Note: The ENUM type already includes 'driver', but we need to ensure it's properly used

-- Fix foreign key relationships for better data integrity
-- Add missing foreign key constraints where needed

-- Update the user_roles table to ensure proper indexing
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role);

-- Fix the profiles table relationships
-- Only add constraint if it doesn't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- Ensure delivery_drivers table has proper foreign key
-- Only add constraint if it doesn't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'delivery_drivers_user_id_fkey' 
        AND table_name = 'delivery_drivers'
    ) THEN
        ALTER TABLE delivery_drivers 
        ADD CONSTRAINT delivery_drivers_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add a function to check if user is a driver (consistent with has_role for admins)
CREATE OR REPLACE FUNCTION is_driver(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM delivery_drivers WHERE user_id = _user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to be more consistent
-- Allow drivers to view their own profile
DROP POLICY IF EXISTS "Drivers can view their own profile" ON profiles;
CREATE POLICY "Drivers can view their own profile" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM delivery_drivers WHERE delivery_drivers.user_id = auth.uid() AND delivery_drivers.user_id = id) OR
        EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
    );

-- Allow drivers to update their own profile
DROP POLICY IF EXISTS "Drivers can update their own profile" ON profiles;
CREATE POLICY "Drivers can update their own profile" ON profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM delivery_drivers WHERE delivery_drivers.user_id = auth.uid() AND delivery_drivers.user_id = id) OR
        EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
    );

-- Ensure delivery drivers can be managed by admins
DROP POLICY IF EXISTS "Admins can manage delivery drivers" ON delivery_drivers;
CREATE POLICY "Admins can manage delivery drivers" ON delivery_drivers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Refresh the schema to ensure all changes are applied
-- This will help with proper type generation in Supabase
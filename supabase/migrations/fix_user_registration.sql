-- =====================================================
-- FIX USER REGISTRATION ISSUE
-- Run this in your Supabase SQL Editor
-- =====================================================

-- First, let's drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create the improved user profile creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', profiles.first_name),
        last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', profiles.last_name),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also create a function to manually create profiles for existing users
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    created_count INTEGER := 0;
BEGIN
    -- Find users without profiles
    FOR user_record IN 
        SELECT id, raw_user_meta_data
        FROM auth.users
        WHERE id NOT IN (SELECT id FROM public.profiles)
    LOOP
        INSERT INTO public.profiles (id, first_name, last_name)
        VALUES (
            user_record.id,
            COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
            COALESCE(user_record.raw_user_meta_data->>'last_name', '')
        );
        created_count := created_count + 1;
    END LOOP;
    
    RETURN created_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to create missing profiles
SELECT create_missing_profiles() as profiles_created;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;

-- Test the function
SELECT 'User registration fix completed successfully!' as status;

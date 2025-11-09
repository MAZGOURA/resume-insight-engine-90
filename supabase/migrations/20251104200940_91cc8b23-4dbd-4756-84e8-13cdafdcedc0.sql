-- Fix user_roles RLS policies to avoid recursion
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Simple policy: users can only view their own roles (no admin check here to avoid recursion)
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- For admin operations, they'll need to use service role key or we handle it differently
-- For now, let authenticated users insert/update their own roles (will be controlled at app level)
CREATE POLICY "System can manage roles"
  ON user_roles FOR ALL
  USING (false)
  WITH CHECK (false);
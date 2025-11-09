-- Populate missing profile data from full_name and auth.users
UPDATE profiles 
SET 
  first_name = COALESCE(first_name, NULLIF(SPLIT_PART(full_name, ' ', 1), '')),
  last_name = COALESCE(last_name, NULLIF(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1), ''))
WHERE first_name IS NULL OR last_name IS NULL;

-- Populate missing email from auth.users
UPDATE profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id AND p.email IS NULL;
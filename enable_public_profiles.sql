-- Enable public read access to profiles
-- This allows any user (authenticated or anon) to view other users' profiles (username, favorite team, etc.)
-- We purposely do NOT expose sensitive data if any (email is in auth.users, not usually here, but be careful).
-- The 'profiles' table usually contains: id, username, full_name, avatar_url, website, etc.

-- Drop existing select policy if it exists to clean up (optional but safer)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles; -- Logic is superseded by "everyone"

-- Create new policy
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING ( true );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

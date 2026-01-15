-- =================================================
-- AUTH SIGNAL TRIGGER
-- Run this to automatically create profiles on Sign Up
-- =================================================

-- 1. Create a function to handle new user insertion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, total_score)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email,
    0 -- Start with 0 points
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verify
SELECT 'Trigger Setup Complete' as status;

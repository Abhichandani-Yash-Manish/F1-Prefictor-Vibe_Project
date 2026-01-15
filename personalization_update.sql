-- =============================================
-- PERSONALIZATION SCHEMA UPDATE
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS favorite_team TEXT,
ADD COLUMN IF NOT EXISTS favorite_driver TEXT;

-- 2. Update the trigger function to capture these fields from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, total_score, favorite_team, favorite_driver)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email,
    0, -- Start score
    new.raw_user_meta_data->>'favorite_team',
    new.raw_user_meta_data->>'favorite_driver'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-Verify Trigger (Just to be safe, dropping/recreating trigger isn't strictly needed if function is updated, but good practice if signature changed - here it didn't)

-- Verify
SELECT 'Personalization Schema Updated' as status;

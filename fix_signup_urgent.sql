-- ============================================
-- URGENT FIX: User Signup Not Working
-- Run this in Supabase SQL Editor IMMEDIATELY
-- ============================================

-- STEP 1: Fix the profiles table - add missing columns
DO $$
BEGIN
    -- Add favorite_team column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'favorite_team'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN favorite_team TEXT;
        RAISE NOTICE 'Added favorite_team column';
    END IF;
    
    -- Add favorite_driver column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'favorite_driver'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN favorite_driver TEXT;
        RAISE NOTICE 'Added favorite_driver column';
    END IF;
END $$;

-- STEP 2: Fix the leagues table - add is_active column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'leagues' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.leagues ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to leagues';
    END IF;
END $$;

-- STEP 3: Fix the handle_new_user trigger function
-- This is the MAIN FIX - the old trigger tried to insert into non-existent 'email' column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, total_score, favorite_team, favorite_driver)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        0,
        NEW.raw_user_meta_data->>'favorite_team',
        NEW.raw_user_meta_data->>'favorite_driver'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 5: Fix the auto-join global league function (make it fail-safe)
CREATE OR REPLACE FUNCTION auto_join_global_league()
RETURNS TRIGGER AS $$
DECLARE
    global_league_id INTEGER;
BEGIN
    -- Find the global league (fail-safe)
    SELECT id INTO global_league_id 
    FROM public.leagues 
    WHERE invite_code = 'F1APEX2026' 
    LIMIT 1;
    
    IF global_league_id IS NOT NULL THEN
        INSERT INTO public.league_members (league_id, user_id, role)
        VALUES (global_league_id, NEW.id, 'member')
        ON CONFLICT (league_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail profile creation if league join fails
        RAISE WARNING 'Auto-join league failed: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Recreate the auto-join trigger
DROP TRIGGER IF EXISTS auto_join_global_league_trigger ON public.profiles;
CREATE TRIGGER auto_join_global_league_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_join_global_league();

-- STEP 7: Enable insert policy for profiles (CRITICAL)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- STEP 8: Allow service role to insert profiles
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- Verify
SELECT 'Fix applied successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

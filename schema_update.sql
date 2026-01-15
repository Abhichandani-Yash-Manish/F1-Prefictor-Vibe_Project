-- =============================================
-- FUTURE ENHANCEMENTS SCHEMA UPDATE
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. NOTIFICATIONS SYSTEM
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'rivalry_invite', 'league_invite', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- Internal URL to redirect to
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark read)"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- 2. ACHIEVEMENTS SYSTEM
-- 2. ACHIEVEMENTS SYSTEM
-- Drop existing tables and dependent views
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;

CREATE TABLE public.achievements (
    id TEXT PRIMARY KEY, -- e.g., 'first_win'
    code TEXT NOT NULL, -- Human readable code
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- Emoji or URL
    category TEXT DEFAULT 'general',
    points_required INTEGER DEFAULT 0
);

CREATE TABLE public.user_achievements (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- Enable RLS for Achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view achievements"
    ON public.achievements FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own unlocked achievements"
    ON public.user_achievements FOR SELECT
    USING (true); -- Public profiles can show achievements

-- 3. SEED INITIAL ACHIEVEMENTS
INSERT INTO public.achievements (id, code, name, description, icon, category) VALUES
('first_prediction', 'FIRST_PRED', 'Rookie Strategist', 'Submitted your first race prediction', '📝', 'prediction'),
('perfect_podium', 'PERFECT_3', 'Podium Perfetto', 'Correctly predicted P1, P2, and P3', '🏆', 'prediction'),
('rivalry_winner', 'RIVAL_WIN', 'Duel Master', 'Won your first head-to-head rivalry', '⚔️', 'social'),
('league_creator', 'LEAGUE_OWNER', 'Team Principal', 'Created your own league', '👔', 'social')
ON CONFLICT (id) DO NOTHING;

-- 4. ADD STREAK TRACKING TO PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- Verification
SELECT 'Schema Update Complete' as status;

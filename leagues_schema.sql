-- ============================================
-- FL-Predictor League System Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ====================================================
-- 1. CREATE ALL TABLES FIRST (No dependencies)
-- ====================================================

-- LEAGUES TABLE (Core League Information)
CREATE TABLE IF NOT EXISTS public.leagues (
    id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,         -- Discoverable in browse
    is_active BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 50,
    scoring_mode TEXT DEFAULT 'standard',    -- For future custom scoring
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    season_year INTEGER DEFAULT 2026
);

-- LEAGUE_MEMBERS TABLE (User Membership)
CREATE TABLE IF NOT EXISTS public.league_members (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES public.leagues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',              -- 'owner', 'admin', 'member'
    season_points INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(league_id, user_id)
);

-- LEAGUE_INVITES TABLE (Invitation Tracking)
CREATE TABLE IF NOT EXISTS public.league_invites (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES public.leagues(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES auth.users(id),
    invitee_email TEXT,                      -- Email for non-users
    invitee_id UUID REFERENCES auth.users(id), -- For existing users
    status TEXT DEFAULT 'pending',           -- 'pending', 'accepted', 'declined', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- ====================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ====================================================
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_invites ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ====================================================
CREATE INDEX IF NOT EXISTS idx_leagues_owner ON public.leagues(owner_id);
CREATE INDEX IF NOT EXISTS idx_leagues_invite_code ON public.leagues(invite_code);
CREATE INDEX IF NOT EXISTS idx_leagues_public ON public.leagues(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_league_members_league ON public.league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_user ON public.league_members(user_id);

CREATE INDEX IF NOT EXISTS idx_league_invites_invitee ON public.league_invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_league_invites_league ON public.league_invites(league_id);
CREATE INDEX IF NOT EXISTS idx_league_invites_status ON public.league_invites(status);

-- ====================================================
-- 4. RLS POLICIES FOR LEAGUES
-- ====================================================
CREATE POLICY "Public leagues viewable by everyone"
    ON public.leagues FOR SELECT
    USING (is_public = true OR EXISTS (
        SELECT 1 FROM public.league_members 
        WHERE league_id = leagues.id AND user_id = auth.uid()
    ) OR owner_id = auth.uid());

CREATE POLICY "Users can create leagues"
    ON public.leagues FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their leagues"
    ON public.leagues FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their leagues"
    ON public.leagues FOR DELETE
    USING (auth.uid() = owner_id);

-- ====================================================
-- 5. RLS POLICIES FOR LEAGUE_MEMBERS
-- ====================================================
CREATE POLICY "Members viewable by league members"
    ON public.league_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.league_members lm 
        WHERE lm.league_id = league_members.league_id AND lm.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.leagues l 
        WHERE l.id = league_members.league_id AND l.is_public = true
    ));

CREATE POLICY "Users can join leagues"
    ON public.league_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave leagues"
    ON public.league_members FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.leagues WHERE id = league_id AND owner_id = auth.uid()
    ));

CREATE POLICY "Owners can update member roles"
    ON public.league_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.leagues WHERE id = league_id AND owner_id = auth.uid()
    ));

-- ====================================================
-- 6. RLS POLICIES FOR LEAGUE_INVITES
-- ====================================================
CREATE POLICY "Users can view their invites"
    ON public.league_invites FOR SELECT
    USING (invitee_id = auth.uid() OR inviter_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.leagues WHERE id = league_id AND owner_id = auth.uid()
    ));

CREATE POLICY "League members can send invites"
    ON public.league_invites FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.league_members 
        WHERE league_id = league_invites.league_id AND user_id = auth.uid()
    ));

CREATE POLICY "Invitees can update invite status"
    ON public.league_invites FOR UPDATE
    USING (invitee_id = auth.uid());

CREATE POLICY "Inviters can delete invites"
    ON public.league_invites FOR DELETE
    USING (inviter_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.leagues WHERE id = league_id AND owner_id = auth.uid()
    ));

-- ====================================================
-- 7. HELPER FUNCTIONS
-- ====================================================

-- Generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Sync prediction points to leagues
CREATE OR REPLACE FUNCTION sync_league_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all league memberships for this user
    UPDATE public.league_members
    SET season_points = (
        SELECT COALESCE(SUM(p.points_total), 0)
        FROM public.predictions p
        JOIN public.races r ON p.race_id = r.id
        WHERE p.user_id = NEW.user_id
        AND EXTRACT(YEAR FROM r.race_time) = 2026
    )
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync points when predictions are updated
DROP TRIGGER IF EXISTS sync_league_points_trigger ON public.predictions;
CREATE TRIGGER sync_league_points_trigger
    AFTER INSERT OR UPDATE OF points_total ON public.predictions
    FOR EACH ROW
    EXECUTE FUNCTION sync_league_points();

-- ====================================================
-- 8. CREATE GLOBAL "F1 APEX CHAMPIONSHIP" LEAGUE
-- ====================================================
INSERT INTO public.leagues (owner_id, name, description, invite_code, is_public, max_members, season_year)
SELECT 
    (SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1),
    'F1 Apex Championship',
    'The official global championship! All F1 Apex members compete here. May the best predictor win! 🏆',
    'F1APEX2026',
    true,
    10000,
    2026
WHERE NOT EXISTS (
    SELECT 1 FROM public.leagues WHERE invite_code = 'F1APEX2026'
);

-- ====================================================
-- 9. AUTO-JOIN GLOBAL LEAGUE ON SIGNUP
-- ====================================================
CREATE OR REPLACE FUNCTION auto_join_global_league()
RETURNS TRIGGER AS $$
DECLARE
    global_league_id INTEGER;
BEGIN
    -- Find the global league
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-join global league when profile is created
DROP TRIGGER IF EXISTS auto_join_global_league_trigger ON public.profiles;
CREATE TRIGGER auto_join_global_league_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_join_global_league();

-- ====================================================
-- 10. ADD EXISTING USERS TO GLOBAL LEAGUE
-- ====================================================
INSERT INTO public.league_members (league_id, user_id, role, season_points)
SELECT 
    (SELECT id FROM public.leagues WHERE invite_code = 'F1APEX2026'),
    p.id,
    'member',
    COALESCE((
        SELECT SUM(pred.points_total) 
        FROM public.predictions pred 
        WHERE pred.user_id = p.id
    ), 0)
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.league_members lm 
    WHERE lm.user_id = p.id 
    AND lm.league_id = (SELECT id FROM public.leagues WHERE invite_code = 'F1APEX2026')
);

-- ====================================================
-- DONE! League system is ready 🏎️
-- ====================================================

-- VERIFICATION QUERIES:
-- SELECT * FROM public.leagues;
-- SELECT * FROM public.league_members;
-- SELECT COUNT(*) FROM public.league_members WHERE league_id = (SELECT id FROM public.leagues WHERE invite_code = 'F1APEX2026');

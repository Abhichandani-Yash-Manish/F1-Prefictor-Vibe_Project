-- ============================================
-- FL-Predictor Enhancements Schema
-- League Grading, Achievements, Activity Feed
-- Run this AFTER leagues_schema.sql and friends_and_chat_schema.sql
-- ============================================

-- ====================================================
-- 1. LEAGUE PREDICTION GRADES TABLE
-- Allows league admins to grade subjective predictions
-- ====================================================
CREATE TABLE IF NOT EXISTS public.league_prediction_grades (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES public.leagues(id) ON DELETE CASCADE,
    prediction_id INTEGER REFERENCES public.predictions(id) ON DELETE CASCADE,
    grader_id UUID REFERENCES auth.users(id),
    wild_points INTEGER DEFAULT 0,        -- Points for wild prediction (0, 2, 5, 13)
    flop_points INTEGER DEFAULT 0,        -- Points for biggest flop prediction
    surprise_points INTEGER DEFAULT 0,    -- Points for biggest surprise prediction
    notes TEXT,                           -- Optional grader notes
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- One grade per prediction per league
    UNIQUE(league_id, prediction_id)
);

-- Enable RLS
ALTER TABLE public.league_prediction_grades ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "League members can view grades"
    ON public.league_prediction_grades FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.league_members 
        WHERE league_id = league_prediction_grades.league_id AND user_id = auth.uid()
    ));

CREATE POLICY "League admins can grade"
    ON public.league_prediction_grades FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.league_members 
        WHERE league_id = league_prediction_grades.league_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin', 'grader')
    ));

CREATE POLICY "Graders can update their grades"
    ON public.league_prediction_grades FOR UPDATE
    USING (grader_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.league_members 
        WHERE league_id = league_prediction_grades.league_id 
        AND user_id = auth.uid() 
        AND role = 'owner'
    ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_league_grades_league ON public.league_prediction_grades(league_id);
CREATE INDEX IF NOT EXISTS idx_league_grades_prediction ON public.league_prediction_grades(prediction_id);

-- ====================================================
-- 2. ACHIEVEMENTS TABLE (Available Achievements)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,           -- 'first_prediction', 'streak_5'
    name TEXT NOT NULL,                  -- Display name
    description TEXT,                    -- How to earn it
    icon TEXT DEFAULT '🏆',              -- Emoji icon
    points_value INTEGER DEFAULT 0,      -- Bonus points when earned
    category TEXT DEFAULT 'general',     -- 'prediction', 'social', 'accuracy', 'streak'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO public.achievements (code, name, description, icon, points_value, category) VALUES
    ('first_prediction', 'First Blood', 'Make your first prediction', '🎯', 5, 'prediction'),
    ('predictions_10', 'Getting Started', 'Submit 10 predictions', '📊', 10, 'prediction'),
    ('predictions_50', 'Veteran Predictor', 'Submit 50 predictions', '🎖️', 25, 'prediction'),
    ('streak_3', 'On Fire', 'Score points in 3 consecutive races', '🔥', 15, 'streak'),
    ('streak_5', 'Hot Streak', 'Score points in 5 consecutive races', '🌟', 30, 'streak'),
    ('streak_10', 'Untouchable', 'Score points in 10 consecutive races', '👑', 50, 'streak'),
    ('pole_sniper', 'Pole Sniper', 'Correctly predict pole position 3 times', '🎯', 20, 'accuracy'),
    ('race_winner', 'Crystal Ball', 'Correctly predict race winner 3 times', '🔮', 25, 'accuracy'),
    ('podium_master', 'Podium Master', 'Predict exact podium correctly', '🏅', 50, 'accuracy'),
    ('wild_card_king', 'Wild Card King', 'Win Wild Prediction bonus 3 times', '🃏', 30, 'prediction'),
    ('first_friend', 'Social Starter', 'Add your first friend', '👋', 5, 'social'),
    ('friends_10', 'Social Butterfly', 'Have 10 friends', '🦋', 15, 'social'),
    ('first_league', 'Team Player', 'Join your first league', '🏆', 5, 'social'),
    ('leagues_5', 'League Legend', 'Be a member of 5 leagues', '⭐', 20, 'social'),
    ('league_creator', 'Commissioner', 'Create your first league', '👔', 10, 'social'),
    ('rivalry_winner', 'Rival Crusher', 'Win a rivalry', '⚔️', 20, 'social'),
    ('season_podium', 'Season Champion', 'Finish in top 3 of a league', '🏆', 100, 'accuracy')
ON CONFLICT (code) DO NOTHING;

-- ====================================================
-- 3. USER ACHIEVEMENTS TABLE (Earned by Users)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES public.achievements(id) ON DELETE CASCADE,
    league_id INTEGER REFERENCES public.leagues(id) ON DELETE SET NULL,  -- Optional: league-specific
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- One achievement per user (per league if applicable)
    UNIQUE(user_id, achievement_id, league_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view achievements"
    ON public.user_achievements FOR SELECT
    USING (true);

CREATE POLICY "System can insert achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);

-- ====================================================
-- 4. ACTIVITY FEED TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,         -- 'prediction', 'achievement', 'joined_league', 'friend_added', etc.
    target_type TEXT,                    -- 'league', 'race', 'user', 'achievement'
    target_id INTEGER,                   -- ID of the related entity
    metadata JSONB DEFAULT '{}',         -- Flexible data storage
    is_public BOOLEAN DEFAULT true,      -- Whether others can see this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view public activity"
    ON public.activity_feed FOR SELECT
    USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "System can insert activity"
    ON public.activity_feed FOR INSERT
    WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON public.activity_feed(created_at DESC);

-- ====================================================
-- 5. FUNCTION: Calculate League-Specific Points
-- ====================================================
CREATE OR REPLACE FUNCTION calculate_league_points(p_league_id INTEGER, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER := 0;
    auto_points INTEGER := 0;
    manual_points INTEGER := 0;
BEGIN
    -- Get automatic points from predictions
    SELECT COALESCE(SUM(p.points_total), 0) INTO auto_points
    FROM public.predictions p
    JOIN public.races r ON p.race_id = r.id
    WHERE p.user_id = p_user_id
    AND EXTRACT(YEAR FROM r.race_time) = 2026;
    
    -- Get manual/league-specific grades
    SELECT COALESCE(SUM(lpg.wild_points + lpg.flop_points + lpg.surprise_points), 0) INTO manual_points
    FROM public.league_prediction_grades lpg
    JOIN public.predictions p ON lpg.prediction_id = p.id
    WHERE lpg.league_id = p_league_id
    AND p.user_id = p_user_id;
    
    RETURN auto_points + manual_points;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- 6. FUNCTION: Award Achievement
-- ====================================================
CREATE OR REPLACE FUNCTION award_achievement(
    p_user_id UUID, 
    p_achievement_code TEXT, 
    p_league_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_achievement_id INTEGER;
BEGIN
    -- Get achievement ID
    SELECT id INTO v_achievement_id 
    FROM public.achievements 
    WHERE code = p_achievement_code AND is_active = true;
    
    IF v_achievement_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Insert achievement (ignore if already exists)
    INSERT INTO public.user_achievements (user_id, achievement_id, league_id)
    VALUES (p_user_id, v_achievement_id, p_league_id)
    ON CONFLICT (user_id, achievement_id, league_id) DO NOTHING;
    
    -- Log activity
    INSERT INTO public.activity_feed (user_id, activity_type, target_type, target_id, metadata)
    VALUES (
        p_user_id, 
        'achievement_earned', 
        'achievement', 
        v_achievement_id,
        jsonb_build_object('league_id', p_league_id)
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- 7. TRIGGER: First Prediction Achievement
-- ====================================================
CREATE OR REPLACE FUNCTION check_prediction_achievements()
RETURNS TRIGGER AS $$
DECLARE
    pred_count INTEGER;
BEGIN
    -- Count user's predictions
    SELECT COUNT(*) INTO pred_count
    FROM public.predictions
    WHERE user_id = NEW.user_id;
    
    -- First prediction
    IF pred_count = 1 THEN
        PERFORM award_achievement(NEW.user_id, 'first_prediction');
    END IF;
    
    -- 10 predictions
    IF pred_count = 10 THEN
        PERFORM award_achievement(NEW.user_id, 'predictions_10');
    END IF;
    
    -- 50 predictions
    IF pred_count = 50 THEN
        PERFORM award_achievement(NEW.user_id, 'predictions_50');
    END IF;
    
    -- Log activity
    INSERT INTO public.activity_feed (user_id, activity_type, target_type, target_id)
    VALUES (NEW.user_id, 'prediction_submitted', 'race', NEW.race_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prediction_achievement_trigger ON public.predictions;
CREATE TRIGGER prediction_achievement_trigger
    AFTER INSERT ON public.predictions
    FOR EACH ROW
    EXECUTE FUNCTION check_prediction_achievements();

-- ====================================================
-- 8. TRIGGER: First Friend Achievement
-- ====================================================
CREATE OR REPLACE FUNCTION check_friend_achievements()
RETURNS TRIGGER AS $$
DECLARE
    friend_count INTEGER;
    the_user_id UUID;
BEGIN
    -- Only trigger on accepted friendships
    IF NEW.status != 'accepted' THEN
        RETURN NEW;
    END IF;
    
    -- Check for both users in friendship
    FOR the_user_id IN 
        SELECT unnest(ARRAY[NEW.user_id, NEW.friend_id])
    LOOP
        SELECT COUNT(*) INTO friend_count
        FROM public.friendships
        WHERE (user_id = the_user_id OR friend_id = the_user_id)
        AND status = 'accepted';
        
        IF friend_count = 1 THEN
            PERFORM award_achievement(the_user_id, 'first_friend');
        END IF;
        
        IF friend_count = 10 THEN
            PERFORM award_achievement(the_user_id, 'friends_10');
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS friend_achievement_trigger ON public.friendships;
CREATE TRIGGER friend_achievement_trigger
    AFTER UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION check_friend_achievements();

-- ====================================================
-- 9. TRIGGER: League Join Achievement
-- ====================================================
CREATE OR REPLACE FUNCTION check_league_achievements()
RETURNS TRIGGER AS $$
DECLARE
    league_count INTEGER;
    is_owner BOOLEAN;
BEGIN
    -- Count user's leagues
    SELECT COUNT(*) INTO league_count
    FROM public.league_members
    WHERE user_id = NEW.user_id;
    
    -- First league
    IF league_count = 1 THEN
        PERFORM award_achievement(NEW.user_id, 'first_league');
    END IF;
    
    -- 5 leagues
    IF league_count = 5 THEN
        PERFORM award_achievement(NEW.user_id, 'leagues_5');
    END IF;
    
    -- League creator
    IF NEW.role = 'owner' THEN
        PERFORM award_achievement(NEW.user_id, 'league_creator');
    END IF;
    
    -- Log activity
    INSERT INTO public.activity_feed (user_id, activity_type, target_type, target_id)
    VALUES (NEW.user_id, 'joined_league', 'league', NEW.league_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS league_achievement_trigger ON public.league_members;
CREATE TRIGGER league_achievement_trigger
    AFTER INSERT ON public.league_members
    FOR EACH ROW
    EXECUTE FUNCTION check_league_achievements();

-- ====================================================
-- 10. VIEW: User Profile with Stats
-- ====================================================
CREATE OR REPLACE VIEW public.user_profile_stats AS
SELECT 
    p.id,
    p.username,
    p.total_score,
    (SELECT COUNT(*) FROM public.predictions WHERE user_id = p.id) as prediction_count,
    (SELECT COUNT(*) FROM public.friendships WHERE (user_id = p.id OR friend_id = p.id) AND status = 'accepted') as friend_count,
    (SELECT COUNT(*) FROM public.league_members WHERE user_id = p.id) as league_count,
    (SELECT COUNT(*) FROM public.user_achievements WHERE user_id = p.id) as achievement_count
FROM public.profiles p;

-- ====================================================
-- DONE! Enhancements schema is ready 🚀
-- ====================================================

-- VERIFICATION QUERIES:
-- SELECT * FROM public.achievements;
-- SELECT * FROM public.user_achievements;
-- SELECT * FROM public.activity_feed ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM public.user_profile_stats;

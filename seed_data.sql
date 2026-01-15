-- F1 APEX - COMPLETE DEMO DATA SEED SCRIPT
-- Run this in Supabase SQL Editor
-- 
-- IMPORTANT: This script uses YOUR actual user ID to create demo data
-- that will be visible when you're logged in.

-- ====================================================
-- 1. CLEAR EXISTING DATA
-- ====================================================
DELETE FROM public.predictions;
DELETE FROM public.rivalries;
DELETE FROM public.league_members;
DELETE FROM public.league_invites;
DELETE FROM public.friendships;
DELETE FROM public.leagues;
DELETE FROM public.races;

-- ====================================================
-- 2. INSERT RACE DATA (2026 F1 Calendar)
-- Dates adjusted so some are in the past, one is "next"
-- ====================================================
INSERT INTO public.races (name, circuit, quali_time, race_time, is_sprint, is_sprint_weekend) VALUES
-- PAST RACES (so calendar shows completed races)
('Australian Grand Prix', 'Albert Park Circuit', '2026-01-04 06:00:00+00', '2026-01-05 05:00:00+00', false, false),
('Bahrain Grand Prix', 'Bahrain International Circuit', '2026-01-08 15:00:00+00', '2026-01-09 15:00:00+00', false, false),
('Saudi Arabian Grand Prix', 'Jeddah Corniche Circuit', '2026-01-11 17:00:00+00', '2026-01-12 17:00:00+00', false, false),

-- NEXT RACE (happening very soon - demo countdown)
('Japanese Grand Prix', 'Suzuka International Racing Course', '2026-01-18 06:00:00+00', '2026-01-19 05:00:00+00', false, false),

-- FUTURE RACES
('Chinese Grand Prix', 'Shanghai International Circuit', '2026-01-25 07:00:00+00', '2026-01-26 07:00:00+00', true, true),
('Miami Grand Prix', 'Miami International Autodrome', '2026-02-01 20:00:00+00', '2026-02-02 20:00:00+00', true, true),
('Emilia Romagna Grand Prix', 'Autodromo Enzo e Dino Ferrari', '2026-02-08 14:00:00+00', '2026-02-09 13:00:00+00', false, false),
('Monaco Grand Prix', 'Circuit de Monaco', '2026-02-15 14:00:00+00', '2026-02-16 13:00:00+00', false, false),
('Spanish Grand Prix', 'Circuit de Barcelona-Catalunya', '2026-02-22 14:00:00+00', '2026-02-23 13:00:00+00', false, false),
('Canadian Grand Prix', 'Circuit Gilles Villeneuve', '2026-03-01 19:00:00+00', '2026-03-02 18:00:00+00', false, false),
('Austrian Grand Prix', 'Red Bull Ring', '2026-03-08 13:00:00+00', '2026-03-09 13:00:00+00', true, true),
('British Grand Prix', 'Silverstone Circuit', '2026-03-15 14:00:00+00', '2026-03-16 14:00:00+00', false, false),
('Belgian Grand Prix', 'Circuit de Spa-Francorchamps', '2026-03-29 14:00:00+00', '2026-03-30 13:00:00+00', false, false),
('Hungarian Grand Prix', 'Hungaroring', '2026-04-05 14:00:00+00', '2026-04-06 13:00:00+00', false, false),
('Dutch Grand Prix', 'Circuit Zandvoort', '2026-04-19 13:00:00+00', '2026-04-20 13:00:00+00', false, false),
('Italian Grand Prix', 'Autodromo Nazionale Monza', '2026-04-26 14:00:00+00', '2026-04-27 13:00:00+00', false, false),
('Azerbaijan Grand Prix', 'Baku City Circuit', '2026-05-10 11:00:00+00', '2026-05-11 11:00:00+00', false, false),
('Singapore Grand Prix', 'Marina Bay Street Circuit', '2026-05-24 12:00:00+00', '2026-05-25 12:00:00+00', false, false),
('United States Grand Prix', 'Circuit of the Americas', '2026-06-07 19:00:00+00', '2026-06-08 19:00:00+00', true, true),
('Mexico City Grand Prix', 'Autodromo Hermanos Rodriguez', '2026-06-14 20:00:00+00', '2026-06-15 20:00:00+00', false, false),
('São Paulo Grand Prix', 'Interlagos Circuit', '2026-06-28 17:00:00+00', '2026-06-29 17:00:00+00', true, true),
('Las Vegas Grand Prix', 'Las Vegas Strip Circuit', '2026-07-12 06:00:00+00', '2026-07-13 06:00:00+00', false, false),
('Qatar Grand Prix', 'Lusail International Circuit', '2026-07-19 17:00:00+00', '2026-07-20 16:00:00+00', true, true),
('Abu Dhabi Grand Prix', 'Yas Marina Circuit', '2026-07-26 13:00:00+00', '2026-07-27 13:00:00+00', false, false);

-- ====================================================
-- 3. UPDATE ALL USER PROFILES WITH VARIED SCORES
-- This creates a leaderboard with rankings
-- ====================================================
-- First, set everyone to a random base score
UPDATE public.profiles SET total_score = floor(random() * 200 + 150)::int;

-- Then boost the first user (you) to top of leaderboard
UPDATE public.profiles 
SET total_score = 487, is_admin = true 
WHERE id = (SELECT id FROM public.profiles LIMIT 1);

-- ====================================================
-- 4. CREATE LEAGUES USING ACTUAL USER IDS
-- ====================================================
DO $$
DECLARE
    first_user_id UUID;
    second_user_id UUID;
BEGIN
    -- Get actual user IDs from profiles
    SELECT id INTO first_user_id FROM public.profiles LIMIT 1;
    SELECT id INTO second_user_id FROM public.profiles LIMIT 1 OFFSET 1;
    
    -- Only proceed if we have at least one user
    IF first_user_id IS NOT NULL THEN
        -- Create leagues
        INSERT INTO public.leagues (name, description, owner_id, is_public, max_members, invite_code) VALUES
        ('F1 APEX Championship', 'The official global prediction championship!', first_user_id, true, 10000, 'APEX2026'),
        ('Red Bull Racing Fans', 'For true Red Bull supporters 🦬', first_user_id, true, 100, 'REDBULL'),
        ('Ferrari Tifosi Club', 'Forza Ferrari! 🏎️❤️', first_user_id, true, 100, 'FERRARI'),
        ('McLaren Papaya Army', 'Orange is the new fast 🧡', first_user_id, true, 100, 'PAPAYA24'),
        ('Elite Predictors', 'Top predictors only 🏆', first_user_id, false, 20, 'ELITE99');
        
        -- Add owner to their leagues
        INSERT INTO public.league_members (league_id, user_id, role)
        SELECT id, first_user_id, 'owner' 
        FROM public.leagues WHERE owner_id = first_user_id;
        
        -- If we have a second user, add them too
        IF second_user_id IS NOT NULL THEN
            INSERT INTO public.league_members (league_id, user_id, role)
            SELECT id, second_user_id, 'member'
            FROM public.leagues WHERE owner_id = first_user_id;
        END IF;
    END IF;
END $$;

-- ====================================================
-- 5. CREATE RIVALRIES USING ACTUAL USER IDS
-- ====================================================
DO $$
DECLARE
    user1 RECORD;
    user2 RECORD;
BEGIN
    -- Get first two users
    SELECT id, username INTO user1 FROM public.profiles LIMIT 1;
    SELECT id, username INTO user2 FROM public.profiles LIMIT 1 OFFSET 1;
    
    -- Create rivalry if we have 2 users
    IF user1.id IS NOT NULL AND user2.id IS NOT NULL THEN
        INSERT INTO public.rivalries (
            challenger_id, challenger_name, 
            opponent_id, opponent_name, 
            challenger_driver, opponent_driver, 
            race_duration, races_completed, 
            challenger_points, opponent_points, 
            status
        ) VALUES (
            user1.id, COALESCE(user1.username, 'Predictor1'),
            user2.id, COALESCE(user2.username, 'Predictor2'),
            'Max Verstappen', 'Lewis Hamilton',
            5, 3,
            145, 138,
            'active'
        );
    END IF;
END $$;

-- ====================================================
-- 6. CREATE FRIENDSHIPS USING ACTUAL USER IDS
-- ====================================================
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
BEGIN
    SELECT id INTO user1_id FROM public.profiles LIMIT 1;
    SELECT id INTO user2_id FROM public.profiles LIMIT 1 OFFSET 1;
    
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        INSERT INTO public.friendships (user_id, friend_id, status, accepted_at) VALUES
        (user1_id, user2_id, 'accepted', NOW());
    END IF;
END $$;

-- ====================================================
-- 7. CREATE PREDICTIONS FOR PAST RACES
-- ====================================================
DO $$
DECLARE
    user1_id UUID;
    race_record RECORD;
BEGIN
    SELECT id INTO user1_id FROM public.profiles LIMIT 1;
    
    IF user1_id IS NOT NULL THEN
        -- Add predictions for past races
        FOR race_record IN SELECT id FROM public.races WHERE race_time < NOW() LIMIT 3 LOOP
            INSERT INTO public.predictions (
                user_id, race_id, 
                quali_p1_driver, quali_p2_driver, quali_p3_driver,
                race_p1_driver, race_p2_driver, race_p3_driver,
                wild_prediction, biggest_flop, biggest_surprise,
                points_total, manual_score
            ) VALUES (
                user1_id, race_record.id,
                'Max Verstappen', 'Charles Leclerc', 'Lando Norris',
                'Max Verstappen', 'Lewis Hamilton', 'Charles Leclerc',
                'Dramatic last lap battle', 'Perez struggles', 'Piastri podium',
                75, 10
            ) ON CONFLICT (user_id, race_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- ====================================================
-- VERIFICATION
-- ====================================================
SELECT 'SEED DATA COMPLETE! 🏎️' as status;

SELECT 
    (SELECT COUNT(*) FROM public.races) as races,
    (SELECT COUNT(*) FROM public.profiles WHERE total_score > 0) as users_with_scores,
    (SELECT COUNT(*) FROM public.leagues) as leagues,
    (SELECT COUNT(*) FROM public.rivalries) as rivalries,
    (SELECT COUNT(*) FROM public.friendships) as friendships,
    (SELECT COUNT(*) FROM public.predictions) as predictions;

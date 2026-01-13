-- ============================================
-- FL-Predictor Friends & Chat System Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ====================================================
-- 1. FRIENDSHIPS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS public.friendships (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',  -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    -- Ensure no duplicate friendships (either direction)
    UNIQUE(user_id, friend_id),
    -- Prevent self-friending
    CHECK (user_id != friend_id)
);

-- Enable Row Level Security
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policies for friendships
CREATE POLICY "Users can view their own friendships"
    ON public.friendships FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests"
    ON public.friendships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of"
    ON public.friendships FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their friendships"
    ON public.friendships FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- ====================================================
-- 2. LEAGUE MESSAGES TABLE (Chat)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.league_messages (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES public.leagues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'chat',  -- 'chat', 'prediction', 'system', 'reaction_race'
    race_id INTEGER REFERENCES public.races(id),  -- Optional: link to specific race
    reply_to_id INTEGER REFERENCES public.league_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    is_pinned BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    -- Limit message length
    CHECK (length(content) <= 1000)
);

-- Enable Row Level Security
ALTER TABLE public.league_messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "League members can view messages"
    ON public.league_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.league_members 
        WHERE league_id = league_messages.league_id AND user_id = auth.uid()
    ));

CREATE POLICY "League members can send messages"
    ON public.league_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.league_members 
            WHERE league_id = league_messages.league_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages"
    ON public.league_messages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
    ON public.league_messages FOR DELETE
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.leagues 
        WHERE id = league_messages.league_id AND owner_id = auth.uid()
    ));

-- Indexes for chat performance
CREATE INDEX IF NOT EXISTS idx_league_messages_league ON public.league_messages(league_id);
CREATE INDEX IF NOT EXISTS idx_league_messages_user ON public.league_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_league_messages_created ON public.league_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_league_messages_race ON public.league_messages(race_id) WHERE race_id IS NOT NULL;

-- ====================================================
-- 3. MESSAGE REACTIONS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES public.league_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,  -- emoji: '🏎️', '🔥', '😂', '👍', '💀', '🏆'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- One reaction type per user per message
    UNIQUE(message_id, user_id, reaction)
);

-- Enable Row Level Security
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for reactions
CREATE POLICY "Anyone in league can view reactions"
    ON public.message_reactions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.league_messages lm
        JOIN public.league_members mem ON mem.league_id = lm.league_id
        WHERE lm.id = message_reactions.message_id AND mem.user_id = auth.uid()
    ));

CREATE POLICY "Users can add reactions"
    ON public.message_reactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
    ON public.message_reactions FOR DELETE
    USING (auth.uid() = user_id);

-- Index for reactions
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);

-- ====================================================
-- 4. ENABLE SUPABASE REALTIME FOR CHAT
-- ====================================================
-- This enables real-time subscriptions for the chat tables

ALTER PUBLICATION supabase_realtime ADD TABLE public.league_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- ====================================================
-- 5. HELPER FUNCTION: Get Friend Count
-- ====================================================
CREATE OR REPLACE FUNCTION get_friend_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM public.friendships 
        WHERE status = 'accepted' 
        AND (user_id = target_user_id OR friend_id = target_user_id)
    );
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- 6. HELPER FUNCTION: Check Mutual Friends
-- ====================================================
CREATE OR REPLACE FUNCTION get_mutual_friends(user1_id UUID, user2_id UUID)
RETURNS TABLE(friend_id UUID, username TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT f1.friend_id, p.username
    FROM (
        SELECT CASE WHEN user_id = user1_id THEN friend_id ELSE user_id END AS friend_id
        FROM public.friendships
        WHERE (user_id = user1_id OR friend_id = user1_id) AND status = 'accepted'
    ) f1
    JOIN (
        SELECT CASE WHEN user_id = user2_id THEN friend_id ELSE user_id END AS friend_id
        FROM public.friendships
        WHERE (user_id = user2_id OR friend_id = user2_id) AND status = 'accepted'
    ) f2 ON f1.friend_id = f2.friend_id
    JOIN public.profiles p ON p.id = f1.friend_id;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- 7. VIEW: Friends List with Profile Info
-- ====================================================
CREATE OR REPLACE VIEW public.friends_view AS
SELECT 
    f.id,
    f.user_id,
    f.friend_id,
    f.status,
    f.created_at,
    f.accepted_at,
    p.username AS friend_username,
    p.total_score AS friend_score
FROM public.friendships f
JOIN public.profiles p ON (
    CASE 
        WHEN f.user_id = auth.uid() THEN f.friend_id = p.id
        ELSE f.user_id = p.id
    END
)
WHERE f.user_id = auth.uid() OR f.friend_id = auth.uid();

-- ====================================================
-- DONE! Friends & Chat system is ready 🏎️
-- ====================================================

-- VERIFICATION QUERIES:
-- SELECT * FROM public.friendships LIMIT 5;
-- SELECT * FROM public.league_messages LIMIT 5;
-- SELECT get_friend_count('your-user-id-here');

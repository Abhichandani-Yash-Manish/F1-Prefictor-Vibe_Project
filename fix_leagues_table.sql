-- ============================================
-- Fix: Add missing columns to leagues table
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add is_active column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leagues' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.leagues ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to leagues table';
    ELSE
        RAISE NOTICE 'is_active column already exists';
    END IF;
END $$;

-- Add scoring_mode column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leagues' 
        AND column_name = 'scoring_mode'
    ) THEN
        ALTER TABLE public.leagues ADD COLUMN scoring_mode TEXT DEFAULT 'standard';
        RAISE NOTICE 'Added scoring_mode column to leagues table';
    ELSE
        RAISE NOTICE 'scoring_mode column already exists';
    END IF;
END $$;

-- Add season_year column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leagues' 
        AND column_name = 'season_year'
    ) THEN
        ALTER TABLE public.leagues ADD COLUMN season_year INTEGER DEFAULT 2026;
        RAISE NOTICE 'Added season_year column to leagues table';
    ELSE
        RAISE NOTICE 'season_year column already exists';
    END IF;
END $$;

-- Verify the columns exist now
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'leagues'
ORDER BY ordinal_position;

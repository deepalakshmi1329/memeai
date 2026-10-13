-- ====================================================================
-- MemeMind AI — Supabase PostgreSQL Database Schema
-- ====================================================================
-- This schema powers persistent storage for memes, search history,
-- user favorites, ratings, and analytics. Run this in the Supabase
-- SQL Editor (https://supabase.com/dashboard/project/_/sql).

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Memes Table (Stores saved & AI-generated memes)
CREATE TABLE IF NOT EXISTS memes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Optional user ID if using Supabase Auth (NULL for guest users)
    scenario TEXT NOT NULL,
    caption TEXT,
    media_url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'gif')),
    result_type VARCHAR(20) NOT NULL CHECK (result_type IN ('existing', 'generated')),
    provider VARCHAR(50) DEFAULT 'internet',
    provider_id TEXT,
    source_url TEXT,
    storage_path TEXT,
    humor_style VARCHAR(50) DEFAULT 'relatable',
    relevance_score INTEGER DEFAULT 85,
    reasoning TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memes_media_type ON memes (media_type);
CREATE INDEX IF NOT EXISTS idx_memes_is_favorite ON memes (is_favorite);

-- 2. Search History Table (Logs user scenario queries and matched memes)
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    scenario TEXT NOT NULL,
    humor_style VARCHAR(50) DEFAULT 'relatable',
    format_preference VARCHAR(20) DEFAULT 'all',
    selected_meme_id UUID REFERENCES memes(id) ON DELETE SET NULL,
    media_url TEXT,
    media_type VARCHAR(10) CHECK (media_type IN ('image', 'gif')),
    result_type VARCHAR(20) CHECK (result_type IN ('existing', 'generated')),
    candidate_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history (created_at DESC);

-- 3. Meme Ratings & Feedback Table
CREATE TABLE IF NOT EXISTS meme_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
    scenario TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_positive BOOLEAN,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_ratings ENABLE ROW LEVEL SECURITY;

-- 5. Public / Guest Read & Write Policies (Safe for guest mode & personal apps)
CREATE POLICY "Public Read Access on Memes" 
    ON memes FOR SELECT 
    USING (true);

CREATE POLICY "Public Insert Access on Memes" 
    ON memes FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public Update Access on Memes" 
    ON memes FOR UPDATE 
    USING (true);

CREATE POLICY "Public Delete Access on Memes" 
    ON memes FOR DELETE 
    USING (true);

CREATE POLICY "Public Read Access on Search History" 
    ON search_history FOR SELECT 
    USING (true);

CREATE POLICY "Public Insert Access on Search History" 
    ON search_history FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public Delete Access on Search History" 
    ON search_history FOR DELETE 
    USING (true);

CREATE POLICY "Public Insert Access on Meme Ratings" 
    ON meme_ratings FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public Read Access on Meme Ratings" 
    ON meme_ratings FOR SELECT 
    USING (true);

-- 6. Supabase Storage Bucket Setup (Run in Storage Settings or SQL)
-- To store AI-generated memes:
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('generated-memes', 'generated-memes', true) 
-- ON CONFLICT (id) DO NOTHING;

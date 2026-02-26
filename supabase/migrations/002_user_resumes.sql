-- ==================================================
-- Migration: 002_user_resumes.sql
-- Feature: F-EXT-004 - User Resume Persistence
-- ==================================================
-- Purpose: Persist user's master CV in Supabase so the
-- Chrome Extension can access it via API (localStorage is
-- not accessible cross-origin from the extension).

CREATE TABLE IF NOT EXISTS user_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mi CV',
  original_text TEXT NOT NULL,
  parsed_content JSONB NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)  -- Un CV master por usuario (V1)
);

-- ==============================================
-- Indexes for performance
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON user_resumes(user_id);

-- ==============================================
-- RLS Policies
-- ==============================================
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own resume
DROP POLICY IF EXISTS "Users can read own resume" ON user_resumes;
CREATE POLICY "Users can read own resume"
ON user_resumes FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own resume
DROP POLICY IF EXISTS "Users can create own resume" ON user_resumes;
CREATE POLICY "Users can create own resume"
ON user_resumes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own resume
DROP POLICY IF EXISTS "Users can update own resume" ON user_resumes;
CREATE POLICY "Users can update own resume"
ON user_resumes FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own resume
DROP POLICY IF EXISTS "Users can delete own resume" ON user_resumes;
CREATE POLICY "Users can delete own resume"
ON user_resumes FOR DELETE
USING (auth.uid() = user_id);

-- ==============================================
-- Trigger: Keep updated_at current on every update
-- ==============================================
CREATE OR REPLACE FUNCTION update_user_resumes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_resume_updated ON user_resumes;
CREATE TRIGGER on_user_resume_updated
BEFORE UPDATE ON user_resumes
FOR EACH ROW
EXECUTE FUNCTION update_user_resumes_updated_at();

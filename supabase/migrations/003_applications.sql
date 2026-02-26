-- ==================================================
-- Migration: 003_applications.sql
-- Feature: F-EXT-002 - Application Tracker
-- ==================================================
-- Purpose: Track job applications submitted through the
-- Chrome Extension, enabling users to monitor their
-- application pipeline and avoid duplicate submissions.

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('linkedin', 'indeed', 'manual')),
  location TEXT,
  salary TEXT,
  modality TEXT CHECK (modality IN ('remote', 'hybrid', 'onsite', NULL)),
  status TEXT NOT NULL DEFAULT 'aplicada' CHECK (status IN (
    'aplicada', 'entrevista', 'oferta', 'rechazada', 'descartada'
  )),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  adapted_content JSONB,
  ats_score INTEGER,
  template_used TEXT,
  job_analysis JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Indexes for performance
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(user_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(user_id, company_name);

-- Unique constraint for duplicate detection (same user + same job URL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_user_job_url ON applications(user_id, job_url);

-- ==============================================
-- RLS Policies
-- ==============================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own applications" ON applications;
CREATE POLICY "Users can read own applications"
ON applications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own applications" ON applications;
CREATE POLICY "Users can create own applications"
ON applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON applications;
CREATE POLICY "Users can update own applications"
ON applications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own applications" ON applications;
CREATE POLICY "Users can delete own applications"
ON applications FOR DELETE
USING (auth.uid() = user_id);

-- ==============================================
-- Trigger: Keep updated_at current on every update
-- ==============================================
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_updated ON applications;
CREATE TRIGGER on_application_updated
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_applications_updated_at();

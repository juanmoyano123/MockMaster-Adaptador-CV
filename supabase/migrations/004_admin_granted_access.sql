-- ==================================================
-- Migration: 004_admin_granted_access.sql
-- Feature: Admin Dashboard - Grant free extension access
-- ==================================================

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS admin_granted_access BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_subscriptions_admin_granted
ON user_subscriptions(admin_granted_access)
WHERE admin_granted_access = true;

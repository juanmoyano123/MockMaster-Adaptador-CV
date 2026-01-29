-- F-009: Subscription System Migration
-- Run this in Supabase SQL Editor

-- ==============================================
-- Table: user_subscriptions
-- ==============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trialing', 'past_due', 'cancelled')),
  mp_subscription_id TEXT,
  mp_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==============================================
-- Table: subscription_usage
-- ==============================================
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  adaptations_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- ==============================================
-- Trigger: Create free subscription on user signup
-- ==============================================
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_subscription();

-- ==============================================
-- RLS Policies
-- ==============================================

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- user_subscriptions policies
DROP POLICY IF EXISTS "Users can read own subscription" ON user_subscriptions;
CREATE POLICY "Users can read own subscription"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;
CREATE POLICY "Users can update own subscription"
ON user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- subscription_usage policies
DROP POLICY IF EXISTS "Users can read own usage" ON subscription_usage;
CREATE POLICY "Users can read own usage"
ON subscription_usage FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON subscription_usage;
CREATE POLICY "Users can insert own usage"
ON subscription_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON subscription_usage;
CREATE POLICY "Users can update own usage"
ON subscription_usage FOR UPDATE
USING (auth.uid() = user_id);

-- ==============================================
-- Service Role Policies (for webhooks)
-- ==============================================

-- Allow service role to update subscriptions (for webhooks)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;
CREATE POLICY "Service role can manage subscriptions"
ON user_subscriptions FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage usage" ON subscription_usage;
CREATE POLICY "Service role can manage usage"
ON subscription_usage FOR ALL
USING (auth.role() = 'service_role');

-- ==============================================
-- Create subscriptions for existing users
-- ==============================================
INSERT INTO user_subscriptions (user_id, tier, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================
-- Indexes for performance
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON subscription_usage(user_id, period_start);

-- Atomic increment function for adaptation usage tracking
-- Feature: F-009 — prevents race conditions when concurrent requests
-- update the same period row simultaneously.
--
-- Uses ON CONFLICT DO UPDATE to atomically upsert: if no row exists
-- for (user_id, period_start) it inserts with count=1; if it exists
-- it increments atomically without a read-then-write race.

CREATE OR REPLACE FUNCTION increment_adaptation_count(
  p_user_id UUID,
  p_period_start DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO subscription_usage (user_id, period_start, adaptations_count)
  VALUES (p_user_id, p_period_start, 1)
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET adaptations_count = subscription_usage.adaptations_count + 1;
END;
$$;

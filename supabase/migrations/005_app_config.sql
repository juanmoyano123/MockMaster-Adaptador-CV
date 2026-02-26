-- App Configuration Table
-- Stores dynamic application settings like subscription pricing

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default Pro price
INSERT INTO app_config (key, value)
VALUES ('pro_price', '100')
ON CONFLICT (key) DO NOTHING;

-- RLS: anyone authenticated can read, only service role can write
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_config_read" ON app_config
  FOR SELECT USING (true);

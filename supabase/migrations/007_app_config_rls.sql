-- Restrict app_config SELECT to authenticated users only
-- Anonymous reads are unnecessary as pricing is only shown to logged-in users

DROP POLICY IF EXISTS "app_config_read" ON app_config;

CREATE POLICY "app_config_read" ON app_config
  FOR SELECT USING (auth.role() = 'authenticated');

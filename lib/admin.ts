/**
 * Admin utilities — server-only
 * Admin detection via ADMIN_EMAILS env var (comma-separated list)
 */

/**
 * Returns true if the given email belongs to an admin.
 * Never import this in client components.
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Creates a Supabase service role client (bypasses RLS).
 * Reuses the same pattern as lib/storage/subscription.ts
 */
export function getAdminServiceClient() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase service role credentials');
  }
  return createClient(url, serviceKey);
}

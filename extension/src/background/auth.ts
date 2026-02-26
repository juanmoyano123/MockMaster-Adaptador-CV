/**
 * MockMaster Extension — Auth Module (background context only)
 *
 * Reads the Supabase session from cookies set by the MockMaster web app,
 * validates the extracted access token against the API, and writes the
 * result to chrome.storage.local so every extension context can read it.
 *
 * Why cookies and not postMessage / storage events?
 *   The extension and the web app run in different origins.  The cleanest
 *   zero-friction flow is: user logs in on the web app, Supabase writes a
 *   session cookie, and the extension reads that cookie via the "cookies"
 *   permission.  No extra web-app code is required.
 *
 * Supabase cookie format:
 *   - Non-chunked:   sb-<project-ref>-auth-token  (single cookie, JSON)
 *   - Chunked:       sb-<project-ref>-auth-token.0
 *                    sb-<project-ref>-auth-token.1  ...  (concatenate values)
 *   The combined value is a URI-encoded JSON string whose `access_token`
 *   field is the JWT we need.
 */

import { API_BASE_URL, STORAGE_KEYS } from '../shared/constants';
import { StoredAuthToken } from '../shared/types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Cookie domain for the MockMaster web app.
 *
 * chrome.cookies.getAll({ domain }) matches cookies whose domain attribute
 * matches the given string (exact or as a suffix for dot-prefixed domains).
 *
 * In development the web app runs on localhost; in production it lives on
 * mockmaster.vercel.app.  We pick the right value at bundle time using the
 * same NODE_ENV trick that constants.ts uses for API_BASE_URL.
 */
const MOCKMASTER_COOKIE_DOMAIN =
  process.env.NODE_ENV === 'development'
    ? 'localhost'
    : 'mockmastercv.com';

// ---------------------------------------------------------------------------
// Cookie reading helpers
// ---------------------------------------------------------------------------

/**
 * Attempts to parse a raw cookie value (after URI-decoding and optional
 * base64 decoding) into a JSON object and return the `access_token` field.
 *
 * Returns null if parsing fails for any reason.
 */
function extractTokenFromValue(rawValue: string): string | null {
  // Strategy 1: direct URI-decode + JSON parse
  try {
    const decoded = decodeURIComponent(rawValue);
    const session = JSON.parse(decoded) as Record<string, unknown>;
    if (typeof session.access_token === 'string' && session.access_token) {
      return session.access_token;
    }
  } catch {
    // not valid URI-encoded JSON
  }

  // Strategy 2: base64 decode + JSON parse (some Supabase versions use this)
  try {
    const decoded = atob(rawValue);
    const session = JSON.parse(decoded) as Record<string, unknown>;
    if (typeof session.access_token === 'string' && session.access_token) {
      return session.access_token;
    }
  } catch {
    // not valid base64-encoded JSON
  }

  return null;
}

/**
 * Reads Supabase auth cookies from the MockMaster web domain and returns
 * the access token string, or null if the user is not logged in.
 *
 * Handles both chunked (.0, .1, ...) and non-chunked cookie formats.
 */
export async function getSupabaseSessionFromCookies(): Promise<string | null> {
  try {
    const allCookies = await chrome.cookies.getAll({ domain: MOCKMASTER_COOKIE_DOMAIN });

    // Filter down to Supabase auth-token cookies only.
    // Pattern: sb-<anything>-auth-token  (optionally followed by .<digit>)
    const authCookies = allCookies.filter((c) => c.name.includes('auth-token'));

    if (authCookies.length === 0) {
      console.debug('[MockMaster Auth] No auth-token cookies found on domain:', MOCKMASTER_COOKIE_DOMAIN);
      return null;
    }

    console.debug('[MockMaster Auth] Found auth-token cookies:', authCookies.map((c) => c.name));

    // Collect the distinct "base names" (e.g. "sb-xyz-auth-token") so we
    // can handle several different Supabase project refs if somehow present.
    const baseNames = [
      ...new Set(authCookies.map((c) => c.name.split('.')[0])),
    ];

    for (const baseName of baseNames) {
      // Find all cookies that belong to this base name
      const group = authCookies.filter(
        (c) => c.name === baseName || c.name.startsWith(`${baseName}.`)
      );

      if (group.length === 1 && group[0].name === baseName) {
        // Non-chunked single cookie
        const token = extractTokenFromValue(group[0].value);
        if (token) return token;
        continue;
      }

      // Chunked cookies: sort by the numeric suffix (.0 < .1 < .2 ...)
      // Cookies without a suffix (the baseName itself) sort before chunk 0
      // if present — Supabase does not usually mix both, but be defensive.
      const sorted = group.sort((a, b) => {
        const aIdx = a.name.includes('.')
          ? parseInt(a.name.split('.').pop() ?? '-1', 10)
          : -1;
        const bIdx = b.name.includes('.')
          ? parseInt(b.name.split('.').pop() ?? '-1', 10)
          : -1;
        return aIdx - bIdx;
      });

      const combined = sorted.map((c) => c.value).join('');
      const token = extractTokenFromValue(combined);
      if (token) return token;
    }

    console.debug('[MockMaster Auth] Auth cookies found but could not extract access_token');
    return null;
  } catch (error) {
    // The "cookies" permission may be missing in some environments (e.g. unit
    // tests).  Log the error but never throw — callers should treat null as
    // "not authenticated" and continue gracefully.
    console.error('[MockMaster Auth] Error reading cookies:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Token validation
// ---------------------------------------------------------------------------

/**
 * Verifies the access token against the MockMaster API.
 *
 * Returns { valid: true, user } on success, or { valid: false } on any error.
 * Never throws — network failures are treated as "not valid".
 */
export async function validateToken(
  token: string
): Promise<{ valid: boolean; user?: { id: string; email: string; name: string } }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/extension-verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = (await response.json()) as {
        user?: { id: string; email: string; name: string };
      };
      return { valid: true, user: data.user };
    }

    console.debug('[MockMaster Auth] Token validation failed:', response.status);
    return { valid: false };
  } catch (error) {
    // Network error, API offline in dev, etc.
    console.debug('[MockMaster Auth] Token validation error (network?):', error);
    return { valid: false };
  }
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

/**
 * Reads cookies -> validates token -> writes result to chrome.storage.local.
 *
 * Returns true when the user ends up authenticated, false otherwise.
 *
 * This is safe to call from any background event handler.  It is idempotent:
 * calling it multiple times in quick succession is harmless (each call simply
 * overwrites storage with the same values).
 */
export async function syncAuthState(): Promise<boolean> {
  // First check if a valid relay token already exists — never wipe it
  const stored = await chrome.storage.local.get([STORAGE_KEYS.authToken]);
  const existingToken = stored[STORAGE_KEYS.authToken] as StoredAuthToken | undefined;
  if (existingToken?.access_token) {
    const isExpired = existingToken.expires_at - Date.now() < 60_000;
    if (!isExpired) {
      console.debug('[MockMaster Auth] Valid relay token exists, skipping cookie sync');
      return true;
    }
  }

  // No valid relay token — try cookie-based sync
  const token = await getSupabaseSessionFromCookies();

  if (!token) {
    // No cookie and no relay token -> not logged in
    await chrome.storage.local.remove([STORAGE_KEYS.authToken, 'auth_user', 'auth_synced_at']);
    return false;
  }

  const { valid, user } = await validateToken(token);

  if (valid) {
    const storedToken: StoredAuthToken = {
      access_token: token,
      refresh_token: '',
      expires_at: Date.now() + 3600 * 1000,
      user_id: user?.id ?? '',
      email: user?.email ?? '',
    };
    await chrome.storage.local.set({
      [STORAGE_KEYS.authToken]: storedToken,
      auth_user: user ?? null,
      auth_synced_at: Date.now(),
    });
    console.debug('[MockMaster Auth] Auth synced successfully, user:', user?.email);
    return true;
  }

  // Token exists in cookie but is rejected by the API (expired, revoked, etc.)
  await chrome.storage.local.remove([STORAGE_KEYS.authToken, 'auth_user', 'auth_synced_at']);
  return false;
}

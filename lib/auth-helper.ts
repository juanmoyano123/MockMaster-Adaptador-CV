/**
 * Auth Helper: Dual authentication support
 *
 * Supports two authentication methods:
 * 1. Bearer token in Authorization header (Chrome extension)
 * 2. Cookie-based session (web app - existing behavior)
 *
 * The Bearer token method is ADDITIVE — it does not replace cookies.
 * The web app continues to work exactly as before.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client that authenticates with a given Bearer token.
 * Unlike createClient() from lib/supabase/server, this client overrides
 * the Authorization header so Supabase validates the provided JWT directly
 * instead of reading a cookie.
 */
async function createClientWithToken(token: string) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}

/**
 * Creates a standard cookie-based Supabase client.
 * Mirrors the behavior of createClient() from lib/supabase/server.
 */
async function createCookieClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}

/**
 * Gets the authenticated user from either:
 * 1. Bearer token in Authorization header (Chrome extension)
 * 2. Cookie-based session (web app)
 *
 * The cookie-based method always runs as a fallback to preserve
 * full backward compatibility with the existing web application.
 *
 * @param request - The incoming HTTP request
 * @returns Object with the authenticated user (or null) and the supabase client
 */
export async function getAuthenticatedUser(request: Request) {
  // Method 1: Bearer token (Chrome extension)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabase = await createClientWithToken(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (user && !error) {
      return { user, supabase };
    }
  }

  // Method 2: Cookie-based session (web app — existing behavior)
  const supabase = await createCookieClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user && !error) {
    return { user, supabase };
  }

  // Not authenticated via either method
  return { user: null, supabase };
}

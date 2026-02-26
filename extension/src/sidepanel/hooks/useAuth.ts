/**
 * useAuth — sidepanel hook for authentication state
 *
 * Communicates with the background service worker to:
 *   1. Check the current auth state on mount (triggers a cookie sync).
 *   2. React to AUTH_CHANGED messages pushed by the service worker when the
 *      user logs in or out in the web app.
 *   3. Expose `checkAuth()` so views can manually re-trigger auth verification
 *      (e.g. after the user returns from the login tab).
 *   4. Expose `openLogin()` to open the MockMaster login page in a new tab.
 *
 * The hook calls `mockMasterClient.setToken()` as a side-effect so the API
 * client is always up-to-date without requiring callers to manage the token
 * separately.
 *
 * The background service worker response for CHECK_AUTH has shape:
 *   { success: true, data: { authenticated, token, user } }
 */

import { useState, useEffect, useCallback } from 'react';
import { MSG } from '../../shared/constants';
import { mockMasterClient } from '../api/mockmaster-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  /** True while the first CHECK_AUTH round-trip is in flight */
  loading: boolean;
  /** True when a valid session token has been confirmed */
  authenticated: boolean;
  /** The authenticated user, or null when unauthenticated */
  user: AuthUser | null;
  /** Raw JWT access token, or null when unauthenticated */
  token: string | null;
}

// Shape of the data payload returned by the background CHECK_AUTH handler
interface CheckAuthData {
  authenticated: boolean;
  token: string | null;
  user: AuthUser | null;
}

// Wrapper that the background wraps all responses in
interface MessageSuccess {
  success: true;
  data: CheckAuthData;
}

interface MessageFailure {
  success: false;
  error: string;
}

type BackgroundResponse = MessageSuccess | MessageFailure;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the current authentication state and helper actions.
 *
 * @example
 * ```tsx
 * const { loading, authenticated, user, checkAuth, openLogin } = useAuth();
 * ```
 */
export function useAuth(): AuthState & {
  checkAuth: () => Promise<void>;
  openLogin: () => void;
} {
  const [state, setState] = useState<AuthState>({
    loading: true,
    authenticated: false,
    user: null,
    token: null,
  });

  // -------------------------------------------------------------------------
  // Core auth check — sends CHECK_AUTH to the service worker
  // -------------------------------------------------------------------------

  const checkAuth = useCallback(async (): Promise<void> => {
    try {
      const response = (await chrome.runtime.sendMessage({
        type: MSG.CHECK_AUTH,
      })) as BackgroundResponse | undefined;

      if (!response) {
        // Service worker may not be running yet — treat as unauthenticated
        setState({
          loading: false,
          authenticated: false,
          user: null,
          token: null,
        });
        return;
      }

      if (!response.success) {
        console.error('[useAuth] CHECK_AUTH failed:', response.error);
        setState({
          loading: false,
          authenticated: false,
          user: null,
          token: null,
        });
        return;
      }

      const { authenticated, token, user } = response.data;

      // Keep the API client token in sync so it is available immediately
      // for any API calls made after this hook resolves.
      if (authenticated && token) {
        mockMasterClient.setToken(token);
      } else {
        mockMasterClient.clearToken();
      }

      setState({
        loading: false,
        authenticated,
        user: user ?? null,
        token: token ?? null,
      });
    } catch (err) {
      // chrome.runtime.sendMessage can throw if the service worker is
      // completely unresponsive (e.g. during extension reload).  Treat as
      // unauthenticated and let the user retry.
      console.error('[useAuth] Unexpected error in checkAuth:', err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // -------------------------------------------------------------------------
  // Mount effect — run initial check and subscribe to auth change events
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Run the auth check immediately on mount
    checkAuth();

    /**
     * Listen for AUTH_CHANGED messages pushed by the background service worker.
     * These fire when:
     *   - A Supabase auth cookie changes (user logged in/out in the web app)
     *   - The periodic 5-minute alarm re-syncs auth
     */
    const handleMessage = (message: { type?: string }): void => {
      if (message.type === MSG.AUTH_CHANGED) {
        // Re-run the full check to get the fresh token and user from storage
        checkAuth();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [checkAuth]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /**
   * Opens the MockMaster login page in a new browser tab.
   *
   * After the user logs in, the Supabase session cookie will be set on the
   * MockMaster domain.  The background service worker listens for this cookie
   * change and pushes an AUTH_CHANGED message, which triggers `checkAuth()`
   * automatically — no manual retry needed.
   */
  const openLogin = useCallback((): void => {
    const loginUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/login?next=/auth/extension-callback'
        : 'https://mockmaster.vercel.app/login?next=/auth/extension-callback';

    chrome.tabs.create({ url: loginUrl });
  }, []);

  return { ...state, checkAuth, openLogin };
}

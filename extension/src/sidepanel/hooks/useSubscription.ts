/**
 * useSubscription — sidepanel hook for subscription/quota state
 *
 * Responsibilities:
 *   - Fetches the user's current subscription plan and usage from the API via
 *     mockMasterClient.getSubscriptionStatus()
 *   - Exposes quota information so the UI can gate the "Adaptar CV" action
 *     through `isLimitReached` and `canAdapt`
 *   - Provides an `openUpgrade` helper that opens the billing/pricing page
 *   - Auto-fetches on mount when the user is authenticated (token present)
 *     and `options.enabled` is not explicitly false
 *
 * Error handling philosophy:
 *   If the subscription check fails, we do NOT block the user from adapting.
 *   `canAdapt` defaults to true (optimistic) so the button stays enabled
 *   while loading or when the fetch fails.  The server independently enforces
 *   quota limits — a failed client-side check should never be a hard blocker.
 */

import { useState, useEffect, useCallback } from 'react';
import { SubscriptionStatus } from '../../shared/types';
import { mockMasterClient } from '../api/mockmaster-client';
import { API_BASE_URL } from '../../shared/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubscriptionState {
  /** True while the subscription status is being fetched from the API */
  loading: boolean;
  /** The subscription status, or null if not yet loaded or fetch failed */
  subscription: SubscriptionStatus | null;
  /**
   * True when the user has exhausted their adaptation quota for the period.
   * Computed as `!subscription.can_adapt` once data is loaded.
   */
  isLimitReached: boolean;
  /**
   * Whether the user is allowed to run an adaptation right now.
   * Defaults to true (optimistic) so the UI never blocks while loading.
   */
  canAdapt: boolean;
  /** Localised error message if the last fetch failed, null otherwise */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns subscription state and actions.
 *
 * @param options.enabled - When explicitly set to `false`, the auto-fetch on
 *   mount is skipped (e.g. when the user is not yet authenticated).
 */
export function useSubscription(options?: { enabled?: boolean }): SubscriptionState & {
  /** Manually trigger a subscription status refresh */
  fetchSubscription: () => Promise<void>;
  /** Open the pricing/upgrade page in a new tab */
  openUpgrade: () => void;
} {
  const [state, setState] = useState<SubscriptionState>({
    loading: false,
    subscription: null,
    isLimitReached: false,
    canAdapt: true, // optimistic: keep the adapt button enabled while loading
    error: null,
  });

  // -------------------------------------------------------------------------
  // fetchSubscription — calls the API and updates state
  // -------------------------------------------------------------------------

  const fetchSubscription = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await mockMasterClient.getSubscriptionStatus();

      setState({
        loading: false,
        subscription: result,
        // Derive gating flags directly from the server's authoritative value
        isLimitReached: !result.can_adapt,
        canAdapt: result.can_adapt,
        error: null,
      });
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Error desconocido';

      // Map known API error patterns to user-friendly Spanish messages.
      // We intentionally leave canAdapt = true so the user is not locked out
      // when the subscription API is temporarily unavailable.
      let userMessage: string;
      if (
        rawMessage.includes('UNAUTHORIZED') ||
        rawMessage.includes('No autenticado') ||
        rawMessage.includes('401')
      ) {
        userMessage = 'Sesion expirada. Por favor inicia sesion de nuevo.';
      } else {
        userMessage = 'Error al verificar tu plan. Intenta de nuevo.';
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: userMessage,
        // canAdapt stays at its previous value (true on first load) — do NOT
        // set it to false on error; the server will enforce limits server-side.
      }));
    }
  }, []);

  // -------------------------------------------------------------------------
  // openUpgrade — navigates to the pricing page in a new browser tab
  // -------------------------------------------------------------------------

  const openUpgrade = useCallback((): void => {
    // API_BASE_URL is resolved at compile time by webpack DefinePlugin
    // (development -> localhost:3000, production -> mockmaster.vercel.app).
    chrome.tabs.create({ url: `${API_BASE_URL}/pricing` });
  }, []);

  // -------------------------------------------------------------------------
  // Auto-fetch on mount
  //
  // Only fetch when:
  //   1. `options.enabled` is not explicitly false (caller controls this via
  //      the `auth.authenticated` flag)
  //   2. A token is available (hasToken() prevents a pointless 401 round-trip)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (options?.enabled !== false && mockMasterClient.hasToken()) {
      fetchSubscription();
    }
    // We intentionally include options?.enabled so the fetch re-runs if the
    // caller toggles from disabled -> enabled (e.g. after sign-in).
    // fetchSubscription is stable (useCallback with no deps), so it is safe
    // to include without causing infinite re-renders.
  }, [options?.enabled, fetchSubscription]);

  return { ...state, fetchSubscription, openUpgrade };
}

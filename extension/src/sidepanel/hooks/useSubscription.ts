/**
 * useSubscription — sidepanel hook for subscription/quota state
 *
 * Placeholder implementation for Track E (subscription gating).
 *
 * Responsibilities (to be implemented):
 *   - Fetch the user's current subscription plan and usage from the API
 *   - Expose quota information so the UI can gate the "Adaptar CV" action
 *   - Provide an "upgrade" helper that opens the billing page
 */

import { useState, useCallback } from 'react';
import { SubscriptionStatus } from '../../shared/types';

export interface SubscriptionState {
  /** True while the subscription status is being fetched */
  loading: boolean;
  /** The subscription status, or null if not yet loaded */
  subscription: SubscriptionStatus | null;
  /** True if the user has reached their adaptation quota */
  isLimitReached: boolean;
  /** Error message if the last fetch failed, null otherwise */
  error: string | null;
}

/**
 * Returns subscription state and actions.
 *
 * Track E will implement the actual API call and quota gate logic.
 */
export function useSubscription(): SubscriptionState & {
  fetchSubscription: () => Promise<void>;
  openUpgrade: () => void;
} {
  const [state, setState] = useState<SubscriptionState>({
    loading: false,
    subscription: null,
    isLimitReached: false,
    error: null,
  });

  // TODO (Track E): call mockMasterClient.getSubscriptionStatus()
  const fetchSubscription = async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Placeholder: resolves immediately with no data
    setState({ loading: false, subscription: null, isLimitReached: false, error: null });
  };

  const openUpgrade = useCallback((): void => {
    const upgradeUrl =
      typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/pricing'
        : 'https://mockmaster.vercel.app/pricing';

    chrome.tabs.create({ url: upgradeUrl });
  }, []);

  return { ...state, fetchSubscription, openUpgrade };
}

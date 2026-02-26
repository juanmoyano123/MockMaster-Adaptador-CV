/**
 * useAdaptation — sidepanel hook for CV adaptation state
 *
 * Placeholder implementation for Track C.
 *
 * Responsibilities (to be implemented):
 *   - Call the MockMaster API to adapt the user's CV for a specific job
 *   - Track the adaptation progress (loading, adapted, error)
 *   - Calculate the ATS score for the adapted CV
 *   - Expose copy-to-clipboard and PDF download helpers
 */

import { useState } from 'react';
import { AdaptedResume, ATSBreakdown, JobAnalysis } from '../api/mockmaster-client';

export interface AdaptationState {
  /** True while adaptation is running */
  adapting: boolean;
  /** The adapted resume, or null if adaptation has not run yet */
  adaptedResume: AdaptedResume | null;
  /** ATS score breakdown, or null if not yet calculated */
  atsBreakdown: ATSBreakdown | null;
  /** Error message from the last failed adaptation, null otherwise */
  error: string | null;
}

/**
 * Returns CV adaptation state and actions.
 *
 * Track C will implement the actual API calls.
 */
export function useAdaptation(): AdaptationState & {
  adapt: (jobAnalysis: JobAnalysis) => Promise<void>;
  clearAdaptation: () => void;
} {
  const [state, setState] = useState<AdaptationState>({
    adapting: false,
    adaptedResume: null,
    atsBreakdown: null,
    error: null,
  });

  // TODO (Track C): implement API calls for adaptation + ATS calculation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const adapt = async (_jobAnalysis: JobAnalysis): Promise<void> => {
    setState((prev) => ({ ...prev, adapting: true, error: null }));

    // Placeholder: resolves immediately with no data
    setState({ adapting: false, adaptedResume: null, atsBreakdown: null, error: null });
  };

  const clearAdaptation = (): void => {
    setState({ adapting: false, adaptedResume: null, atsBreakdown: null, error: null });
  };

  return { ...state, adapt, clearAdaptation };
}

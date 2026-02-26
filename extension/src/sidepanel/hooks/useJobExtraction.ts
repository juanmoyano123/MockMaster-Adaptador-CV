/**
 * useJobExtraction — sidepanel hook for job extraction state
 *
 * Placeholder implementation for Track B.
 *
 * Responsibilities (to be implemented):
 *   - Trigger DOM extraction via the content script when on a supported page
 *   - Fall back to Vision API extraction (screenshot) when DOM fails
 *   - Cache the extracted job data in chrome.storage.local
 *   - Expose loading / error state to the UI
 */

import { useState } from 'react';
import { ExtractedJobData } from '../../shared/types';

export interface JobExtractionState {
  /** True while extraction is in progress */
  extracting: boolean;
  /** The most recently extracted job data, or null if not yet extracted */
  jobData: ExtractedJobData | null;
  /** Error message if the last extraction attempt failed, null otherwise */
  error: string | null;
}

/**
 * Returns job extraction state and a function to trigger extraction.
 *
 * Track B will implement the actual extraction logic.
 */
export function useJobExtraction(): JobExtractionState & {
  extract: () => Promise<void>;
  clearExtraction: () => void;
} {
  const [state, setState] = useState<JobExtractionState>({
    extracting: false,
    jobData: null,
    error: null,
  });

  // TODO (Track B): implement DOM + Vision extraction logic
  const extract = async (): Promise<void> => {
    setState((prev) => ({ ...prev, extracting: true, error: null }));

    // Placeholder: resolves immediately with no data
    setState({ extracting: false, jobData: null, error: null });
  };

  const clearExtraction = (): void => {
    setState({ extracting: false, jobData: null, error: null });
  };

  return { ...state, extract, clearExtraction };
}

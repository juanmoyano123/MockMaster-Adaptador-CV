/**
 * useApplication — sidepanel hook for application tracker state
 *
 * Placeholder implementation for Track D.
 *
 * Responsibilities (to be implemented):
 *   - Save a new application record to the MockMaster backend
 *   - Check whether an application for the current job URL already exists
 *   - Expose saving / loading state and the saved application record
 */

import { useState } from 'react';
import { Application } from '../../shared/types';

export interface ApplicationState {
  /** True while an application is being saved */
  saving: boolean;
  /** The saved application, or null if not yet saved in this session */
  application: Application | null;
  /** Error message from the last failed save, null otherwise */
  error: string | null;
}

/**
 * Returns application tracker state and actions.
 *
 * Track D will implement the actual API calls.
 */
export function useApplication(): ApplicationState & {
  saveApplication: (data: Partial<Application>) => Promise<void>;
  clearApplication: () => void;
} {
  const [state, setState] = useState<ApplicationState>({
    saving: false,
    application: null,
    error: null,
  });

  // TODO (Track D): call mockMasterClient.createApplication()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveApplication = async (_data: Partial<Application>): Promise<void> => {
    setState((prev) => ({ ...prev, saving: true, error: null }));

    // Placeholder: resolves immediately with no data
    setState({ saving: false, application: null, error: null });
  };

  const clearApplication = (): void => {
    setState({ saving: false, application: null, error: null });
  };

  return { ...state, saveApplication, clearApplication };
}

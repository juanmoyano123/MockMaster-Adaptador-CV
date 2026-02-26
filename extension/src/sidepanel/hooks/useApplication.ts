/**
 * useApplication — sidepanel hook for application tracker state
 *
 * Responsibilities:
 *   - Save a new application record to the MockMaster backend
 *   - Check whether an application for the current job URL already exists
 *   - Expose saving / loading state and the saved application record
 *   - Handle the DUPLICATE error code gracefully (no re-throw, set alreadySaved)
 */

import { useState, useCallback } from 'react';
import { mockMasterClient } from '../api/mockmaster-client';
import { Application } from '../../shared/types';

export interface ApplicationState {
  /** True while an application is being saved */
  saving: boolean;
  /** The saved application, or null if not yet saved in this session */
  application: Application | null;
  /** Error message from the last failed save, null otherwise */
  error: string | null;
  /** True when the current job URL was already saved in a previous session */
  alreadySaved: boolean;
}

/** Payload accepted by saveApplication — matches createApplication's signature */
type CreateApplicationData = {
  job_title: string;
  company_name: string;
  job_url: string;
  source: 'linkedin' | 'indeed' | 'manual';
  location?: string;
  salary?: string;
  modality?: 'remote' | 'hybrid' | 'onsite';
  adapted_content?: unknown;
  ats_score?: number;
  template_used?: string;
  job_analysis?: unknown;
  notes?: string;
};

/**
 * Returns application tracker state and actions.
 *
 * saveApplication — POSTs a new application record; handles DUPLICATE silently.
 * checkIfAlreadySaved — queries the backend for an existing record by job URL.
 * clearApplication — resets all state back to the initial empty values.
 */
export function useApplication(): ApplicationState & {
  saveApplication: (data: CreateApplicationData) => Promise<void>;
  clearApplication: () => void;
  checkIfAlreadySaved: (jobUrl: string) => Promise<boolean>;
} {
  const [state, setState] = useState<ApplicationState>({
    saving: false,
    application: null,
    error: null,
    alreadySaved: false,
  });

  /**
   * Saves a new application to the backend.
   *
   * - Sets saving: true while the request is in flight.
   * - On success: stores the returned Application record and clears saving.
   * - On DUPLICATE error: marks alreadySaved: true and does NOT re-throw.
   * - On any other error: stores the message and re-throws so App.tsx can react.
   */
  const saveApplication = useCallback(async (data: CreateApplicationData): Promise<void> => {
    setState((prev) => ({ ...prev, saving: true, error: null }));

    try {
      const saved = await mockMasterClient.createApplication(data);
      setState((prev) => ({
        ...prev,
        saving: false,
        application: saved,
      }));
    } catch (err) {
      const apiError = err as Error & { code?: string };

      if (apiError.code === 'DUPLICATE') {
        // Application already exists — surface the already-saved state without
        // treating it as an error; no re-throw so the caller stays silent too.
        setState((prev) => ({
          ...prev,
          saving: false,
          alreadySaved: true,
          error: null,
        }));
        return;
      }

      // All other errors are surfaced to the caller via state AND re-thrown
      // so App.tsx can handle them (e.g. stay in 'adapted' state).
      const message = apiError.message ?? 'Error al guardar la postulacion';
      setState((prev) => ({
        ...prev,
        saving: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  /**
   * Checks if an application for the given job URL already exists on the backend.
   *
   * Runs silently on entering the 'adapted' state so the save button can be
   * pre-disabled without any visible error when the job was saved previously.
   *
   * @returns true if a duplicate was found, false on not-found or any error
   */
  const checkIfAlreadySaved = useCallback(async (jobUrl: string): Promise<boolean> => {
    try {
      const existing = await mockMasterClient.checkApplicationExists(jobUrl);
      if (existing) {
        setState((prev) => ({
          ...prev,
          application: existing,
          alreadySaved: true,
        }));
        return true;
      }
      return false;
    } catch {
      // Never surface a check error — the user can still attempt to save
      return false;
    }
  }, []);

  /** Resets all application state back to its initial empty values */
  const clearApplication = useCallback((): void => {
    setState({ saving: false, application: null, error: null, alreadySaved: false });
  }, []);

  return { ...state, saveApplication, clearApplication, checkIfAlreadySaved };
}

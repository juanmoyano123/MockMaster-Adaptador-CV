/**
 * useAdaptation — sidepanel hook for CV adaptation state
 *
 * Implements the 4-step adaptation pipeline:
 *   1. Fetch user resume  (getUserResume)
 *   2. Analyze job        (analyzeJob — builds raw text from ExtractedJobData)
 *   3. Adapt resume       (adaptResume)
 *   4. Calculate ATS      (calculateATSBreakdown)
 *
 * Stale-result protection:
 *   A counter ref (`callIdRef`) is incremented at the start of every `adapt()`
 *   and `clearAdaptation()` call. Each async step checks that the counter has
 *   not changed before committing its result to state — this discards results
 *   from any in-flight call that was superseded by a later one.
 */

import { useState, useCallback, useRef } from 'react';
import {
  AdaptedResume,
  ATSScoreBreakdown,
  JobAnalysis,
  ResumeData,
  UserResumeRow,
  mockMasterClient,
} from '../api/mockmaster-client';
import { ExtractedJobData } from '../../shared/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Granular label for the current step inside the adaptation pipeline.
 * Used by the UI to show more precise progress messages.
 */
export type AdaptationStep =
  | 'idle'
  | 'fetching_resume'
  | 'analyzing_job'
  | 'adapting_resume'
  | 'calculating_ats';

export interface AdaptationState {
  /** True while the 4-step pipeline is running */
  adapting: boolean;
  /** Which pipeline step is currently active */
  step: AdaptationStep;
  /** The full adapted resume returned by the backend, or null if not yet run */
  adaptedResume: AdaptedResume | null;
  /** Detailed ATS breakdown returned by the backend, or null if not yet run */
  atsBreakdown: ATSScoreBreakdown | null;
  /** The job analysis object produced by step 2, or null if not yet run */
  jobAnalysis: JobAnalysis | null;
  /** User-facing error message from the last failed adaptation, null otherwise */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Converts a backend error thrown by the API client into a user-facing
 * Spanish message appropriate for display in the sidepanel.
 *
 * The backend attaches `code` to the thrown Error object via the `request()`
 * helper when a non-2xx response includes a JSON body with a `code` field.
 */
function mapError(err: unknown): string {
  const error = err as Error & { code?: string };
  const code = error.code;
  const message = error.message ?? '';

  if (code === 'MISSING_RESUME' || code === 'NOT_FOUND') {
    return 'Necesitas subir tu CV primero en MockMaster.';
  }

  if (code === 'UNAUTHORIZED') {
    return 'Tu sesion expiro. Inicia sesion nuevamente.';
  }

  if (code === 'LIMIT_EXCEEDED' || code === 'VALIDATION_FAILED') {
    // Pass the backend message through — it contains the specific quota info
    // (e.g. "Has alcanzado el limite de 3 adaptaciones este mes.")
    if (message && !message.startsWith('HTTP ')) {
      return message;
    }
  }

  return 'Hubo un error al adaptar tu CV. Intenta de nuevo.';
}

// ---------------------------------------------------------------------------
// Helper: UserResumeRow -> ResumeData
// ---------------------------------------------------------------------------

/**
 * Converts the database row returned by getUserResume() to the ResumeData
 * shape that adaptResume() expects.
 *
 * Both shapes carry the same fields — this is a structural re-labeling so
 * TypeScript remains satisfied without any runtime overhead.
 */
function rowToResumeData(row: UserResumeRow): ResumeData {
  return {
    name: row.name,
    original_text: row.original_text,
    parsed_content: row.parsed_content,
    uploaded_at: row.uploaded_at,
  };
}

// ---------------------------------------------------------------------------
// Helper: ExtractedJobData -> raw text for analyzeJob
// ---------------------------------------------------------------------------

/**
 * Builds the raw text string to send to the analyzeJob endpoint.
 *
 * Concatenates the most information-rich fields from the extraction result so
 * the Claude analysis has the full context of the job listing.
 */
function buildJobText(jobData: ExtractedJobData): string {
  const parts: string[] = [];

  if (jobData.title) parts.push(`Puesto: ${jobData.title}`);
  if (jobData.company) parts.push(`Empresa: ${jobData.company}`);
  if (jobData.location) parts.push(`Ubicacion: ${jobData.location}`);
  if (jobData.description) parts.push(jobData.description);
  if (jobData.requirements) parts.push(jobData.requirements);

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns CV adaptation state and the `adapt()` / `clearAdaptation()` actions.
 *
 * @example
 * ```tsx
 * const { adapting, step, adaptedResume, atsBreakdown, error, adapt, clearAdaptation } =
 *   useAdaptation();
 *
 * // Trigger the pipeline when the user clicks "Adaptar mi CV con IA"
 * <button onClick={() => adapt(extraction.jobData)}>Adaptar mi CV</button>
 * ```
 */
export function useAdaptation(): AdaptationState & {
  adapt: (jobData: ExtractedJobData) => Promise<void>;
  clearAdaptation: () => void;
} {
  const [state, setState] = useState<AdaptationState>({
    adapting: false,
    step: 'idle',
    adaptedResume: null,
    atsBreakdown: null,
    jobAnalysis: null,
    error: null,
  });

  /**
   * Monotonically increasing counter used for stale-result protection.
   *
   * Each `adapt()` or `clearAdaptation()` call captures the current counter
   * value into a local `callId` constant.  Before any async result is written
   * to state, the code checks `callIdRef.current === callId`.  If the counter
   * has since been incremented (by another adapt() or clearAdaptation() call),
   * the result is silently discarded.
   */
  const callIdRef = useRef<number>(0);

  // -------------------------------------------------------------------------
  // adapt()
  // -------------------------------------------------------------------------

  const adapt = useCallback(async (jobData: ExtractedJobData): Promise<void> => {
    // Capture a unique ID for this particular invocation
    callIdRef.current += 1;
    const callId = callIdRef.current;

    // Reset to loading state
    setState({
      adapting: true,
      step: 'fetching_resume',
      adaptedResume: null,
      atsBreakdown: null,
      jobAnalysis: null,
      error: null,
    });

    try {
      // -------------------------------------------------------------------
      // Step 1: Fetch the user's stored resume
      // -------------------------------------------------------------------
      const resumeRow = await mockMasterClient.getUserResume();

      // Stale check — another adapt() or clearAdaptation() fired while waiting
      if (callIdRef.current !== callId) return;

      const resumeData: ResumeData = rowToResumeData(resumeRow);

      // -------------------------------------------------------------------
      // Step 2: Analyze the job description
      // -------------------------------------------------------------------
      setState((prev) => ({ ...prev, step: 'analyzing_job' }));

      const rawText = buildJobText(jobData);
      const jobAnalysis = await mockMasterClient.analyzeJob(rawText);

      if (callIdRef.current !== callId) return;

      setState((prev) => ({ ...prev, jobAnalysis }));

      // -------------------------------------------------------------------
      // Step 3: Adapt the resume
      // -------------------------------------------------------------------
      setState((prev) => ({ ...prev, step: 'adapting_resume' }));

      const adaptedResume = await mockMasterClient.adaptResume(resumeData, jobAnalysis);

      if (callIdRef.current !== callId) return;

      setState((prev) => ({ ...prev, adaptedResume }));

      // -------------------------------------------------------------------
      // Step 4: Calculate the ATS breakdown
      // -------------------------------------------------------------------
      setState((prev) => ({ ...prev, step: 'calculating_ats' }));

      const atsBreakdown = await mockMasterClient.calculateATSBreakdown(
        adaptedResume.adapted_content,
        jobAnalysis
      );

      if (callIdRef.current !== callId) return;

      // All steps succeeded — commit final state
      setState({
        adapting: false,
        step: 'idle',
        adaptedResume,
        atsBreakdown,
        jobAnalysis,
        error: null,
      });
    } catch (err) {
      // Stale check — if another call has taken over, silently discard
      if (callIdRef.current !== callId) return;

      console.error('[useAdaptation] Pipeline error:', err);

      setState({
        adapting: false,
        step: 'idle',
        adaptedResume: null,
        atsBreakdown: null,
        jobAnalysis: null,
        error: mapError(err),
      });
    }
  }, []);

  // -------------------------------------------------------------------------
  // clearAdaptation()
  // -------------------------------------------------------------------------

  /**
   * Cancels any in-flight adaptation and resets state to the initial idle
   * condition.  Any async steps that complete after this call are discarded
   * via the stale-result counter.
   */
  const clearAdaptation = useCallback((): void => {
    // Invalidate any in-flight pipeline
    callIdRef.current += 1;

    setState({
      adapting: false,
      step: 'idle',
      adaptedResume: null,
      atsBreakdown: null,
      jobAnalysis: null,
      error: null,
    });
  }, []);

  return { ...state, adapt, clearAdaptation };
}

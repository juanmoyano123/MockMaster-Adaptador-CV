/**
 * useJobExtraction — sidepanel hook for job extraction state
 *
 * Implements the two-phase extraction strategy:
 *   1. Cache check: if we already extracted this URL, return immediately.
 *   2. DOM extraction: ask the content script to parse the page structure.
 *   3. Vision fallback: if DOM returns nothing useful (description < 50 chars),
 *      capture a screenshot and send it to the Vision API endpoint.
 *
 * Stale-result protection:
 *   A `pendingUrl` ref tracks the URL for which extraction was last started.
 *   When an async operation completes, results are discarded if the ref no
 *   longer matches (i.e. the user navigated to a different page mid-flight).
 */

import { useState, useCallback, useRef } from 'react';
import { ExtractedJobData } from '../../shared/types';
import { MSG, detectJobSource } from '../../shared/constants';
import { cacheExtraction, getCachedExtraction } from '../../shared/storage';
import { mockMasterClient } from '../api/mockmaster-client';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface JobExtractionState {
  /** True while extraction is in progress (DOM or Vision phase) */
  extracting: boolean;
  /** The most recently extracted job data, or null if not yet extracted */
  jobData: ExtractedJobData | null;
  /** User-facing error message if the last attempt failed, null otherwise */
  error: string | null;
  /**
   * True while the Vision API fallback is active (DOM extraction produced
   * insufficient data and we are waiting for the screenshot analysis).
   */
  visionFallbackActive: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns job extraction state and helper functions.
 *
 * @example
 * ```tsx
 * const { extracting, jobData, error, visionFallbackActive, extract, clearExtraction } = useJobExtraction();
 * ```
 */
export function useJobExtraction(): JobExtractionState & {
  extract: (url?: string) => Promise<void>;
  clearExtraction: () => void;
} {
  const [state, setState] = useState<JobExtractionState>({
    extracting: false,
    jobData: null,
    error: null,
    visionFallbackActive: false,
  });

  /**
   * Tracks the URL for which extraction was most recently triggered.
   * Used to discard stale async results when the user navigates mid-flight.
   */
  const pendingUrlRef = useRef<string | null>(null);

  // -------------------------------------------------------------------------
  // extract()
  // -------------------------------------------------------------------------

  const extract = useCallback(async (url?: string): Promise<void> => {
    // Normalise the url — undefined becomes an empty string, which will skip
    // the cache step gracefully and still attempt DOM extraction.
    const targetUrl = url ?? '';

    // Record this URL as the active extraction so stale results can be
    // detected when async operations complete.
    pendingUrlRef.current = targetUrl;

    // Phase 0: reset state to loading
    setState({
      extracting: true,
      jobData: null,
      error: null,
      visionFallbackActive: false,
    });

    // -----------------------------------------------------------------------
    // Phase 1: Cache check
    // -----------------------------------------------------------------------
    if (targetUrl) {
      try {
        const cached = await getCachedExtraction(targetUrl);
        if (cached) {
          // Guard: discard if the user navigated away while we were reading storage
          if (pendingUrlRef.current !== targetUrl) return;

          setState({
            extracting: false,
            jobData: cached,
            error: null,
            visionFallbackActive: false,
          });
          return;
        }
      } catch (cacheErr) {
        // Cache read failure is non-fatal — continue to DOM extraction
        console.warn('[useJobExtraction] Cache read failed:', cacheErr);
      }
    }

    // -----------------------------------------------------------------------
    // Phase 2: DOM extraction via content script
    // -----------------------------------------------------------------------
    let domData: ExtractedJobData | null = null;
    let domSuccess = false;

    try {
      const response = await chrome.runtime.sendMessage({ type: MSG.EXTRACT_JOB }) as
        | { success: true; data: ExtractedJobData }
        | { success: false; error?: string }
        | undefined;

      if (
        response?.success === true &&
        response.data?.description &&
        response.data.description.length >= 50
      ) {
        domData = response.data;
        domSuccess = true;
      }
    } catch (domErr) {
      // The content script may not be injected yet, or the message channel
      // timed out.  Fall through to Vision extraction.
      console.warn('[useJobExtraction] DOM extraction error:', domErr);
    }

    // If DOM extraction succeeded with sufficient content, cache and return
    if (domSuccess && domData) {
      // Guard: discard stale result
      if (pendingUrlRef.current !== targetUrl) return;

      try {
        if (targetUrl) {
          await cacheExtraction(targetUrl, domData);
        }
      } catch (cacheWriteErr) {
        // Cache write failure is non-fatal — the user still sees the data
        console.warn('[useJobExtraction] Cache write failed:', cacheWriteErr);
      }

      setState({
        extracting: false,
        jobData: domData,
        error: null,
        visionFallbackActive: false,
      });
      return;
    }

    // -----------------------------------------------------------------------
    // Phase 3: Vision API fallback
    // -----------------------------------------------------------------------
    setState((prev) => ({ ...prev, visionFallbackActive: true }));

    try {
      // 3a. Request a screenshot from the background service worker
      const screenshotResponse = await chrome.runtime.sendMessage({
        type: MSG.CAPTURE_SCREENSHOT,
      }) as { success: true; data: { dataUrl: string } } | { success: false; error?: string } | undefined;

      if (!screenshotResponse?.success) {
        throw new Error(
          (screenshotResponse as { success: false; error?: string } | undefined)?.error ??
            'No se pudo capturar la pantalla'
        );
      }

      // Guard: discard if user navigated away while waiting for screenshot
      if (pendingUrlRef.current !== targetUrl) return;

      // 3b. Extract base64 payload from the data URL ("data:image/png;base64,<payload>")
      const { dataUrl } = screenshotResponse.data;
      const base64 = dataUrl.split(',')[1];

      if (!base64) {
        throw new Error('La captura de pantalla tiene formato invalido');
      }

      // 3c. Detect the job source from the URL so the Vision endpoint can
      //     apply source-specific extraction heuristics.
      const source = detectJobSource(targetUrl) ?? 'linkedin';

      // 3d. Call the Vision extraction API
      const visionResult = (await mockMasterClient.extractJobVision(base64, source, targetUrl)) as {
        extracted_data: ExtractedJobData | null;
        confidence: number;
      };

      // Guard: discard stale result
      if (pendingUrlRef.current !== targetUrl) return;

      // If Vision detected this is not a job listing, treat as error
      if (!visionResult.extracted_data) {
        throw new Error('La pagina no parece contener un aviso de trabajo.');
      }

      // 3e. Merge required fields — the API response has them inside extracted_data
      const visionData: ExtractedJobData = {
        ...visionResult.extracted_data,
        extraction_method: 'vision',
        extracted_at: new Date().toISOString(),
        source,
        url: targetUrl,
      };

      // 3f. Cache the Vision result for future panel opens on the same URL
      try {
        if (targetUrl) {
          await cacheExtraction(targetUrl, visionData);
        }
      } catch (cacheWriteErr) {
        console.warn('[useJobExtraction] Cache write (vision) failed:', cacheWriteErr);
      }

      setState({
        extracting: false,
        jobData: visionData,
        error: null,
        visionFallbackActive: false,
      });
    } catch (visionErr) {
      // Guard: discard stale error
      if (pendingUrlRef.current !== targetUrl) return;

      console.error('[useJobExtraction] Vision extraction failed:', visionErr);

      setState({
        extracting: false,
        jobData: null,
        error:
          'No se pudo extraer el aviso. Asegurate de estar en la pagina del aviso y vuelve a intentarlo.',
        visionFallbackActive: false,
      });
    }
  }, []);

  // -------------------------------------------------------------------------
  // clearExtraction()
  // -------------------------------------------------------------------------

  const clearExtraction = useCallback((): void => {
    // Cancel any in-flight extraction by setting the ref to a sentinel value
    // that will not match any real URL.
    pendingUrlRef.current = null;

    setState({
      extracting: false,
      jobData: null,
      error: null,
      visionFallbackActive: false,
    });
  }, []);

  return { ...state, extract, clearExtraction };
}

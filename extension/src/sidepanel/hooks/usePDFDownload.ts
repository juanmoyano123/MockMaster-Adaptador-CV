/**
 * usePDFDownload — sidepanel hook for PDF generation and download state
 *
 * Responsibilities:
 *   - Calls mockMasterClient.generatePDF() with the adapted resume content,
 *     selected template, and company name.
 *   - Triggers a browser download via a temporary object URL once the Blob
 *     is received.
 *   - Exposes `downloading`, `error`, and `success` flags so the UI can
 *     render appropriate feedback at every stage.
 *   - Resets `success` automatically after 3 seconds so the button returns
 *     to its default state without any manual action from the user.
 *
 * Usage example:
 * ```tsx
 * const { downloading, error, success, download, clearError } = usePDFDownload();
 *
 * <TemplateSelectorInline
 *   selectedTemplate={template}
 *   onSelectTemplate={setTemplate}
 *   onDownload={() => download(adaptedResume, template, companyName)}
 *   downloading={downloading}
 *   success={success}
 *   error={error}
 * />
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AdaptedResume, mockMasterClient } from '../api/mockmaster-client';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * The three PDF template variants available in the backend renderer.
 * These values map directly to the template keys expected by
 * POST /api/generate-pdf.
 */
export type PDFTemplate = 'clean' | 'modern' | 'compact';

export interface PDFDownloadState {
  /** True while the PDF is being generated and the Blob is downloading */
  downloading: boolean;
  /** User-facing Spanish error message, or null if no error */
  error: string | null;
  /**
   * True for 3 seconds after a successful download.
   * The UI uses this to show a "Descargado" confirmation state.
   */
  success: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns PDF download state and the `download()` / `clearError()` actions.
 *
 * The `download` function is stable across renders (useCallback with no
 * deps) — it is safe to pass directly as an event handler or as a prop
 * without causing child re-renders.
 */
export function usePDFDownload(): PDFDownloadState & {
  /**
   * Trigger PDF generation and download.
   *
   * @param adaptedResume - The full AdaptedResume object from useAdaptation.
   *   The hook extracts `adapted_content` internally before calling the API.
   * @param template      - One of 'clean' | 'modern' | 'compact'
   * @param companyName   - Used to label the downloaded file
   */
  download: (
    adaptedResume: AdaptedResume,
    template: PDFTemplate,
    companyName: string
  ) => Promise<void>;
  /** Clears the current error message (e.g. when the user dismisses it) */
  clearError: () => void;
} {
  const [state, setState] = useState<PDFDownloadState>({
    downloading: false,
    error: null,
    success: false,
  });

  // Store the auto-reset timer ID so we can cancel it on rapid re-calls or
  // on unmount, preventing a setState-after-unmount warning.
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending timeout when the component unmounts.
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // download()
  // -------------------------------------------------------------------------

  const download = useCallback(async (
    adaptedResume: AdaptedResume,
    template: PDFTemplate,
    companyName: string
  ): Promise<void> => {
    setState({ downloading: true, error: null, success: false });

    try {
      // Request the PDF blob from the backend.
      // We pass only the inner `adapted_content` object — the API endpoint
      // does not accept the full AdaptedResume wrapper.
      const blob = await mockMasterClient.generatePDF(
        adaptedResume.adapted_content,
        template,
        companyName
      );

      // Build a safe filename: CV_CompanyName_YYYY-MM-DD.pdf
      // Non-alphanumeric characters in the company name are replaced with
      // underscores to produce a valid filename on all operating systems.
      const date = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `CV_${safeName}_${date}.pdf`;

      // Create a temporary object URL and click a hidden <a> to trigger the
      // browser's native Save-As dialog.  The element is appended to the body
      // only for the duration of the programmatic click to satisfy browser
      // security requirements, then removed and the URL revoked immediately.
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      setState({ downloading: false, error: null, success: true });

      // Clear any previous auto-reset timer before scheduling a new one to
      // prevent stale timers from accumulating on rapid consecutive clicks.
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }

      // Auto-reset the success flag after 3 seconds so the button reverts to
      // its default "Descargar PDF" label without any user action.
      resetTimerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, success: false }));
        resetTimerRef.current = null;
      }, 3000);
    } catch (err) {
      console.error('[usePDFDownload] Error generating PDF:', err);

      setState({
        downloading: false,
        error: 'Error al generar el PDF. Intenta de nuevo.',
        success: false,
      });
    }
  }, []);

  // -------------------------------------------------------------------------
  // clearError()
  // -------------------------------------------------------------------------

  /**
   * Clears the current error message.  Useful when the caller wants to give
   * the user a clean slate before a retry attempt.
   */
  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return { ...state, download, clearError };
}

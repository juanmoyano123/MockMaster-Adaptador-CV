/**
 * CopyableSection — reusable wrapper that adds a "Copiar" button to any
 * CV section card in the adapted-resume view.
 *
 * Responsibilities:
 *   - Renders a titled card with consistent visual structure (`.card`,
 *     `.section-header`, `.section-title`, `.copy-btn`).
 *   - Accepts pre-formatted plain text and writes it to the clipboard when
 *     the user clicks "Copiar".
 *   - Shows a "Copiado" confirmation for 2 seconds, then reverts to default.
 *   - Handles rapid consecutive clicks gracefully by clearing the previous
 *     timeout before scheduling a new one.
 *   - Cleans up the pending timeout on unmount to avoid setState-after-unmount.
 *
 * Usage example:
 *   <CopyableSection title="Resumen Profesional" copyText={formattedSummary}>
 *     <p className="text-sm text-slate-700">{summary}</p>
 *   </CopyableSection>
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CopyableSectionProps {
  /** Section heading displayed in the card header, e.g. "Experiencia Laboral" */
  title: string;
  /** Pre-formatted plain text that will be written to the clipboard */
  copyText: string;
  /** Visual rendering of the section content — rendered inside the card body */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

/**
 * Small clipboard icon (16x16) used in the default "Copiar" button state.
 * Stroke-based so it scales cleanly at any small size.
 */
function ClipboardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Clipboard body */}
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

/**
 * Small checkmark icon (16x16) used in the "Copiado" confirmation state.
 */
function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Duration in milliseconds to show the "Copiado" confirmation before
 * reverting the button to its default state.
 */
const COPIED_RESET_DELAY_MS = 2000;

export default function CopyableSection({
  title,
  copyText,
  children,
}: CopyableSectionProps) {
  // `copied` drives the visual state of the copy button.
  const [copied, setCopied] = useState(false);

  // `error` is a brief secondary state shown when the clipboard write fails.
  // It resets on the same timer as `copied` to keep the two states mutually
  // exclusive.
  const [copyError, setCopyError] = useState(false);

  // Store the timeout ID so we can cancel it if the user clicks again before
  // the 2-second window expires.
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending timeout when the component unmounts.
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  /**
   * handleCopy — write `copyText` to the system clipboard.
   *
   * Flow:
   *   1. Clear any in-flight reset timer so a rapid second click restarts
   *      the 2-second window cleanly.
   *   2. Call navigator.clipboard.writeText().
   *   3a. On success: enter "Copiado" state, schedule reset after 2 s.
   *   3b. On failure: log warning, enter brief error state, schedule reset.
   */
  const handleCopy = useCallback(async () => {
    // Step 1 — cancel any previous auto-reset so it cannot fire mid-sequence.
    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    try {
      // Step 2 — write to clipboard.
      await navigator.clipboard.writeText(copyText);

      // Step 3a — success path.
      setCopied(true);
      setCopyError(false);
    } catch (err) {
      // Step 3b — failure path.
      // The Clipboard API can throw if the document is not focused or if
      // the browser policy denies access. We log for debugging but do not
      // surface the technical error message to the user.
      console.warn('[CopyableSection] clipboard.writeText failed:', err);
      setCopyError(true);
      setCopied(false);
    }

    // Schedule reset regardless of success or failure.
    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
      setCopyError(false);
      resetTimerRef.current = null;
    }, COPIED_RESET_DELAY_MS);
  }, [copyText]);

  // ---------------------------------------------------------------------------
  // Derived values for button rendering
  // ---------------------------------------------------------------------------

  // Determine the label and icon based on current state.
  const buttonLabel = copied ? 'Copiado' : copyError ? 'Error' : 'Copiar';
  const ButtonIcon = copied ? CheckIcon : ClipboardIcon;

  // Additional class applied to the button in the "Copiado" state to show
  // the green tint using the `secondary-600` design token color.
  // The `copy-btn` base class from globals.css handles the layout; we only
  // override the text color here.
  const copiedClass = copied ? 'text-secondary-600' : '';
  const errorClass = copyError ? 'text-red-500' : '';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="card">
      {/* ------------------------------------------------------------------- */}
      {/* Card header — title + copy button                                   */}
      {/* ------------------------------------------------------------------- */}
      <div className="section-header">
        <span className="section-title">{title}</span>

        <button
          className={`copy-btn ${copiedClass} ${errorClass}`.trim()}
          onClick={handleCopy}
          // Accessible label changes with state so screen readers announce
          // the confirmation without relying solely on color.
          aria-label={
            copied
              ? `${title} copiado al portapapeles`
              : `Copiar ${title} al portapapeles`
          }
          // Disable during the "Copiado" window only if there was an error —
          // rapid re-clicks on success are valid (e.g. user wants to verify).
          disabled={copyError}
        >
          <ButtonIcon />
          {buttonLabel}
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Card body — consumer-supplied content                               */}
      {/* ------------------------------------------------------------------- */}
      <div className="mt-2">{children}</div>
    </div>
  );
}

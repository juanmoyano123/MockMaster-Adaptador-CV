/**
 * TemplateSelectorInline — compact footer component for PDF template
 * selection and download.
 *
 * Renders two rows inside a tight container:
 *   Row 1: Five pill-style toggle buttons (Clasico / Moderno / Compacto / Ejecutivo / Minimalista)
 *           Pills wrap to a second line on narrow viewports via flex-wrap.
 *   Row 2: Full-width "Descargar PDF" action button
 *   Row 3: (conditional) Red error message below the button
 *
 * The component is intentionally stateless — all state (selected template,
 * download progress, error) comes in via props.  The parent is responsible
 * for wiring usePDFDownload and managing the selectedTemplate value.
 *
 * Usage example:
 * ```tsx
 * const [template, setTemplate] = useState<PDFTemplate>('clean');
 * const { downloading, error, success, download } = usePDFDownload();
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

import React from 'react';
import { PDFTemplate } from '../hooks/usePDFDownload';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TemplateSelectorInlineProps {
  /** Currently active template — drives the selected pill highlight */
  selectedTemplate: PDFTemplate;
  /** Called when the user clicks a different template pill */
  onSelectTemplate: (template: PDFTemplate) => void;
  /** Called when the user clicks the "Descargar PDF" button */
  onDownload: () => void;
  /** When true, the download button shows a spinner and is disabled */
  downloading: boolean;
  /** When true, the download button shows a checkmark + "Descargado" label */
  success: boolean;
  /** User-facing error text shown below the button; null hides the element */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Template option definitions
// ---------------------------------------------------------------------------

/**
 * Display metadata for each template pill.
 * `id` maps to the PDFTemplate union type used by the hook and backend.
 * `label` is the Spanish UI string shown in the pill.
 */
const TEMPLATE_OPTIONS: { id: PDFTemplate; label: string }[] = [
  { id: 'clean',     label: 'Clasico'      },
  { id: 'modern',    label: 'Moderno'      },
  { id: 'compact',   label: 'Compacto'     },
  { id: 'executive', label: 'Ejecutivo'    },
  { id: 'minimal',   label: 'Minimalista'  },
];

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

/**
 * Download arrow icon used in the default button state.
 * 14x14 stroke-based so it stays sharp at small sizes.
 */
function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/**
 * Checkmark icon used in the success ("Descargado") state.
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

export default function TemplateSelectorInline({
  selectedTemplate,
  onSelectTemplate,
  onDownload,
  downloading,
  success,
  error,
}: TemplateSelectorInlineProps) {
  // -------------------------------------------------------------------------
  // Derived button content
  // -------------------------------------------------------------------------

  /**
   * The download button cycles through three visual states:
   *   downloading → spinner + "Generando..."
   *   success     → check icon + "Descargado"
   *   default     → download icon + "Descargar PDF"
   */
  const buttonLabel = downloading
    ? 'Generando...'
    : success
    ? 'Descargado'
    : 'Descargar PDF';

  const ButtonIcon = success ? CheckIcon : DownloadIcon;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-2">
      {/* ------------------------------------------------------------------- */}
      {/* Row 1: Template pill toggles                                        */}
      {/* ------------------------------------------------------------------- */}
      <div
        className="flex flex-wrap gap-1 justify-center"
        role="group"
        aria-label="Seleccionar plantilla de PDF"
      >
        {TEMPLATE_OPTIONS.map(({ id, label }) => {
          const isSelected = selectedTemplate === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTemplate(id)}
              disabled={downloading}
              aria-pressed={isSelected}
              aria-label={`Plantilla ${label}`}
              className={[
                // Base pill layout — rounded, small text, tight padding
                'flex-1 px-2 py-1 rounded-full text-xs font-medium',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary-300',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                // Active/inactive colour swap
                isSelected
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Row 2: Download action button                                       */}
      {/* ------------------------------------------------------------------- */}
      <button
        type="button"
        onClick={onDownload}
        disabled={downloading || success}
        aria-label={buttonLabel}
        className={[
          // Re-use the btn-primary component class for consistent styling
          'btn-primary w-full',
          // Override colour in success state to reinforce positive feedback
          success && !downloading ? 'bg-secondary-600 hover:bg-secondary-700' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Spinner (visible only while downloading) */}
        {downloading && (
          <span
            className="spinner w-3.5 h-3.5"
            role="status"
            aria-label="Generando PDF"
          />
        )}

        {/* Icon (hidden while spinner is shown) */}
        {!downloading && <ButtonIcon />}

        {buttonLabel}
      </button>

      {/* ------------------------------------------------------------------- */}
      {/* Row 3: Error message (conditional)                                  */}
      {/* ------------------------------------------------------------------- */}
      {error && (
        <div
          className="flex items-center justify-between gap-2 text-xs text-red-600"
          role="alert"
          aria-live="polite"
        >
          <p className="leading-snug">{error}</p>
          <button
            type="button"
            className="text-red-600 hover:text-red-700 underline shrink-0 font-medium"
            onClick={onDownload}
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}

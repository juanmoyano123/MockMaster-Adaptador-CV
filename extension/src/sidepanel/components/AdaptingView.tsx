/**
 * AdaptingView — loading screen shown while the 4-step CV adaptation
 * pipeline is running.
 *
 * Displays a spinner, a step-specific label (e.g. "Analizando el aviso
 * con IA..."), and a static subtitle that reassures the user the process
 * takes only a few seconds.
 *
 * The `step` prop accepts any AdaptationStep value from useAdaptation.
 * If the step is not found in ADAPTING_STEP_LABELS (e.g. 'idle') or
 * is undefined, a safe fallback label is shown.
 */

import React from 'react';
import { AdaptationStep } from '../hooks/useAdaptation';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AdaptingViewProps {
  /** The current pipeline step reported by useAdaptation */
  step?: AdaptationStep | string;
}

// ---------------------------------------------------------------------------
// Step label map
// ---------------------------------------------------------------------------

/**
 * Maps each AdaptationStep value to a user-facing Spanish label.
 * Only the four active steps are listed here; 'idle' falls through to the
 * default fallback in the component.
 */
const ADAPTING_STEP_LABELS: Record<string, string> = {
  fetching_resume: 'Obteniendo tu CV...',
  analyzing_job: 'Analizando el aviso con IA...',
  adapting_resume: 'Personalizando tu CV...',
  calculating_ats: 'Calculando puntaje ATS...',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdaptingView({ step }: AdaptingViewProps) {
  const stepLabel = (step && ADAPTING_STEP_LABELS[step]) ?? 'Adaptando tu CV...';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="spinner w-10 h-10" />
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          {stepLabel}
        </h2>
        <p className="text-sm text-slate-500">
          La IA esta personalizando tu CV para esta oferta. Esto puede
          tomar unos segundos.
        </p>
      </div>
    </div>
  );
}

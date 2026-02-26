/**
 * JobExtractionView — handles all sub-states of the extraction lifecycle.
 *
 * Sub-states driven by props:
 *   A) extracting && !visionFallbackActive  → spinner "Extrayendo aviso..."
 *   B) extracting && visionFallbackActive   → spinner "Analizando pagina con vision..."
 *   C) !extracting && jobData != null       → full job card with collapsible description
 *   D) !extracting && !jobData && error     → error message with retry button
 */

import React, { useState, useEffect } from 'react';
import { ExtractedJobData } from '../../shared/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface JobExtractionViewProps {
  jobData: ExtractedJobData | null;
  extracting: boolean;
  visionFallbackActive: boolean;
  error: string | null;
  /** Called when the user clicks "Adaptar mi CV con IA" */
  onAdapt: () => void;
  /** Called when the user clicks "Reintentar" after an error */
  onRetry: () => void;
}

// ---------------------------------------------------------------------------
// Sub-component: Spinner loading state
// ---------------------------------------------------------------------------

interface SpinnerStateProps {
  title: string;
  subtitle: string;
}

function SpinnerState({ title, subtitle }: SpinnerStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="spinner w-10 h-10" />
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Job card (state C)
// ---------------------------------------------------------------------------

interface JobCardProps {
  jobData: ExtractedJobData;
  onAdapt: () => void;
}

function JobCard({ jobData, onAdapt }: JobCardProps) {
  // Collapsible description state — reset whenever the URL changes so that
  // navigating to a new job starts collapsed.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [jobData.url]);

  // Map internal modality values to Spanish display labels
  const modalityLabel: Record<string, string> = {
    remote: 'Remoto',
    hybrid: 'Hibrido',
    onsite: 'Presencial',
  };

  return (
    <div className="flex flex-col h-full">
      {/* ----------------------------------------------------------------- */}
      {/* Header — title, company, source badge, modality, salary           */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800 leading-snug">
              {jobData.title || 'Puesto sin titulo'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {[jobData.company, jobData.location]
                .filter(Boolean)
                .join(' \u00b7 ')}
            </p>
          </div>

          {/* Source badge */}
          <span
            className={`badge shrink-0 ${
              jobData.source === 'linkedin' ? 'badge-info' : 'badge-warning'
            }`}
          >
            {jobData.source === 'linkedin' ? 'LinkedIn' : 'Indeed'}
          </span>
        </div>

        {/* Modality badge */}
        {jobData.modality && (
          <span className="badge badge-success mt-2">
            {modalityLabel[jobData.modality] ?? jobData.modality}
          </span>
        )}

        {/* Salary */}
        {jobData.salary && (
          <p className="text-xs text-secondary-600 font-medium mt-1.5">
            {jobData.salary}
          </p>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Scrollable body — description with collapsible toggle             */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-2">
          Descripcion
        </p>

        <p
          className={`text-sm text-slate-700 whitespace-pre-line ${
            expanded ? '' : 'line-clamp-3'
          }`}
        >
          {jobData.description || 'Sin descripcion disponible.'}
        </p>

        {/* Only show toggle when the description is long enough to overflow */}
        {jobData.description && jobData.description.length > 0 && (
          <button
            className="text-primary-600 text-xs hover:underline cursor-pointer mt-1 focus:outline-none"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? 'Ver menos' : 'Ver mas'}
          </button>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Footer — CTA                                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-4 border-t border-slate-200">
        <button className="btn-primary w-full" onClick={onAdapt}>
          Adaptar mi CV con IA
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Error state (state D)
// ---------------------------------------------------------------------------

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-red-600 text-xl font-bold">!</span>
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          No se pudo extraer el aviso
        </h2>
        <p className="text-xs text-red-600 mt-1 bg-red-50 rounded p-2 text-left">
          {error}
        </p>
      </div>
      <button className="btn-primary w-full" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function JobExtractionView({
  jobData,
  extracting,
  visionFallbackActive,
  error,
  onAdapt,
  onRetry,
}: JobExtractionViewProps) {
  // Sub-state A: DOM extraction in progress
  if (extracting && !visionFallbackActive) {
    return (
      <SpinnerState
        title="Extrayendo aviso..."
        subtitle="Leyendo la descripcion del trabajo desde la pagina."
      />
    );
  }

  // Sub-state B: Vision fallback in progress
  if (extracting && visionFallbackActive) {
    return (
      <SpinnerState
        title="Analizando pagina con vision..."
        subtitle="Usando vision como alternativa."
      />
    );
  }

  // Sub-state C: Extraction succeeded
  if (!extracting && jobData !== null) {
    return <JobCard jobData={jobData} onAdapt={onAdapt} />;
  }

  // Sub-state D: Extraction failed
  if (!extracting && error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Fallback: no data, no error, not extracting — should not occur in normal
  // flow but prevents a blank render during edge-case timing.
  return null;
}

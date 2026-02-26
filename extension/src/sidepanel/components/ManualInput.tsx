/**
 * ManualInput — textarea fallback for unsupported pages.
 *
 * Renders a textarea where the user can paste a raw job description, then
 * calls the analyzeJob API to extract structured data from the text.  On
 * success it invokes `onAnalysisComplete` with a synthetic ExtractedJobData
 * object so the rest of the sidepanel state machine can treat it identically
 * to a DOM- or Vision-extracted job.
 *
 * NOTE: this component depends on the Track K shape of JobAnalysis, which
 * nests the extracted fields inside an `analysis` sub-object:
 *
 *   {
 *     text_hash:   string,
 *     analysis:    { job_title, company_name, required_skills[], ... },
 *     analyzed_at: string,
 *   }
 *
 * Until Track K lands, the component accesses these fields defensively so it
 * does not crash against the legacy flat JobAnalysis shape.
 */

import React, { useState, useCallback } from 'react';
import { ExtractedJobData } from '../../shared/types';
import { mockMasterClient } from '../api/mockmaster-client';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum character count before the "Analizar" button is enabled. */
const MIN_CHARS = 50;

/** Maximum characters accepted — mirrors the backend MAX_TEXT_LENGTH. */
const MAX_CHARS = 20_000;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ManualInputProps {
  /** Called with the synthetic ExtractedJobData once analysis succeeds. */
  onAnalysisComplete: (jobData: ExtractedJobData) => void;
  /** When true the textarea and button are inert (parent-level loading). */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A textarea + "Analizar" button that lets the user paste a job description
 * on pages where automatic extraction is not supported.
 */
export default function ManualInput({ onAnalysisComplete, disabled = false }: ManualInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const trimmedLength = text.trim().length;
  const isBelowMinimum = trimmedLength < MIN_CHARS;
  const isButtonDisabled = disabled || loading || isBelowMinimum;

  // -------------------------------------------------------------------------
  // handleChange
  // -------------------------------------------------------------------------

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Enforce max length silently — the user cannot paste more than MAX_CHARS.
      const value = e.target.value.slice(0, MAX_CHARS);
      setText(value);
      // Clear any previous error so the UI resets as the user edits.
      if (error) setError(null);
    },
    [error]
  );

  // -------------------------------------------------------------------------
  // handleAnalyze
  // -------------------------------------------------------------------------

  const handleAnalyze = useCallback(async () => {
    const trimmed = text.trim();

    // Guard: should not reach here because button is disabled, but be safe.
    if (trimmed.length < MIN_CHARS) return;

    setLoading(true);
    setError(null);

    try {
      // analyzeJob returns the Track-K shape:
      //   { text_hash, analysis: { job_title, company_name, required_skills[], ... }, analyzed_at }
      // We use `unknown` here because the client's declared return type (JobAnalysis)
      // will be updated by Track K.  Accessing fields defensively below.
      const result = await mockMasterClient.analyzeJob(trimmed) as unknown as {
        text_hash: string;
        analysis: {
          job_title?: string;
          company_name?: string;
          required_skills?: string[];
          preferred_skills?: string[];
          responsibilities?: string[];
          seniority_level?: string;
          industry?: string;
        };
        analyzed_at: string;
      };

      const { analysis, analyzed_at } = result;

      // Build a synthetic ExtractedJobData so downstream components receive a
      // fully-typed object regardless of whether data came from DOM, Vision, or
      // manual text input.
      const syntheticJobData: ExtractedJobData = {
        // Source and URL are not meaningful for manual input; 'other' signals
        // this was user-pasted text, and url is left empty.
        source: 'other',
        url: '',

        title: analysis.job_title ?? 'Puesto sin titulo',
        company: analysis.company_name ?? 'Empresa no especificada',

        // Location, salary, modality, and benefits cannot be derived from
        // text-only analysis — leave them as empty/null.
        location: '',
        salary: null,
        modality: null,
        benefits: null,

        // The full pasted text is the description and raw_text; requirements
        // are serialised from the required_skills array when available.
        description: trimmed,
        requirements: (analysis.required_skills ?? []).join(', '),
        raw_text: trimmed,

        extracted_at: analyzed_at,

        // 'manual' correctly identifies this data as user-pasted input.
        extraction_method: 'manual',
      };

      onAnalysisComplete(syntheticJobData);
    } catch (err: unknown) {
      // Map known error codes and messages to user-friendly strings.
      const message = err instanceof Error ? err.message : String(err);

      if (!message || message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
        setError('Error de conexion. Verifica tu internet e intenta de nuevo.');
      } else if (message.includes('TEXT_TOO_SHORT') || message.includes('muy corta') || message.includes('too short')) {
        setError('La descripcion es muy corta. Pega la descripcion completa del aviso.');
      } else {
        setError('Ocurrio un error al analizar el texto. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [text, onAnalysisComplete]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Info notice */}
      <div className="flex items-start gap-2 text-slate-500">
        <span className="text-base leading-none mt-0.5" aria-hidden="true">i</span>
        <p className="text-xs">
          Esta pagina no es compatible con la extraccion automatica
        </p>
      </div>

      {/* Textarea */}
      <textarea
        className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        rows={6}
        placeholder="Pega la descripcion del trabajo aqui..."
        value={text}
        onChange={handleChange}
        disabled={disabled || loading}
        maxLength={MAX_CHARS}
        aria-label="Descripcion del trabajo"
      />

      {/* Character count */}
      <p className="text-xs text-slate-400 text-right">
        <span className={trimmedLength < MIN_CHARS ? 'text-amber-500' : 'text-slate-400'}>
          {trimmedLength}
        </span>
        {' / '}
        {MIN_CHARS} caracteres minimos
      </p>

      {/* Inline error message — kept below the textarea so the user can edit and retry */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded p-2" role="alert">
          {error}
        </p>
      )}

      {/* Analyze button */}
      <button
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAnalyze}
        disabled={isButtonDisabled}
        aria-busy={loading}
      >
        {loading && (
          <span className="spinner w-4 h-4" aria-hidden="true" />
        )}
        {loading ? 'Analizando...' : 'Analizar'}
      </button>
    </div>
  );
}

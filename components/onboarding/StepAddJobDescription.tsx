/**
 * StepAddJobDescription Component
 * Feature: F-008 (Onboarding Wizard Step 2) + F-014 (URL extraction)
 *
 * Allows users to:
 *   a) Paste job description text directly into the textarea, OR
 *   b) Enter a URL and extract the text automatically via /api/extract-job-url
 *
 * After text is in the textarea (either way), clicking "Analizar Oferta"
 * calls /api/analyze-job to extract structured data and saves to localStorage
 * via jobAnalysisStorage. A brief summary is shown before continuing.
 */

'use client';

import { useState } from 'react';
import { jobAnalysisStorage } from '@/lib/job-storage';
import { JobAnalysis, UrlExtractionAPIError } from '@/lib/types';

interface StepAddJobDescriptionProps {
  /** Called when job analysis is successfully saved */
  onComplete: () => void;
}

const MIN_CHARS = 50;

export default function StepAddJobDescription({ onComplete }: StepAddJobDescriptionProps) {
  // --- Textarea state ---
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // After analysis, show the summary before continuing
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  // --- URL extraction state ---
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  const isValid = text.trim().length >= MIN_CHARS;
  const charsRemaining = Math.max(0, MIN_CHARS - text.trim().length);

  // ---------------------------------------------------------------------------
  // URL extraction handler
  // ---------------------------------------------------------------------------

  const handleExtract = async () => {
    if (!urlInput.trim() || isExtracting || isLoading) return;

    setIsExtracting(true);
    setExtractionError(null);
    setExtractionSuccess(false);

    try {
      const response = await fetch('/api/extract-job-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = data as UrlExtractionAPIError;
        setExtractionError(apiError.error || 'No se pudo extraer el texto de la URL.');
        return;
      }

      // Populate textarea with the extracted text so the user can review it
      setText(data.text || '');
      setExtractionSuccess(true);
      setError(null);
    } catch {
      setExtractionError(
        'No se pudo conectar con el servidor. Intenta pegar el texto directamente.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExtract();
    }
  };

  // ---------------------------------------------------------------------------
  // Analysis handler
  // ---------------------------------------------------------------------------

  const handleAnalyze = async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo analizar la oferta');
      }

      const data = await response.json();

      // Build the full JobAnalysis object matching the existing pattern
      const fullAnalysis: JobAnalysis = {
        raw_text: text.trim(),
        text_hash: data.text_hash,
        analysis: data.analysis,
        analyzed_at: data.analyzed_at,
      };

      // Save to localStorage
      jobAnalysisStorage.save(fullAnalysis);

      // Show summary so the user can confirm before continuing
      setAnalysis(fullAnalysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrio un error inesperado. Por favor intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Analysis is already saved — just advance
    onComplete();
  };

  // ---------------------------------------------------------------------------
  // After analysis: show summary + continue button
  // ---------------------------------------------------------------------------
  if (analysis) {
    const { job_title, company_name, required_skills, seniority_level } = analysis.analysis;

    return (
      <div className="space-y-6">
        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-secondary-50 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-secondary-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Oferta analizada</h2>
          <p className="text-neutral-500 text-sm">
            Hemos extraido la informacion clave de la oferta
          </p>
        </div>

        {/* Analysis summary card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          {/* Job title + company */}
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Puesto</p>
            <p className="text-lg font-semibold text-neutral-900">
              {job_title || 'Puesto no identificado'}
            </p>
            {company_name && (
              <p className="text-sm text-neutral-600 mt-0.5">{company_name}</p>
            )}
            {seniority_level && (
              <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                {seniority_level}
              </span>
            )}
          </div>

          {/* Required skills preview */}
          {required_skills && required_skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Habilidades requeridas
              </p>
              <div className="flex flex-wrap gap-2">
                {required_skills.slice(0, 6).map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 text-xs font-medium bg-white border border-slate-200 text-neutral-700 rounded-full">
                    {skill}
                  </span>
                ))}
                {required_skills.length > 6 && (
                  <span className="px-2.5 py-0.5 text-xs text-neutral-400">
                    +{required_skills.length - 6} mas
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full h-12 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <span>Continuar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Option to re-paste */}
        <button
          onClick={() => setAnalysis(null)}
          className="w-full text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Pegar otra oferta
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Default: input form (URL field + textarea)
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Agrega la oferta de trabajo</h2>
        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
          Pega la oferta completa o ingresa la URL del aviso de LinkedIn, Indeed u otro portal.
        </p>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <label htmlFor="onboarding-job-url" className="block text-sm font-medium text-neutral-700">
          URL del aviso (opcional)
        </label>

        <div className="flex items-center gap-2">
          <input
            id="onboarding-job-url"
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setExtractionError(null);
              setExtractionSuccess(false);
            }}
            onKeyDown={handleUrlKeyDown}
            placeholder="https://www.linkedin.com/jobs/view/..."
            disabled={isExtracting || isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-neutral-800 text-sm
                       placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                       focus:border-transparent transition-shadow duration-200 disabled:bg-neutral-50
                       disabled:cursor-not-allowed"
          />

          <button
            onClick={handleExtract}
            disabled={!urlInput.trim() || isExtracting || isLoading}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium
                       rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-1.5 whitespace-nowrap"
          >
            {isExtracting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extrayendo...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Extraer texto</span>
              </>
            )}
          </button>
        </div>

        {/* URL extraction feedback */}
        {extractionError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-red-700">{extractionError}</p>
          </div>
        )}

        {extractionSuccess && !extractionError && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-green-700">
              Texto extraido. Revisalo y haz clic en Analizar Oferta.
            </p>
          </div>
        )}
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <label htmlFor="job-description" className="block text-sm font-medium text-neutral-700">
          Descripcion del puesto
        </label>
        <textarea
          id="job-description"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setExtractionSuccess(false);
          }}
          placeholder={`Pega aqui la descripcion completa del trabajo...\n\nEjemplo:\nBuscamos un Desarrollador Frontend con experiencia en React...\nResponsabilidades:\n- ...`}
          className="w-full min-h-[220px] px-4 py-3 rounded-xl border border-slate-200 bg-white text-neutral-800 text-sm placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow duration-200"
          disabled={isLoading}
        />

        {/* Character count hint */}
        {!isValid && text.length > 0 && (
          <p className="text-xs text-neutral-400">
            Necesitas {charsRemaining} caracteres mas para continuar
          </p>
        )}
        {isValid && (
          <p className="text-xs text-secondary-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Listo para analizar
          </p>
        )}
      </div>

      {/* General error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!isValid || isLoading}
        className="w-full h-12 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Analizando oferta...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Analizar Oferta</span>
          </>
        )}
      </button>
    </div>
  );
}

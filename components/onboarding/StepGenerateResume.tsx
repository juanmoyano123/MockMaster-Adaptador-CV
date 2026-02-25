/**
 * StepGenerateResume Component
 * Feature: F-008 - Onboarding Wizard Step 3
 *
 * Shows a summary of the uploaded resume and analyzed job, then
 * calls /api/adapt-resume and (optionally) /api/calculate-ats-breakdown
 * to generate the first adapted CV.
 * On success, calls onComplete() to trigger the celebration modal.
 */

'use client';

import { useState, useEffect } from 'react';
import { resumeStorage } from '@/lib/storage';
import { jobAnalysisStorage } from '@/lib/job-storage';
import { adaptedResumeStorage } from '@/lib/adapted-resume-storage';
import { validateNoHallucination } from '@/lib/validation';
import { ResumeData, JobAnalysis, AdaptedResume } from '@/lib/types';

interface StepGenerateResumeProps {
  /** Called when the adapted resume is successfully generated */
  onComplete: (adaptedResume: AdaptedResume) => void;
}

/** Loading messages shown in sequence during adaptation */
const LOADING_MESSAGES = [
  'Analizando tu CV...',
  'Identificando palabras clave...',
  'Adaptando el contenido...',
  'Calculando puntaje ATS...',
  'Finalizando tu CV...',
];

export default function StepGenerateResume({ onComplete }: StepGenerateResumeProps) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    setResume(resumeStorage.getResume());
    setJobAnalysis(jobAnalysisStorage.get());
  }, []);

  // Cycle through loading messages while generating
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (isGenerating || !resume || !jobAnalysis) return;

    setIsGenerating(true);
    setError(null);
    setLoadingMessageIndex(0);

    try {
      // Step 1: Generate adapted resume
      const response = await fetch('/api/adapt-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobAnalysis }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo generar el CV adaptado');
      }

      const adaptedData: AdaptedResume = await response.json();

      // Client-side hallucination validation (mirrors existing ResumeAdaptationFlow logic)
      const validation = validateNoHallucination(resume, adaptedData);
      if (!validation.valid) {
        throw new Error(`Validacion fallida: ${validation.errors.join(', ')}`);
      }

      // Step 2: Calculate ATS breakdown (non-critical - continue even if it fails)
      try {
        const breakdownResponse = await fetch('/api/calculate-ats-breakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adapted_content: adaptedData.adapted_content,
            job_analysis: jobAnalysis,
          }),
        });

        if (breakdownResponse.ok) {
          const breakdownData = await breakdownResponse.json();
          adaptedData.ats_breakdown = breakdownData.breakdown;
        }
      } catch {
        // Non-critical - we still have the adapted resume
        console.warn('No se pudo calcular el desglose ATS, continuando sin el.');
      }

      // Save to localStorage
      adaptedResumeStorage.save(adaptedData);

      // Notify parent (triggers celebration modal)
      onComplete(adaptedData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrio un error inesperado. Por favor intenta de nuevo.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------
  // Derived display values
  // -------------------------------------------------------
  const contactName = resume?.parsed_content?.contact?.name ?? 'Tu CV';
  const contactEmail = resume?.parsed_content?.contact?.email ?? '';
  const jobTitle = jobAnalysis?.analysis?.job_title ?? '';
  const companyName = jobAnalysis?.analysis?.company_name ?? '';

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Genera tu primer CV adaptado</h2>
        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
          Nuestra IA adaptara tu CV para el puesto en menos de 60 segundos
        </p>
      </div>

      {/* Summary card: resume + job */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        {/* Resume info */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Tu CV</p>
            <p className="text-sm font-semibold text-neutral-900 mt-0.5">{contactName}</p>
            {contactEmail && (
              <p className="text-xs text-neutral-500">{contactEmail}</p>
            )}
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Guardado
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* Job info */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Oferta</p>
            <p className="text-sm font-semibold text-neutral-900 mt-0.5">
              {jobTitle || 'Puesto analizado'}
            </p>
            {companyName && (
              <p className="text-xs text-neutral-500">{companyName}</p>
            )}
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Analizada
            </span>
          </div>
        </div>
      </div>

      {/* Time estimate */}
      <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Toma aproximadamente 60 segundos</span>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm font-medium text-primary-700 animate-pulse">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full transition-all duration-[3000ms] ease-linear"
              style={{
                width: `${Math.round(((loadingMessageIndex + 1) / LOADING_MESSAGES.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-700">Error al generar el CV</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !resume || !jobAnalysis}
        className="w-full h-12 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generando...</span>
          </>
        ) : error ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reintentar</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generar CV Adaptado</span>
          </>
        )}
      </button>

      {/* Safety notice */}
      <p className="text-center text-xs text-neutral-400">
        La IA solo reorganiza y reformula tu contenido existente. Jamas inventara informacion falsa.
      </p>
    </div>
  );
}

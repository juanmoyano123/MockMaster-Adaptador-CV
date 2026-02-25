/**
 * StepUploadResume Component
 * Feature: F-008 - Onboarding Wizard Step 1
 *
 * Allows new users to paste their resume text.
 * Calls /api/parse-resume to structure the content,
 * then saves to localStorage via resumeStorage.
 */

'use client';

import { useState } from 'react';
import { resumeStorage } from '@/lib/storage';
import { ResumeData, ParsedContent } from '@/lib/types';

interface StepUploadResumeProps {
  /** Called when resume is successfully parsed and saved */
  onComplete: () => void;
}

const MIN_CHARS = 100;

export default function StepUploadResume({ onComplete }: StepUploadResumeProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = text.trim().length >= MIN_CHARS;
  const charsRemaining = Math.max(0, MIN_CHARS - text.trim().length);

  const handleContinue = async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call the existing /api/parse-resume endpoint
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo analizar el CV');
      }

      const data = await response.json();
      const parsedContent: ParsedContent = data.parsed_content;

      // Build the ResumeData object and persist it
      const resumeData: ResumeData = {
        name: 'cv_pegado.txt',
        original_text: text.trim(),
        parsed_content: parsedContent,
        uploaded_at: new Date().toISOString(),
      };

      resumeStorage.saveResume(resumeData);

      // Advance to next step
      onComplete();
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

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Empecemos con tu CV</h2>
        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
          Pega el texto de tu CV para continuar. Copia todo el contenido de tu CV actual.
        </p>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <label htmlFor="resume-text" className="block text-sm font-medium text-neutral-700">
          Texto de tu CV
        </label>
        <textarea
          id="resume-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Pega aqui el contenido de tu CV...\n\nEjemplo:\nJuan Garcia\njuan@email.com | +54 11 1234-5678\n\nEXPERIENCIA PROFESIONAL\n...`}
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

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!isValid || isLoading}
        className="w-full h-12 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Analizando tu CV...</span>
          </>
        ) : (
          <>
            <span>Continuar</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      {/* Tip */}
      <p className="text-center text-xs text-neutral-400">
        Tu CV se guarda localmente en tu navegador. Ningun dato personal se almacena en nuestros servidores.
      </p>
    </div>
  );
}

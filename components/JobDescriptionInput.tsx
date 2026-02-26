/**
 * Job Description Input Component
 * Feature: F-003 (original) + F-014 (URL extraction)
 *
 * Large textarea for pasting job descriptions with character counting and
 * validation. Also provides a URL input field (above the textarea) so users
 * can extract text directly from a job posting URL instead of copy-pasting.
 *
 * The URL field and textarea always coexist — extracted text populates the
 * textarea so the user can review it before clicking Analizar.
 *
 * The `onAnalyze` callback interface is unchanged: it still receives the
 * plain text string, keeping this component backward-compatible.
 */

'use client';

import { useState } from 'react';
import { UrlExtractionAPIError } from '@/lib/types';

interface JobDescriptionInputProps {
  onAnalyze: (text: string) => Promise<void>;
  loading: boolean;
}

const MIN_CHARS = 50;
const MAX_CHARS = 20000;

export default function JobDescriptionInput({
  onAnalyze,
  loading,
}: JobDescriptionInputProps) {
  // --- Textarea state ---
  const [text, setText] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  // --- URL extraction state ---
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  const charCount = text.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isTooShort = charCount > 0 && charCount < MIN_CHARS;
  const isTooLong = charCount > MAX_CHARS;

  // ---------------------------------------------------------------------------
  // Textarea handlers
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    if (!isValid) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    await onAnalyze(text);
  };

  const handleClear = () => {
    setText('');
    setShowWarning(false);
    setExtractionSuccess(false);
  };

  // ---------------------------------------------------------------------------
  // URL extraction handler
  // ---------------------------------------------------------------------------

  const handleExtract = async () => {
    if (!urlInput.trim() || isExtracting || loading) return;

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
        // The API returns { error, code } on failure
        const apiError = data as UrlExtractionAPIError;
        setExtractionError(apiError.error || 'No se pudo extraer el texto de la URL.');
        return;
      }

      // Populate the textarea with the extracted text so the user can review it
      setText(data.text || '');
      setExtractionSuccess(true);
      setShowWarning(false);
    } catch {
      setExtractionError(
        'No se pudo conectar con el servidor. Intenta pegar el texto directamente.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Allow pressing Enter in the URL field to trigger extraction
  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExtract();
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Analizar Oferta de Trabajo
        </h1>
        <p className="text-body text-neutral-600">
          Pega la oferta completa o ingresa la URL del aviso de LinkedIn, Indeed u otro
          portal.
        </p>
      </div>

      {/* URL Input Section */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-4">
        <label
          htmlFor="job-url"
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          URL del aviso (opcional)
        </label>

        <div className="flex items-center gap-3">
          <input
            id="job-url"
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setExtractionError(null);
              setExtractionSuccess(false);
            }}
            onKeyDown={handleUrlKeyDown}
            placeholder="https://www.linkedin.com/jobs/view/..."
            disabled={isExtracting || loading}
            className="flex-1 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400
                       border border-neutral-300 rounded-lg focus:outline-none focus:ring-2
                       focus:ring-primary-500 focus:border-primary-500 transition-colors
                       disabled:bg-neutral-50 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleExtract}
            disabled={!urlInput.trim() || isExtracting || loading}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm
                       font-medium rounded-lg transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isExtracting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Extrayendo...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Extraer texto
              </>
            )}
          </button>
        </div>

        {/* Extraction error message */}
        {extractionError && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-error-50 border border-error-200 rounded-lg">
            <svg
              className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-error-700">{extractionError}</p>
          </div>
        )}

        {/* Extraction success message */}
        {extractionSuccess && !extractionError && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
            <svg
              className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-secondary-700">
              Texto extraido. Revisalo y haz clic en Analizar.
            </p>
          </div>
        )}
      </div>

      {/* Textarea Card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor="job-description"
            className="text-sm font-medium text-neutral-700"
          >
            Descripcion de la oferta
          </label>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm ${
                isTooLong
                  ? 'text-error-600 font-medium'
                  : isTooShort
                  ? 'text-warning-600'
                  : 'text-neutral-500'
              }`}
            >
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} caracteres
            </span>
            {text && (
              <button
                onClick={handleClear}
                disabled={loading}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-50"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <textarea
          id="job-description"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setExtractionSuccess(false);
          }}
          disabled={loading}
          placeholder={`Pega aqui la descripcion completa de la oferta...\n\nEjemplo:\nBuscamos un Desarrollador Senior Full Stack para unirse a nuestro equipo...\n\nRequisitos:\n- 5+ anos de experiencia con React y Node.js\n- Solido conocimiento de TypeScript\n- Experiencia con servicios AWS\n...`}
          className="w-full min-h-[300px] px-4 py-3 text-base text-neutral-900
                   placeholder:text-neutral-400 border border-neutral-300 rounded-lg
                   resize-y focus:outline-none focus:ring-2 focus:ring-primary-500
                   focus:border-primary-500 transition-colors disabled:bg-neutral-50
                   disabled:cursor-not-allowed"
        />

        {/* Validation Messages */}
        {showWarning && isTooShort && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <svg
              className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-warning-700">
              La descripcion es muy corta. Pega la oferta completa (minimo {MIN_CHARS}{' '}
              caracteres).
            </p>
          </div>
        )}

        {showWarning && isTooLong && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-error-50 border border-error-200 rounded-lg">
            <svg
              className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-error-700">
              La descripcion es demasiado larga. Maximo {MAX_CHARS.toLocaleString()}{' '}
              caracteres permitidos. Intenta pegar solo la seccion de requisitos.
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600
                   hover:from-primary-700 hover:to-secondary-700 text-white font-medium
                   rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm
                   disabled:hover:from-primary-600 disabled:hover:to-secondary-600
                   flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analizando...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Analizar Oferta
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <p className="text-center text-sm text-neutral-500 mt-4">
        El analisis tarda aproximadamente 10-15 segundos
      </p>
    </div>
  );
}

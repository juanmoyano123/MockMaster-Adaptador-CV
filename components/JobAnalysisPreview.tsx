/**
 * Job Analysis Preview Component
 * Feature: F-003, F-007
 *
 * Displays the structured analysis of a job description with
 * required/preferred skills, responsibilities, and metadata.
 * Includes "Save to Library" functionality (F-007).
 */

'use client';

import { useState } from 'react';
import { JobAnalysis } from '@/lib/types';
import { jobLibraryStorage } from '@/lib/job-library-storage';

interface JobAnalysisPreviewProps {
  analysis: JobAnalysis;
  onAnalyzeNew: () => void;
  onProceedToAdaptation: () => void;
  isCached?: boolean;
}

export default function JobAnalysisPreview({
  analysis,
  onAnalyzeNew,
  onProceedToAdaptation,
  isCached = false,
}: JobAnalysisPreviewProps) {
  const { job_title, company_name, required_skills, preferred_skills, responsibilities, seniority_level, industry } = analysis.analysis;

  // F-007: Save to Library state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState(
    job_title !== 'Not specified'
      ? `${job_title}${company_name !== 'Not specified' ? ` - ${company_name}` : ''}`
      : ''
  );
  const [saveTags, setSaveTags] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(() =>
    jobLibraryStorage.existsByHash(analysis.text_hash)
  );

  const handleSaveToLibrary = () => {
    setSaveError(null);

    if (!saveName.trim()) {
      setSaveError('Por favor ingresa un nombre para esta oferta');
      return;
    }

    try {
      const tags = saveTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      jobLibraryStorage.save(saveName.trim(), tags, analysis);

      setSaveSuccess(true);
      setIsSaved(true);

      // Hide modal after brief success message
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">
              {job_title !== 'Not specified' ? job_title : 'Job Analysis'}
            </h1>
            {company_name !== 'Not specified' && (
              <p className="text-lg text-neutral-600">at {company_name}</p>
            )}
          </div>
          {isCached && (
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
              Cached
            </span>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {seniority_level !== 'Not specified' && (
            <span className="px-3 py-1 bg-neutral-200 text-neutral-700 text-sm font-medium rounded-full">
              {seniority_level}
            </span>
          )}
          {industry !== 'Not specified' && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
              {industry}
            </span>
          )}
        </div>
      </div>

      {/* Analysis Content */}
      <div className="space-y-6">
        {/* Required Skills */}
        {required_skills.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-secondary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Required Skills (Must-have)
            </h2>
            <div className="flex flex-wrap gap-2">
              {required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Skills */}
        {preferred_skills.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Preferred Skills (Nice-to-have)
            </h2>
            <div className="flex flex-wrap gap-2">
              {preferred_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {responsibilities.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-neutral-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Key Responsibilities
            </h2>
            <ul className="space-y-2">
              {responsibilities.map((responsibility, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-neutral-700"
                >
                  <span className="text-primary-600 mt-1.5">•</span>
                  <span className="flex-1">{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={onProceedToAdaptation}
          className="flex-1 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Adaptar CV
        </button>

        {/* F-007: Save to Library Button */}
        <button
          onClick={() => setShowSaveModal(true)}
          disabled={isSaved}
          className={`px-6 py-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isSaved ? 'bg-secondary-100 text-secondary-700 border border-secondary-200 cursor-default' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}
        >
          {isSaved ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Guardada
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Guardar en Biblioteca
            </>
          )}
        </button>

        <button
          onClick={onAnalyzeNew}
          className="px-6 py-4 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Otra Oferta
        </button>
      </div>

      {/* Timestamp */}
      <p className="text-center text-sm text-neutral-500 mt-4">
        Analizado el {new Date(analysis.analyzed_at).toLocaleString('es-ES')}
      </p>

      {/* F-007: Save to Library Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            {saveSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Guardado exitosamente</h3>
                <p className="text-neutral-600 mt-1">Puedes encontrarla en &quot;Mis Ofertas&quot;</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Guardar en Biblioteca</h3>
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="p-1 hover:bg-neutral-100 rounded transition-colors"
                  >
                    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-neutral-600 mb-4">
                  Guarda esta oferta para poder adaptar tu CV rapidamente en el futuro.
                </p>

                {saveError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {saveError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Ej: Comercial B2B - TechCorp"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Etiquetas (opcional)
                    </label>
                    <input
                      type="text"
                      value={saveTags}
                      onChange={(e) => setSaveTags(e.target.value)}
                      placeholder="ventas, tech, remoto (separadas por coma)"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Las etiquetas te ayudan a organizar y buscar ofertas
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveToLibrary}
                    className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

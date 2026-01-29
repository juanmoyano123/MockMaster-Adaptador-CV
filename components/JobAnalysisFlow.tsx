/**
 * Job Analysis Flow - Main Orchestrator Component
 * Feature: F-003
 *
 * Manages the complete job analysis workflow:
 * 1. Check if resume exists (prerequisite)
 * 2. Input job description OR show cached analysis
 * 3. Call API or use cache
 * 4. Display analysis results
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JobDescriptionInput from './JobDescriptionInput';
import JobAnalysisPreview from './JobAnalysisPreview';
import { jobAnalysisStorage } from '@/lib/job-storage';
import { resumeStorage } from '@/lib/storage';
import { hashText } from '@/utils/text-hash';
import { JobAnalysis, JobAnalysisAPIError } from '@/lib/types';

type Step = 'input' | 'preview';

export default function JobAnalysisFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Check prerequisites on mount
  useEffect(() => {
    // Verify resume exists
    if (!resumeStorage.hasResume()) {
      showErrorToast('Primero debes subir tu CV');
      router.push('/upload');
      return;
    }

    // Check if job analysis already exists
    const existing = jobAnalysisStorage.get();
    if (existing) {
      setAnalysis(existing);
      setStep('preview');
      setIsCached(true);
    }
  }, [router]);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleAnalyze = async (text: string) => {
    setLoading(true);
    setError(null);
    setIsCached(false);

    try {
      // Calculate text hash for caching
      const textHash = await hashText(text);

      // Check if we have cached analysis
      if (jobAnalysisStorage.isCached(textHash)) {
        const cached = jobAnalysisStorage.get();
        if (cached) {
          setAnalysis(cached);
          setStep('preview');
          setIsCached(true);
          showSuccessToast('Using cached analysis');
          setLoading(false);
          return;
        }
      }

      // Call API
      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = data as JobAnalysisAPIError;
        throw new Error(apiError.error || 'Failed to analyze job description');
      }

      // Construct full JobAnalysis object
      const fullAnalysis: JobAnalysis = {
        raw_text: text,
        text_hash: data.text_hash,
        analysis: data.analysis,
        analyzed_at: data.analyzed_at,
      };

      // Save to localStorage
      jobAnalysisStorage.save(fullAnalysis);

      // Update state
      setAnalysis(fullAnalysis);
      setStep('preview');
      showSuccessToast('Job description analyzed successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to analyze job description';
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    jobAnalysisStorage.delete();
    setAnalysis(null);
    setStep('input');
    setIsCached(false);
    setError(null);
  };

  const handleProceedToAdaptation = () => {
    // Navigate to F-004 (Resume Adaptation)
    router.push('/adapt-resume');
  };

  return (
    <>
      {/* Main Content */}
      {step === 'input' && (
        <JobDescriptionInput onAnalyze={handleAnalyze} loading={loading} />
      )}

      {step === 'preview' && analysis && (
        <JobAnalysisPreview
          analysis={analysis}
          onAnalyzeNew={handleReset}
          onProceedToAdaptation={handleProceedToAdaptation}
          isCached={isCached}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          className="fixed bottom-4 right-4 z-50 animate-slide-up"
          role="alert"
          aria-live="polite"
        >
          <div
            className={`
              px-6 py-4 rounded-lg shadow-lg flex items-center gap-3
              ${
                toastType === 'success'
                  ? 'bg-success-600 text-white'
                  : 'bg-error-600 text-white'
              }
            `}
          >
            {toastType === 'success' ? (
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p className="font-medium">{toastMessage}</p>
            <button
              onClick={() => setShowToast(false)}
              className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

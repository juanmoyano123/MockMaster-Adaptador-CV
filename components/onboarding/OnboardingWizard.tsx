/**
 * OnboardingWizard Component
 * Feature: F-008
 *
 * Main orchestrator for the 3-step onboarding flow:
 *   Step 0: Upload Resume (paste text)
 *   Step 1: Add Job Description (paste & analyze)
 *   Step 2: Generate First Adapted Resume
 *
 * Auto-detects the current step from localStorage state:
 *   - No resume → Step 0
 *   - Resume but no job analysis → Step 1
 *   - Both resume and job analysis → Step 2
 *
 * On completion, shows CelebrationModal which marks onboarding
 * as complete and navigates to /dashboard.
 */

'use client';

import { useState, useEffect } from 'react';
import { resumeStorage } from '@/lib/storage';
import { jobAnalysisStorage } from '@/lib/job-storage';
import { AdaptedResume } from '@/lib/types';
import OnboardingProgress from './OnboardingProgress';
import StepUploadResume from './StepUploadResume';
import StepAddJobDescription from './StepAddJobDescription';
import StepGenerateResume from './StepGenerateResume';
import CelebrationModal from './CelebrationModal';

/** Step definitions used by OnboardingProgress */
const STEPS = [
  { id: 0, label: 'Tu CV' },
  { id: 1, label: 'La oferta' },
  { id: 2, label: 'Generar' },
];

/**
 * Determines the initial step by inspecting localStorage.
 * Must be called client-side (after hydration).
 */
function detectInitialStep(): number {
  try {
    const hasResume = resumeStorage.hasResume();
    if (!hasResume) return 0;

    const hasJob = jobAnalysisStorage.has();
    if (!hasJob) return 1;

    return 2;
  } catch {
    return 0;
  }
}

export default function OnboardingWizard() {
  // Start at 0 to avoid hydration mismatch; we correct after mount
  const [currentStep, setCurrentStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [adaptedResume, setAdaptedResume] = useState<AdaptedResume | null>(null);

  // After hydration: detect the correct starting step from localStorage
  useEffect(() => {
    setCurrentStep(detectInitialStep());
    setIsMounted(true);
  }, []);

  // -------------------------------------------------------
  // Handlers passed to each step
  // -------------------------------------------------------

  const handleStep0Complete = () => {
    setCurrentStep(1);
  };

  const handleStep1Complete = () => {
    setCurrentStep(2);
  };

  const handleStep2Complete = (result: AdaptedResume) => {
    setAdaptedResume(result);
    setShowCelebration(true);
  };

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------

  // Avoid hydration mismatch: render nothing until client is ready
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Brand logo / wordmark */}
          <div className="text-center mb-8">
            <a href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-neutral-900">MockMaster</span>
            </a>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <OnboardingProgress currentStep={currentStep} steps={STEPS} />
          </div>

          {/* Step card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {currentStep === 0 && (
              <StepUploadResume onComplete={handleStep0Complete} />
            )}
            {currentStep === 1 && (
              <StepAddJobDescription onComplete={handleStep1Complete} />
            )}
            {currentStep === 2 && (
              <StepGenerateResume onComplete={handleStep2Complete} />
            )}
          </div>

          {/* Step indicator text below card */}
          <p className="text-center text-xs text-neutral-400 mt-4">
            Paso {currentStep + 1} de {STEPS.length}
          </p>
        </div>
      </div>

      {/* Celebration modal - rendered on top of everything */}
      {showCelebration && adaptedResume && (
        <CelebrationModal adaptedResume={adaptedResume} />
      )}
    </>
  );
}

/**
 * CelebrationModal Component
 * Feature: F-008 - Onboarding Wizard Completion
 *
 * Full-screen overlay shown when the user generates their first adapted CV.
 * Marks onboarding as complete in localStorage and navigates to /dashboard.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdaptedResume } from '@/lib/types';

const ONBOARDING_COMPLETE_KEY = 'mockmaster_onboarding_complete';

interface CelebrationModalProps {
  adaptedResume: AdaptedResume;
}

export default function CelebrationModal({ adaptedResume }: CelebrationModalProps) {
  const router = useRouter();

  // Mark onboarding complete as soon as modal renders
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch {
      // If localStorage fails, we still let the user proceed
      console.warn('No se pudo marcar el onboarding como completo en localStorage');
    }
  }, []);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const atsScore = adaptedResume?.ats_score;

  return (
    /* Full-screen backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="celebration-heading"
    >
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-8 text-center space-y-6 animate-fade-in-up">

        {/* Celebration icon */}
        <div className="relative mx-auto w-20 h-20">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 animate-pulse" />
          {/* Icon container */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2
            id="celebration-heading"
            className="text-2xl font-bold text-neutral-900"
          >
            Tu primer CV adaptado esta listo!
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Estas por delante del{' '}
            <span className="font-semibold text-primary-600">95%</span>
            {' '}de los candidatos que aplican con CVs genericos
          </p>
        </div>

        {/* ATS score badge (only if available) */}
        {typeof atsScore === 'number' && atsScore > 0 && (
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 rounded-xl">
            {/* Score ring */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg
                className="w-12 h-12 -rotate-90"
                viewBox="0 0 36 36"
                aria-hidden="true"
              >
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                />
                {/* Score arc */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="3"
                  strokeDasharray={`${atsScore} ${100 - atsScore}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-700">
                {atsScore}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-neutral-500">Puntaje ATS</p>
              <p className="text-sm font-bold text-neutral-900">
                {atsScore >= 80 ? 'Excelente' : atsScore >= 60 ? 'Muy bueno' : 'Bueno'}
              </p>
            </div>
          </div>
        )}

        {/* Key achievements highlights */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-neutral-400 font-medium">Palabras clave</p>
            <p className="text-sm font-semibold text-neutral-900 mt-0.5">Optimizadas</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-neutral-400 font-medium">Compatible ATS</p>
            <p className="text-sm font-semibold text-neutral-900 mt-0.5">Listo para aplicar</p>
          </div>
        </div>

        {/* CTA button */}
        <button
          onClick={handleGoToDashboard}
          className="w-full h-12 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <span>Ir al Dashboard</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Reminder */}
        <p className="text-xs text-neutral-400">
          Podras descargar tu CV en PDF desde el dashboard
        </p>
      </div>

      {/* Keyframe animation */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}

/**
 * OnboardingProgress Component
 * Feature: F-008
 *
 * Visual step indicator for the onboarding wizard.
 * Shows numbered circles connected by lines, with check icons for completed steps.
 * Follows the design system spec (primary-600, neutral palette).
 */

'use client';

interface Step {
  id: number;
  label: string;
}

interface OnboardingProgressProps {
  currentStep: number; // 0-indexed
  steps: Step[];
}

export default function OnboardingProgress({ currentStep, steps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {/* Step circle */}
          <div className="flex items-center gap-2">
            <div
              className={[
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                index < currentStep
                  ? 'bg-primary-600 text-white'
                  : index === currentStep
                  ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                  : 'bg-neutral-200 text-neutral-500',
              ].join(' ')}
            >
              {index < currentStep ? (
                // Check icon (inline SVG - no external library)
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Step label - hidden on very small screens */}
            <span
              className={[
                'text-sm font-medium hidden sm:block transition-colors duration-300',
                index <= currentStep ? 'text-neutral-800' : 'text-neutral-400',
              ].join(' ')}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line between steps */}
          {index < steps.length - 1 && (
            <div
              className={[
                'w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 transition-colors duration-300',
                index < currentStep ? 'bg-primary-600' : 'bg-neutral-200',
              ].join(' ')}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}

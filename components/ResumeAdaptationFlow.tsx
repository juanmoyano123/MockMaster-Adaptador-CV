/**
 * Resume Adaptation Flow Component
 * Feature: F-004
 *
 * Main orchestrator for the AI resume adaptation feature
 * Handles prerequisites check, API calls, validation, and display
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resumeStorage } from '@/lib/storage';
import { jobAnalysisStorage } from '@/lib/job-storage';
import { adaptedResumeStorage } from '@/lib/adapted-resume-storage';
import { validateNoHallucination } from '@/lib/validation';
import { AdaptedResume, ResumeData, JobAnalysis } from '@/lib/types';
import AdaptedResumePreview from './AdaptedResumePreview';

export default function ResumeAdaptationFlow() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [adaptedResume, setAdaptedResume] = useState<AdaptedResume | null>(null);
  const [originalResume, setOriginalResume] = useState<ResumeData | null>(null);
  const [jobAnalysisData, setJobAnalysisData] = useState<JobAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check prerequisites on mount
  useEffect(() => {
    setIsMounted(true);
    const resume = resumeStorage.getResume();
    const jobAnalysis = jobAnalysisStorage.get();
    const existingAdaptation = adaptedResumeStorage.get();

    setOriginalResume(resume);
    setJobAnalysisData(jobAnalysis);

    // If we have an existing adaptation, show it
    if (existingAdaptation && resume) {
      setAdaptedResume(existingAdaptation);
    }
  }, []);

  // Prerequisites check
  const checkPrerequisites = (): {
    resume: ResumeData | null;
    jobAnalysis: JobAnalysis | null;
  } => {
    const resume = resumeStorage.getResume();
    const jobAnalysis = jobAnalysisStorage.get();
    return { resume, jobAnalysis };
  };

  // Handle adaptation
  const handleAdaptResume = async () => {
    setIsAdapting(true);
    setError(null);
    setProgress('Analyzing resume...');

    try {
      const { resume, jobAnalysis } = checkPrerequisites();

      if (!resume) {
        throw new Error('Resume not found. Please upload your resume first.');
      }

      if (!jobAnalysis) {
        throw new Error(
          'Job analysis not found. Please analyze a job description first.'
        );
      }

      setProgress('Matching keywords...');

      // Call API
      const response = await fetch('/api/adapt-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume, jobAnalysis }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adapt resume');
      }

      setProgress('Reformulating content...');
      const data: AdaptedResume = await response.json();

      // Client-side validation (redundant, but extra safety)
      const validation = validateNoHallucination(resume, data);
      if (!validation.valid) {
        throw new Error(
          `Validation failed: ${validation.errors.join(', ')}`
        );
      }

      // NEW (F-005): Calculate detailed ATS breakdown
      setProgress('Calculating ATS score breakdown...');
      try {
        const breakdownResponse = await fetch('/api/calculate-ats-breakdown', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adapted_content: data.adapted_content,
            job_analysis: jobAnalysis,
          }),
        });

        if (breakdownResponse.ok) {
          const breakdownData = await breakdownResponse.json();
          data.ats_breakdown = breakdownData.breakdown;
          console.log('ATS breakdown calculated:', breakdownData.breakdown);
        } else {
          console.warn('Failed to calculate ATS breakdown, continuing without it');
        }
      } catch (breakdownError) {
        console.error('Error calculating ATS breakdown:', breakdownError);
        // Non-critical error - continue without breakdown
      }

      setProgress('Done!');

      // Save to localStorage
      adaptedResumeStorage.save(data);

      // Update state
      setAdaptedResume(data);
      setOriginalResume(resume);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Adaptation error:', err);
    } finally {
      setIsAdapting(false);
      setTimeout(() => setProgress(''), 1000);
    }
  };

  // Handle retry after error
  const handleRetry = () => {
    setError(null);
    handleAdaptResume();
  };

  // Handle start over
  const handleStartOver = () => {
    if (
      confirm(
        'This will delete all your data (resume, job analysis, and adapted resume). Are you sure?'
      )
    ) {
      adaptedResumeStorage.clearAll();
      router.push('/');
    }
  };

  // PDF download and edit mode are now handled in AdaptedResumePreview component (F-006, F-012)

  // Don't render until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check prerequisites
  const { resume, jobAnalysis } = checkPrerequisites();

  // Missing resume
  if (!resume) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Resume Required
          </h2>
          <p className="text-yellow-700 mb-4">
            You need to upload your resume before adapting it. Please upload
            your resume first.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  // Missing job analysis
  if (!jobAnalysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            Job Analysis Required
          </h2>
          <p className="text-blue-700 mb-4">
            You need to analyze a job description before adapting your resume.
            Please analyze a job description first.
          </p>
          <button
            onClick={() => router.push('/analyze-job')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze Job Description
          </button>
        </div>
      </div>
    );
  }

  // Show adapted resume if available
  if (adaptedResume && originalResume) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Adapted Resume
          </h1>
          <p className="text-gray-600">
            AI-optimized to match the job requirements
          </p>
        </div>

        {/* Preview */}
        <AdaptedResumePreview
          resume={adaptedResume}
          original={originalResume}
          jobAnalysisCompanyName={jobAnalysisData?.analysis.company_name}
        />

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={handleStartOver}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg"
          >
            Start Over
          </button>
        </div>

        {/* Re-adapt button */}
        <div className="text-center">
          <button
            onClick={() => {
              if (
                confirm(
                  'This will replace your current adaptation. Continue?'
                )
              ) {
                handleAdaptResume();
              }
            }}
            disabled={isAdapting}
            className="text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Re-adapt Resume
          </button>
        </div>
      </div>
    );
  }

  // Show adaptation CTA
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Adapt Your Resume
        </h1>
        <p className="text-lg text-gray-600">
          Our AI will intelligently adapt your resume to match the job
          requirements in under 30 seconds.
        </p>
      </div>

      {/* What We'll Do */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          What Our AI Will Do:
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Rewrite Professional Summary
              </h3>
              <p className="text-gray-600">
                Include 3-5 keywords from the job description naturally
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Reorder Work Experiences
              </h3>
              <p className="text-gray-600">
                Most relevant experiences first (ignoring chronology)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Reformulate Bullet Points
              </h3>
              <p className="text-gray-600">
                Emphasize relevant skills and use action verbs from the job
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">4</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Reorder Skills</h3>
              <p className="text-gray-600">
                Required skills first, then preferred skills, then others
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Won't Do */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          What We Won't Do:
        </h2>
        <div className="space-y-2 text-gray-700">
          <p className="flex items-center gap-2">
            <span className="text-red-500 font-bold">✕</span>
            Invent fake companies, skills, or experiences
          </p>
          <p className="flex items-center gap-2">
            <span className="text-red-500 font-bold">✕</span>
            Change your contact information or education
          </p>
          <p className="flex items-center gap-2">
            <span className="text-red-500 font-bold">✕</span>
            Modify dates or job titles (beyond formatting)
          </p>
          <p className="flex items-center gap-2">
            <span className="text-red-500 font-bold">✕</span>
            Add skills you don't have
          </p>
        </div>
        <p className="mt-4 text-sm text-gray-600 italic">
          Our AI only reorganizes, reformulates, and emphasizes your EXISTING
          content. Your resume stays 100% truthful.
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <button
          onClick={handleAdaptResume}
          disabled={isAdapting}
          className="bg-blue-600 text-white px-12 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isAdapting ? 'Adapting...' : 'Generate Adapted Resume'}
        </button>

        {/* Progress indicator */}
        {isAdapting && progress && (
          <div className="mt-4">
            <p className="text-gray-600 animate-pulse">{progress}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-md mx-auto">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width:
                    progress === 'Analyzing resume...'
                      ? '33%'
                      : progress === 'Matching keywords...'
                      ? '66%'
                      : '100%',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

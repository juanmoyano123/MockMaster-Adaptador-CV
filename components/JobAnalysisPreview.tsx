/**
 * Job Analysis Preview Component
 * Feature: F-003
 *
 * Displays the structured analysis of a job description with
 * required/preferred skills, responsibilities, and metadata.
 */

'use client';

import { JobAnalysis } from '@/lib/types';

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
          className="flex-1 px-6 py-4 bg-primary-600 hover:bg-primary-700
                   text-white font-semibold rounded-lg shadow-sm hover:shadow-md
                   transition-all duration-200 flex items-center justify-center gap-2"
        >
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
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          Proceed to Resume Adaptation
        </button>

        <button
          onClick={onAnalyzeNew}
          className="px-6 py-4 bg-white border border-neutral-300 text-neutral-700
                   hover:bg-neutral-50 font-medium rounded-lg transition-colors
                   flex items-center justify-center gap-2"
        >
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Analyze Different Job
        </button>
      </div>

      {/* Timestamp */}
      <p className="text-center text-sm text-neutral-500 mt-4">
        Analyzed on {new Date(analysis.analyzed_at).toLocaleString()}
      </p>
    </div>
  );
}

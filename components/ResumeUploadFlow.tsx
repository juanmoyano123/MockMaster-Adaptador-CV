/**
 * ResumeUploadFlow Component
 * Orchestrates the entire upload/preview/save flow
 * Feature: F-002
 */

'use client';

import { useState, useEffect } from 'react';
import { ResumeData, ParsedContent } from '@/lib/types';
import { resumeStorage } from '@/lib/storage';
import ResumeUpload from './ResumeUpload';
import ResumePreview from './ResumePreview';

export default function ResumeUploadFlow() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing resume on mount
  useEffect(() => {
    try {
      const existingResume = resumeStorage.getResume();
      if (existingResume) {
        setResumeData(existingResume);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Failed to load resume from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle parsed resume from upload
   */
  const handleParsed = (parsedContent: ParsedContent, originalText: string, fileName: string) => {
    const newResume: ResumeData = {
      name: fileName,
      original_text: originalText,
      parsed_content: parsedContent,
      uploaded_at: new Date().toISOString(),
    };

    setResumeData(newResume);
    setShowPreview(true);
  };

  /**
   * Handle save to localStorage
   */
  const handleSave = (data: ResumeData) => {
    try {
      resumeStorage.saveResume(data);
      setResumeData(data);
      setSaveSuccess(true);

      // Show success message for 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

      // Warn if storage size is large
      if (resumeStorage.shouldWarnStorageSize()) {
        console.warn(
          `Resume storage size: ${resumeStorage.getStorageSizeFormatted()}. Consider reducing file size.`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to save resume: ${error.message}`);
      } else {
        alert('Failed to save resume. Please try again.');
      }
    }
  };

  /**
   * Handle upload new resume
   */
  const handleUploadNew = () => {
    const confirmed = confirm(
      'Are you sure you want to upload a new resume? This will replace your current resume.'
    );

    if (confirmed) {
      setShowPreview(false);
      setResumeData(null);
    }
  };

  /**
   * Handle delete resume
   */
  const handleDelete = () => {
    const confirmed = confirm(
      'Are you sure you want to delete your resume? This action cannot be undone.'
    );

    if (confirmed) {
      resumeStorage.deleteResume();
      setResumeData(null);
      setShowPreview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            MockMaster
          </h1>
          <p className="text-xl text-gray-600">
            Upload your resume to get started
          </p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <p className="text-teal-700 font-medium">Resume saved successfully!</p>
                <p className="text-teal-600 text-sm mt-1">
                  Your resume is stored locally in your browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {showPreview && resumeData ? (
          <div>
            <ResumePreview
              resumeData={resumeData}
              onSave={handleSave}
              onUploadNew={handleUploadNew}
            />

            {/* Additional Actions */}
            <div className="mt-6 max-w-4xl mx-auto flex items-center justify-between text-sm">
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 underline"
              >
                Delete Resume
              </button>
              <div className="text-gray-500">
                Last updated: {new Date(resumeData.uploaded_at).toLocaleDateString()}
              </div>
            </div>

            {/* Next Step: Analyze Job */}
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Ready for the next step?
                </h3>
                <p className="text-neutral-700 mb-4">
                  Now that your resume is uploaded, paste a job description to get AI-powered analysis
                  of requirements and skills.
                </p>
                <a
                  href="/analyze-job"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600
                           hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-lg
                           shadow-sm hover:shadow-md transition-all duration-200"
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Analyze Job Description
                </a>
              </div>
            </div>
          </div>
        ) : (
          <ResumeUpload onParsed={handleParsed} />
        )}

        {/* Info Box */}
        {!showPreview && (
          <div className="mt-12 max-w-2xl mx-auto p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              How it works
            </h3>
            <ol className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Upload your resume (PDF or DOCX) or paste the text</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>AI extracts and structures your information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Review and edit your information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Save to your browser (no account needed)</span>
              </li>
            </ol>
            <p className="text-xs text-blue-600 mt-4">
              Your resume is stored locally in your browser. No data is sent to external servers except for AI processing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

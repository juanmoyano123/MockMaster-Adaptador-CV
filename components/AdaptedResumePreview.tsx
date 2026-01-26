/**
 * Adapted Resume Preview Component
 * Feature: F-004 (Enhanced with F-006 PDF Export and F-012 Edit Mode)
 *
 * Displays the AI-adapted resume with highlighted changes
 * Shows summary, experience, education, and skills
 * Includes PDF download and template selection (F-006)
 * Supports inline editing with auto-save (F-012)
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AdaptedResume, ResumeData, TemplateType, AdaptedContent } from '@/lib/types';
import ATSScoreDisplay from './ATSScoreDisplay';
import DownloadPDFButton from './DownloadPDFButton';
import TemplateSelectorModal from './TemplateSelectorModal';
import EditableSummary from './EditableSummary';
import EditableExperience from './EditableExperience';
import EditableSkills from './EditableSkills';
import ResetConfirmationDialog from './ResetConfirmationDialog';
import {
  getPreferredTemplate,
  saveTemplatePreference,
} from '@/lib/template-preferences';
import { adaptedResumeStorage } from '@/lib/adapted-resume-storage';

interface AdaptedResumePreviewProps {
  resume: AdaptedResume;
  original: ResumeData;
  jobAnalysisCompanyName?: string;
}

// Debounce helper function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function AdaptedResumePreview({
  resume,
  original,
  jobAnalysisCompanyName = 'Company',
}: AdaptedResumePreviewProps) {
  const { adapted_content, ats_score, changes_summary } = resume;

  // PDF Template Selection State (F-006)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Edit Mode State (F-012)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<AdaptedContent | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [sectionsEdited, setSectionsEdited] = useState<Set<string>>(new Set());
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Load preferences and edited content on mount
  useEffect(() => {
    setIsMounted(true);
    const preferredTemplate = getPreferredTemplate();
    setSelectedTemplate(preferredTemplate);

    // Load edited version if exists
    const edited = adaptedResumeStorage.getEdited();
    if (edited) {
      setEditedContent(edited.adapted_content);
      setSectionsEdited(new Set(edited.sections_edited));
    }
  }, []);

  // Get current content (edited or original)
  const currentContent = editedContent || adapted_content;

  // Debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce((content: AdaptedContent, sections: string[]) => {
        setSaveStatus('saving');
        try {
          adaptedResumeStorage.saveEdited(content, sections);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
          console.error('Failed to save edits:', error);
          setSaveStatus('idle');
          alert('Failed to save changes. Please try again.');
        }
      }, 500),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending saves
    };
  }, []);

  // Handle content changes
  const handleContentChange = useCallback(
    (section: string, value: any) => {
      const newContent = { ...currentContent, [section]: value };
      setEditedContent(newContent);

      const newSections = new Set(sectionsEdited);
      newSections.add(section);
      setSectionsEdited(newSections);

      debouncedSave(newContent, Array.from(newSections));
    },
    [currentContent, sectionsEdited, debouncedSave]
  );

  // Handle template selection
  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
    saveTemplatePreference(template);
  };

  // Handle reset to AI version
  const handleReset = () => {
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    adaptedResumeStorage.resetToAIVersion();
    setEditedContent(null);
    setSectionsEdited(new Set());
    setShowResetDialog(false);
    setIsEditMode(false);
    setSaveStatus('idle');
  };

  const cancelReset = () => {
    setShowResetDialog(false);
  };

  // Get content for PDF export
  const contentForPDF = adaptedResumeStorage.getContentForExport() || adapted_content;
  const hasEdits = adaptedResumeStorage.hasEdits();

  return (
    <div className="space-y-8">
      {/* Edit Mode Controls (F-012) */}
      {isMounted && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Edit Toggle Button */}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isEditMode
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
                }`}
              >
                {isEditMode ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Editing Mode
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Resume
                  </>
                )}
              </button>

              {/* Save Status Indicator */}
              {saveStatus !== 'idle' && (
                <div className="flex items-center gap-2 text-sm">
                  {saveStatus === 'saving' ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-blue-600"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-gray-600">Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-green-600 font-medium">Saved</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Reset Button (only show if has edits) */}
            {sectionsEdited.size > 0 && (
              <button
                onClick={handleReset}
                className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
              >
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset to AI Version
              </button>
            )}
          </div>
        </div>
      )}

      {/* PDF Download Actions (F-006) */}
      {isMounted && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Ready to Download?
              </h3>
              <p className="text-sm text-gray-600">
                Current template: <span className="font-semibold capitalize">{selectedTemplate}</span>
                {hasEdits && (
                  <span className="ml-2 text-green-600 font-medium">
                    (using your edited version)
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                Choose Template
              </button>
              <DownloadPDFButton
                adaptedContent={contentForPDF}
                companyName={jobAnalysisCompanyName}
                template={selectedTemplate}
                hasEdits={hasEdits}
              />
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {isTemplateModalOpen && (
        <TemplateSelectorModal
          adaptedContent={contentForPDF}
          currentTemplate={selectedTemplate}
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setIsTemplateModalOpen(false)}
        />
      )}

      {/* Reset Confirmation Dialog */}
      <ResetConfirmationDialog
        isOpen={showResetDialog}
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />

      {/* Header: ATS Score + Changes Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* ATS Score */}
          <div className="flex-shrink-0">
            <ATSScoreDisplay score={ats_score} />
          </div>

          {/* Changes Summary */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Changes Made
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {changes_summary.skills_highlighted}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Skills Highlighted
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {changes_summary.bullets_reformulated}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Bullets Reformulated
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {changes_summary.experiences_reordered ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Experiences Reordered
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adapted Resume Content */}
      <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
        {/* Contact Information (Read-only) */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentContent.contact.name}
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            <span>{currentContent.contact.email}</span>
            {currentContent.contact.phone && (
              <span>{currentContent.contact.phone}</span>
            )}
            {currentContent.contact.linkedin && (
              <span>{currentContent.contact.linkedin}</span>
            )}
            {currentContent.contact.location && (
              <span>{currentContent.contact.location}</span>
            )}
          </div>
        </div>

        {/* Professional Summary (Editable in F-012) */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            Professional Summary
            {currentContent.summary !== original.parsed_content.summary && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Updated
              </span>
            )}
          </h2>
          <EditableSummary
            value={currentContent.summary}
            onChange={(value) => handleContentChange('summary', value)}
            isEditMode={isEditMode}
            wasModified={currentContent.summary !== adapted_content.summary}
          />
        </div>

        {/* Work Experience (Editable in F-012) */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Work Experience
            {changes_summary.experiences_reordered && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Reordered by Relevance
              </span>
            )}
          </h2>
          <EditableExperience
            experiences={currentContent.experience}
            originalExperiences={original.parsed_content.experience}
            onChange={(value) => handleContentChange('experience', value)}
            isEditMode={isEditMode}
          />
        </div>

        {/* Education (Read-only) */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Education</h2>
          <div className="space-y-3">
            {currentContent.education.map((edu, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700">{edu.school}</p>
                <p className="text-sm text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills (Editable in F-012) */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            Skills
            {changes_summary.skills_highlighted > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Reordered
              </span>
            )}
          </h2>
          <EditableSkills
            skills={currentContent.skills}
            highlightedCount={changes_summary.skills_highlighted}
            onChange={(value) => handleContentChange('skills', value)}
            isEditMode={isEditMode}
          />
        </div>
      </div>

      {/* Adaptation Info */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Resume adapted on{' '}
          {new Date(resume.adapted_at).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
        {hasEdits && (
          <p className="text-green-600 font-medium mt-1">
            Last edited{' '}
            {adaptedResumeStorage.getEdited()?.last_edited &&
              new Date(adaptedResumeStorage.getEdited()!.last_edited).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Adapted Resume Preview Component
 * Feature: F-004 (Enhanced with F-006 PDF Export)
 *
 * Displays the AI-adapted resume with highlighted changes
 * Shows summary, experience, education, and skills
 * Includes PDF download and template selection (F-006)
 */

'use client';

import { useState, useEffect } from 'react';
import { AdaptedResume, ResumeData, TemplateType } from '@/lib/types';
import ATSScoreDisplay from './ATSScoreDisplay';
import DownloadPDFButton from './DownloadPDFButton';
import TemplateSelectorModal from './TemplateSelectorModal';
import {
  getPreferredTemplate,
  saveTemplatePreference,
} from '@/lib/template-preferences';

interface AdaptedResumePreviewProps {
  resume: AdaptedResume;
  original: ResumeData;
  jobAnalysisCompanyName?: string;
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

  // Load template preference on mount
  useEffect(() => {
    setIsMounted(true);
    const preferredTemplate = getPreferredTemplate();
    setSelectedTemplate(preferredTemplate);
  }, []);

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
    saveTemplatePreference(template);
  };

  return (
    <div className="space-y-8">
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
                adaptedContent={adapted_content}
                companyName={jobAnalysisCompanyName}
                template={selectedTemplate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {isTemplateModalOpen && (
        <TemplateSelectorModal
          adaptedContent={adapted_content}
          currentTemplate={selectedTemplate}
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setIsTemplateModalOpen(false)}
        />
      )}

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
        {/* Contact Information */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {adapted_content.contact.name}
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            <span>{adapted_content.contact.email}</span>
            {adapted_content.contact.phone && (
              <span>{adapted_content.contact.phone}</span>
            )}
            {adapted_content.contact.linkedin && (
              <span>{adapted_content.contact.linkedin}</span>
            )}
            {adapted_content.contact.location && (
              <span>{adapted_content.contact.location}</span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            Professional Summary
            {adapted_content.summary !== original.parsed_content.summary && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Updated
              </span>
            )}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {adapted_content.summary}
          </p>
        </div>

        {/* Work Experience */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Work Experience
            {changes_summary.experiences_reordered && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Reordered by Relevance
              </span>
            )}
          </h2>
          <div className="space-y-6">
            {adapted_content.experience.map((exp, idx) => (
              <div key={idx} className="relative pl-4 border-l-2 border-blue-500">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {exp.title}
                  </h3>
                  <p className="text-md text-gray-700 font-medium">
                    {exp.company}
                  </p>
                  <p className="text-sm text-gray-500">{exp.dates}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Relevance: {exp.relevance_score}%
                    </span>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {exp.bullets.map((bullet, bulletIdx) => {
                    // Check if this bullet was reformulated
                    const originalExp = original.parsed_content.experience.find(
                      (e) => e.company === exp.company && e.title === exp.title
                    );
                    const wasReformulated =
                      originalExp &&
                      bulletIdx < originalExp.bullets.length &&
                      bullet !== originalExp.bullets[bulletIdx];

                    return (
                      <li
                        key={bulletIdx}
                        className={wasReformulated ? 'text-green-700 font-medium' : ''}
                      >
                        {bullet}
                        {wasReformulated && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Reformulated
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Education</h2>
          <div className="space-y-3">
            {adapted_content.education.map((edu, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700">{edu.school}</p>
                <p className="text-sm text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            Skills
            {changes_summary.skills_highlighted > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Reordered
              </span>
            )}
          </h2>
          <div className="flex flex-wrap gap-2">
            {adapted_content.skills.map((skill, idx) => {
              // Highlight top skills (first N skills that were reordered)
              const isHighlighted = idx < changes_summary.skills_highlighted;
              return (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isHighlighted
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
          </div>
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
      </div>
    </div>
  );
}

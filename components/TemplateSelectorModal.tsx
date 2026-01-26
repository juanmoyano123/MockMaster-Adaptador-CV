/**
 * Template Selector Modal Component
 * Feature: F-006
 *
 * Allows users to choose from 3 PDF templates: Clean, Modern, Compact
 */

'use client';

import { useState } from 'react';
import { AdaptedContent, TemplateType } from '@/lib/types';

interface TemplateSelectorModalProps {
  adaptedContent: AdaptedContent;
  currentTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  onClose: () => void;
}

interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  features: string[];
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'clean',
    name: 'Clean',
    description: 'Traditional, professional, ATS-friendly',
    features: [
      'Classic serif font (Georgia)',
      'Pure black text',
      'Maximum ATS compatibility',
      'Professional appearance',
    ],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with subtle color',
    features: [
      'Clean sans-serif font (Helvetica)',
      'Navy blue accents',
      'Polished, modern look',
      'Balanced readability',
    ],
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Maximum content in minimal space',
    features: [
      'Condensed font (Arial Narrow)',
      'Tight spacing',
      'Ideal for senior professionals',
      'Fits more content per page',
    ],
  },
];

export default function TemplateSelectorModal({
  currentTemplate,
  onSelectTemplate,
  onClose,
}: TemplateSelectorModalProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>(currentTemplate);

  const handleApply = () => {
    onSelectTemplate(selectedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choose Your Template
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select a professional template for your resume PDF
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Template Options */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMPLATE_OPTIONS.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`
                  cursor-pointer border-2 rounded-lg p-5 transition-all
                  ${
                    selectedTemplate === template.id
                      ? 'border-blue-600 shadow-lg bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }
                `}
              >
                {/* Template Preview Placeholder */}
                <div
                  className={`
                    rounded overflow-hidden mb-4 border
                    ${selectedTemplate === template.id ? 'border-blue-600' : 'border-gray-200'}
                  `}
                  style={{ height: '250px' }}
                >
                  <div
                    className={`
                      h-full flex items-center justify-center text-gray-400
                      ${
                        template.id === 'clean'
                          ? 'bg-gradient-to-br from-gray-50 to-gray-100'
                          : template.id === 'modern'
                            ? 'bg-gradient-to-br from-blue-50 to-blue-100'
                            : 'bg-gradient-to-br from-slate-50 to-slate-100'
                      }
                    `}
                  >
                    <div className="text-center p-4">
                      <svg
                        className="w-16 h-16 mx-auto mb-2 opacity-40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-xs font-medium">
                        {template.name} Template Preview
                      </p>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1">
                    {template.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-gray-700"
                      >
                        <svg
                          className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selected Badge */}
                {selectedTemplate === template.id && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-semibold">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Selected
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Your selection will be saved for future downloads
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

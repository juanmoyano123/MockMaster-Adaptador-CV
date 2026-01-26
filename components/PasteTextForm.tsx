/**
 * PasteTextForm Component
 * Allows users to paste resume text directly
 * Feature: F-002
 */

'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { validateTextLength } from '@/utils/file-validation';

interface PasteTextFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function PasteTextForm({ onSubmit, isLoading }: PasteTextFormProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate text
    const validation = validateTextLength(text);
    if (!validation.valid) {
      setError(validation.error || 'Invalid text');
      return;
    }

    onSubmit(text);
  };

  const charCount = text.length;
  const maxChars = 50 * 1024; // 50KB
  const percentUsed = (charCount / maxChars) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="resume-text" className="block text-sm font-medium text-gray-700 mb-2">
          Paste your resume text
        </label>
        <textarea
          id="resume-text"
          value={text}
          onChange={handleTextChange}
          placeholder="Paste your resume text here...&#10;&#10;Include:&#10;- Contact information&#10;- Work experience&#10;- Education&#10;- Skills"
          disabled={isLoading}
          className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            {charCount.toLocaleString()} characters
          </span>
          {percentUsed > 70 && (
            <span className={percentUsed > 90 ? 'text-red-600 font-medium' : 'text-yellow-600'}>
              {percentUsed.toFixed(0)}% of limit
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Parsing Resume...' : 'Parse Resume'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your text will be processed using AI to extract structured information
      </p>
    </form>
  );
}

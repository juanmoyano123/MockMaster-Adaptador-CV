/**
 * ResumeUpload Component
 * Handles file upload (drag & drop, click) and text paste modes
 * Feature: F-002
 */

'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { validateFile } from '@/utils/file-validation';
import { processResumeFile, structureResumeWithAI } from '@/lib/resume-parser';
import { ParsedContent } from '@/lib/types';
import PasteTextForm from './PasteTextForm';

interface ResumeUploadProps {
  onParsed: (parsedContent: ParsedContent, originalText: string, fileName: string) => void;
}

export default function ResumeUpload({ onParsed }: ResumeUploadProps) {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file drop
   */
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  /**
   * Handle file select from input
   */
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  /**
   * Process uploaded file
   */
  const processFile = async (file: File) => {
    setError(null);
    setProgress('');

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Extract text from file
      setProgress('Reading your resume...');

      const parsedContent = await processResumeFile(file);

      // Step 2: Done
      setProgress('Resume parsed successfully!');

      // Notify parent component
      onParsed(parsedContent, '', file.name);

      setIsProcessing(false);
      setProgress('');
    } catch (err) {
      setIsProcessing(false);
      setProgress('');

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to process resume. Please try text paste instead.');
      }
    }
  };

  /**
   * Handle text paste submission
   */
  const handleTextSubmit = async (text: string) => {
    setError(null);
    setIsProcessing(true);
    setProgress('Structuring your resume...');

    try {
      const parsedContent = await structureResumeWithAI(text);

      setProgress('Resume parsed successfully!');
      onParsed(parsedContent, text, 'pasted_resume.txt');

      setIsProcessing(false);
      setProgress('');
    } catch (err) {
      setIsProcessing(false);
      setProgress('');

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to parse resume. Please check your text and try again.');
      }
    }
  };

  /**
   * Trigger file input click
   */
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setUploadMode('file')}
          className={`px-6 py-3 font-medium transition-colors ${
            uploadMode === 'file'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setUploadMode('text')}
          className={`px-6 py-3 font-medium transition-colors ${
            uploadMode === 'text'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Paste Text
        </button>
      </div>

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="text-5xl">📄</div>

              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop your resume here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or
                </p>
                <button
                  onClick={handleClickUpload}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Choose File
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Supports PDF and DOCX files (max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Text Paste Mode */}
      {uploadMode === 'text' && (
        <PasteTextForm onSubmit={handleTextSubmit} isLoading={isProcessing} />
      )}

      {/* Progress Indicator */}
      {isProcessing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-blue-700 font-medium">{progress}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium mb-2">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
          {uploadMode === 'file' && (
            <button
              onClick={() => setUploadMode('text')}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Try pasting text instead
            </button>
          )}
        </div>
      )}
    </div>
  );
}

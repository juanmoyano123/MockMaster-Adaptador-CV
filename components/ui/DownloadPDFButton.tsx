/**
 * Download PDF Button Component
 * Feature: F-006
 *
 * Triggers PDF generation and download
 */

'use client';

import { useState } from 'react';
import { AdaptedContent, TemplateType } from '@/lib/types';

interface DownloadPDFButtonProps {
  adaptedContent: AdaptedContent;
  companyName: string;
  template: TemplateType;
  hasEdits?: boolean; // F-012: Indicate if using edited version
}

export default function DownloadPDFButton({
  adaptedContent,
  companyName,
  template,
  hasEdits = false,
}: DownloadPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[DownloadPDF] Starting download...', {
        company: companyName,
        template,
      });

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adapted_content: adaptedContent,
          template,
          company_name: companyName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF generation failed');
      }

      // Download PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Extract filename from response headers or generate default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Resume_${companyName}_${new Date().toISOString().split('T')[0]}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('[DownloadPDF] Success:', filename);
    } catch (err) {
      console.error('[DownloadPDF] Error:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {hasEdits && (
        <span className="text-xs text-green-600 flex items-center justify-center gap-1 mb-1">
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Usando tu version editada
        </span>
      )}
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-colors"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
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
            Generando PDF...
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Descargar PDF
          </>
        )}
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button
            onClick={handleDownload}
            className="mt-2 text-blue-600 hover:underline font-medium"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}

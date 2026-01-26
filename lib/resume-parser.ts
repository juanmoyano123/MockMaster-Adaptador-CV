/**
 * Resume parsing utilities - extracts text from PDF/DOCX and structures it
 * Feature: F-002
 */

import { ParsedContent } from './types';

/**
 * Parses a PDF file and extracts text content
 * Uses pdf-parse library (needs to run server-side via API route)
 * For MVP, we'll upload to API route for parsing
 */
export async function parsePDF(file: File): Promise<string> {
  try {
    // Convert file to base64 for API transmission
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // For large files, we need to process server-side
    // Create FormData to send file
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to parse PDF');
    }

    const data = await response.json();

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text found in PDF. The file may be an image or corrupted.');
    }

    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific PDF errors
      if (error.message.includes('Invalid PDF') || error.message.includes('corrupted')) {
        throw new Error('Could not read this PDF file. It may be corrupted or password-protected.');
      }
      if (error.message.includes('password')) {
        throw new Error('This PDF is password-protected. Please remove password protection and try again.');
      }
      throw error;
    }
    throw new Error('Failed to parse PDF file. Please try using text paste instead.');
  }
}

/**
 * Parses a DOCX file and extracts text content
 * Uses mammoth library via server-side API route
 */
export async function parseDOCX(file: File): Promise<string> {
  try {
    // Create FormData to send file
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/parse-docx', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to parse DOCX');
    }

    const data = await response.json();

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text found in document. The file may be empty or corrupted.');
    }

    // Log warnings if any
    if (data.warnings && data.warnings.length > 0) {
      console.warn('DOCX parsing warnings:', data.warnings);
    }

    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse Word document. Please try using text paste instead.');
  }
}

/**
 * Structures raw resume text using Claude API
 * Sends text to /api/parse-resume endpoint
 */
export async function structureResumeWithAI(text: string): Promise<ParsedContent> {
  try {
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to parse resume');
    }

    const data = await response.json();
    return data.parsed_content;
  } catch (error) {
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
    throw new Error('Failed to structure resume. Please try again.');
  }
}

/**
 * Main function: processes a file (PDF or DOCX) and returns structured content
 */
export async function processResumeFile(file: File): Promise<ParsedContent> {
  // Extract text based on file type
  let text: string;

  if (file.type === 'application/pdf') {
    text = await parsePDF(file);
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword'
  ) {
    text = await parseDOCX(file);
  } else {
    throw new Error('Unsupported file type');
  }

  // Structure the text using AI
  const parsedContent = await structureResumeWithAI(text);

  return parsedContent;
}

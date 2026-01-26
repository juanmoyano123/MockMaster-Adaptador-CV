/**
 * API Route: POST /api/parse-docx
 * Extracts text from DOCX files server-side using mammoth
 * Feature: F-002
 */

import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only DOCX/DOC files are accepted.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer for mammoth
    const arrayBuffer = await file.arrayBuffer();

    // Parse DOCX
    let result;
    try {
      result = await mammoth.extractRawText({ arrayBuffer });
    } catch (error) {
      console.error('DOCX parsing error:', error);

      return NextResponse.json(
        { error: 'Failed to parse Word document. The file may be corrupted.' },
        { status: 500 }
      );
    }

    // Check if text was extracted
    if (!result.value || result.value.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text found in document. The file may be empty or corrupted.' },
        { status: 400 }
      );
    }

    // Log warnings if any
    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    // Return extracted text
    return NextResponse.json({
      text: result.value,
      warnings: result.messages.map(msg => msg.message),
    });

  } catch (error) {
    console.error('Unexpected error in /api/parse-docx:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

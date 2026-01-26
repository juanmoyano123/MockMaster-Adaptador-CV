/**
 * API Route: POST /api/parse-pdf
 * Extracts text from PDF files server-side using pdf-parse
 * Feature: F-002
 */

import { NextRequest, NextResponse } from 'next/server';

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
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are accepted.' },
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

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF - using PDFParse class
    let pdfData;
    try {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      pdfData = { text: textResult.text, numpages: textResult.total };
    } catch (error) {
      console.error('PDF parsing error:', error);

      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('encrypted')) {
          return NextResponse.json(
            { error: 'This PDF is password-protected. Please remove password protection and try again.' },
            { status: 400 }
          );
        }
        if (error.message.includes('Invalid') || error.message.includes('corrupted')) {
          return NextResponse.json(
            { error: 'Could not read this PDF file. It may be corrupted or invalid.' },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to parse PDF file. Please try using text paste instead.' },
        { status: 500 }
      );
    }

    // Check if text was extracted
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text found in PDF. The file may be an image-only PDF or corrupted.' },
        { status: 400 }
      );
    }

    // Return extracted text
    return NextResponse.json({
      text: pdfData.text,
      pages: pdfData.numpages,
    });

  } catch (error) {
    console.error('Unexpected error in /api/parse-pdf:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

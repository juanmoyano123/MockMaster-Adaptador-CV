/**
 * PDF Generation API Endpoint
 * Feature: F-006
 *
 * POST /api/generate-pdf
 * Converts adapted resume content to PDF using Puppeteer
 * Uses @sparticuz/chromium for Vercel serverless compatibility
 */

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { generatePDFFilename, validatePDFRequest } from '@/lib/pdf-utils';
import { renderTemplateToHTML } from '@/lib/pdf-templates-html';
import { PDFGenerationRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const validation = validatePDFRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    const { adapted_content, template, company_name } =
      body as PDFGenerationRequest;

    console.log(
      `[PDF Generation] Starting for company: ${company_name}, template: ${template}`
    );

    // Render template to HTML
    const html = renderTemplateToHTML(adapted_content, template);

    // Launch Puppeteer with timeout protection
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PDF generation timeout')), 10000)
    );

    const pdfGenerationPromise = (async () => {
      // Use @sparticuz/chromium for Vercel, regular puppeteer for local dev
      const isProduction = process.env.NODE_ENV === 'production';

      const browser = await puppeteer.launch({
        args: isProduction ? chromium.args : [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        executablePath: isProduction
          ? await chromium.executablePath()
          : puppeteer.executablePath(),
        headless: true,
      });

      try {
        const page = await browser.newPage();

        // Set content with timeout
        await page.setContent(html, {
          waitUntil: 'networkidle0',
          timeout: 5000,
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
          format: 'Letter', // 8.5" x 11"
          printBackground: true,
          preferCSSPageSize: false,
          margin: {
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
          },
        });

        return pdfBuffer;
      } finally {
        await browser.close();
      }
    })();

    // Race between PDF generation and timeout
    const pdfBuffer = (await Promise.race([
      pdfGenerationPromise,
      timeoutPromise,
    ])) as Buffer;

    console.log(
      `[PDF Generation] Success - Size: ${(pdfBuffer.length / 1024).toFixed(2)}KB`
    );

    // Validate file size (warn if > 500KB but don't fail)
    const sizeKB = pdfBuffer.length / 1024;
    if (sizeKB > 500) {
      console.warn(
        `[PDF Generation] Warning: PDF size (${sizeKB.toFixed(2)}KB) exceeds 500KB target`
      );
    }

    // Generate filename
    const filename = generatePDFFilename(company_name);

    // Return PDF (convert Buffer to Uint8Array for Next.js compatibility)
    const uint8Array = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[PDF Generation] Error:', error);

    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'PDF generation timed out. Please try again.',
          code: 'TIMEOUT_ERROR',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'PDF generation failed',
        code: 'PDF_GENERATION_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

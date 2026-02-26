/**
 * API Route: POST /api/extract-job-vision
 * Feature: F-010 (Ciclo 1.3 — Chrome Extension Vision Fallback)
 *
 * Receives a base64-encoded JPEG screenshot from the Chrome extension when
 * DOM-based extraction fails, and uses Claude Vision to extract structured
 * job listing data. This is the "Track I" fallback in the extraction pipeline.
 *
 * Authentication: Bearer token in Authorization header (required)
 *
 * Request body:
 *   {
 *     "screenshot": "base64-string",   // accepts "screenshot_base64" as alias
 *     "source":     "linkedin" | "indeed",
 *     "url":        "https://..."
 *   }
 *
 * Response 200:
 *   { extracted_data: ExtractedJobData, confidence: number }
 *
 * Response 400: INVALID_INPUT   — missing / invalid screenshot, source, or url
 * Response 401: UNAUTHORIZED    — missing or invalid Bearer token
 * Response 429: RATE_LIMIT_EXCEEDED — >10 calls/hour per authenticated user
 * Response 500: CLAUDE_API_ERROR | JSON_PARSE_ERROR | INTERNAL_ERROR
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthenticatedUser } from '@/lib/auth-helper';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Anthropic model used for vision extraction (same as other routes in this project) */
const VISION_MODEL = 'claude-sonnet-4-5-20250929';

/** Maximum raw base64 string size accepted (≈ 2 MB of encoded data) */
const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024; // 2 MB

/** Allowed job-board source values */
const VALID_SOURCES = ['linkedin', 'indeed'] as const;
type JobSource = (typeof VALID_SOURCES)[number];

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter
// TODO: Replace with a Supabase-backed rate-limit table once traffic grows,
//       to survive server restarts and work across multiple instances.
// ---------------------------------------------------------------------------

const visionUsage = new Map<string, number[]>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Returns true if the user has NOT yet exceeded the rate limit.
 * Expired timestamps are pruned on every check to keep memory bounded.
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const fresh = (visionUsage.get(userId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  visionUsage.set(userId, fresh);
  return fresh.length < RATE_LIMIT;
}

/**
 * Records one usage event for the given user.
 * Must be called AFTER checkRateLimit passes AND after successful extraction.
 */
function recordUsage(userId: string): void {
  const timestamps = visionUsage.get(userId) ?? [];
  timestamps.push(Date.now());
  visionUsage.set(userId, timestamps);
}

// ---------------------------------------------------------------------------
// Claude Vision extraction prompt
// ---------------------------------------------------------------------------

/**
 * Builds the extraction prompt for Claude Vision.
 * The prompt is tightly constrained so Claude returns only valid JSON.
 *
 * @param source - 'linkedin' | 'indeed'
 * @returns Prompt string ready for the text block of a vision message
 */
function buildExtractionPrompt(source: JobSource): string {
  return `You are analyzing a screenshot of a job listing page from ${source}.

Extract all visible job information and return ONLY a valid JSON object — no markdown, no code fences, no explanation. Begin your response with { and end with }.

If this screenshot does NOT show a job listing, return exactly:
{ "not_a_job_listing": true, "confidence": 0 }

Otherwise return this exact structure:
{
  "title":        "Job title as shown, or null if not found",
  "company":      "Company name as shown, or null if not found",
  "location":     "Location string (city, country, or 'Remote'), or null if not found",
  "salary":       "Salary range string if visible, otherwise null",
  "modality":     "remote | hybrid | onsite | null — infer from text if not explicit",
  "description":  "Full job description body text extracted verbatim",
  "requirements": "Requirements / qualifications section if separate, otherwise repeat description",
  "benefits":     "Benefits section text if visible, otherwise null",
  "raw_text":     "All visible text on the page concatenated, including labels and headings",
  "confidence":   integer from 0 to 100 representing how confident you are in the extraction
}

Guidelines:
- Extract text VERBATIM from the screenshot; do NOT paraphrase or summarise.
- For modality: look for words like "Remote", "Hybrid", "On-site", "Presencial", "Remoto".
- confidence should be 90-100 for clear screenshots, 50-89 for partially obscured, <50 for unclear.
- title and company are REQUIRED fields; if either is missing set confidence below 30.`;
}

// ---------------------------------------------------------------------------
// Request body type
// ---------------------------------------------------------------------------

interface ExtractJobVisionBody {
  /** Base64 JPEG. Accepts either key name used by the extension. */
  screenshot?: string;
  screenshot_base64?: string;
  source: JobSource;
  url: string;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

/**
 * POST /api/extract-job-vision
 *
 * Main handler: authenticate -> validate -> call Claude Vision -> return data.
 */
export async function POST(request: NextRequest) {
  // -------------------------------------------------------------------------
  // 1. Authentication — Bearer token (extension) or cookie (web app)
  // -------------------------------------------------------------------------
  const { user } = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Token invalido o sesion expirada', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // -------------------------------------------------------------------------
  // 2. Rate limiting — 10 calls per hour per authenticated user
  // -------------------------------------------------------------------------
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      {
        error:
          'Has superado el limite de 10 extracciones por vision por hora. Intenta de nuevo mas tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      { status: 429 }
    );
  }

  try {
    // -----------------------------------------------------------------------
    // 3. Parse and validate request body
    // -----------------------------------------------------------------------
    let body: ExtractJobVisionBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Accept either field name that the extension might send
    const rawScreenshot: string | undefined =
      body.screenshot ?? body.screenshot_base64;

    if (!rawScreenshot || typeof rawScreenshot !== 'string') {
      return NextResponse.json(
        {
          error:
            'Missing required field: "screenshot" (or "screenshot_base64") must be a non-empty string.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // Strip the data-URL prefix if the extension included it
    const DATA_URL_PREFIX = 'data:image/jpeg;base64,';
    const screenshotBase64 = rawScreenshot.startsWith(DATA_URL_PREFIX)
      ? rawScreenshot.slice(DATA_URL_PREFIX.length)
      : rawScreenshot;

    // Guard against oversized payloads (base64 string byte count, not decoded size)
    if (screenshotBase64.length > MAX_SCREENSHOT_BYTES) {
      return NextResponse.json(
        {
          error: `Screenshot exceeds the 2 MB limit (received ~${Math.round(screenshotBase64.length / 1024)} KB encoded).`,
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // Validate source
    if (!body.source || !VALID_SOURCES.includes(body.source)) {
      return NextResponse.json(
        {
          error: `Invalid "source". Must be one of: ${VALID_SOURCES.join(', ')}.`,
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // Validate url
    if (!body.url || typeof body.url !== 'string' || body.url.trim() === '') {
      return NextResponse.json(
        {
          error: 'Missing or empty required field: "url".',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    const source: JobSource = body.source;
    const url = body.url.trim();

    // -----------------------------------------------------------------------
    // 4. Call Claude Vision API
    // -----------------------------------------------------------------------
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const extractionPrompt = buildExtractionPrompt(source);

    console.log(
      `[extract-job-vision] Calling Claude Vision for user=${user.id} source=${source}`
    );
    const startTime = Date.now();

    const message = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 4000,
      temperature: 0, // Deterministic extraction — no creativity needed
      messages: [
        {
          role: 'user',
          content: [
            {
              // Image block — raw base64 with NO data-URL prefix (SDK requirement)
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: screenshotBase64,
              },
            },
            {
              // Text instruction block
              type: 'text',
              text: extractionPrompt,
            },
          ],
        },
      ],
    });

    console.log(
      `[extract-job-vision] Claude Vision responded in ${Date.now() - startTime}ms`
    );

    // -----------------------------------------------------------------------
    // 5. Parse Claude's response
    // -----------------------------------------------------------------------
    const content = message.content[0];

    if (content.type !== 'text') {
      return NextResponse.json(
        {
          error: 'Unexpected response type from Claude Vision API.',
          code: 'CLAUDE_API_ERROR',
        },
        { status: 500 }
      );
    }

    // Claude may occasionally wrap JSON in markdown fences — extract the first
    // JSON object with a regex to be defensive.
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        '[extract-job-vision] Could not find JSON in response:',
        content.text
      );
      return NextResponse.json(
        {
          error: 'Failed to extract valid JSON from Claude Vision response.',
          code: 'JSON_PARSE_ERROR',
        },
        { status: 500 }
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error(
        '[extract-job-vision] JSON.parse failed:',
        parseError,
        'Raw JSON string:',
        jsonMatch[0]
      );
      return NextResponse.json(
        {
          error: 'Failed to parse JSON from Claude Vision response.',
          code: 'JSON_PARSE_ERROR',
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------------------------
    // 6. Handle "not a job listing" result
    // -----------------------------------------------------------------------
    if (parsed.not_a_job_listing === true) {
      console.log(
        `[extract-job-vision] Not a job listing detected for url=${url}`
      );
      // Return 200 with confidence: 0 — not an error, just an empty result
      return NextResponse.json(
        {
          extracted_data: null,
          confidence: 0,
          message: 'The screenshot does not appear to contain a job listing.',
        },
        { status: 200 }
      );
    }

    // -----------------------------------------------------------------------
    // 7. Validate required fields from Claude's extraction
    // -----------------------------------------------------------------------
    if (!parsed.title || typeof parsed.title !== 'string') {
      return NextResponse.json(
        {
          error:
            'Claude Vision could not extract a job title from the screenshot.',
          code: 'JSON_PARSE_ERROR',
        },
        { status: 500 }
      );
    }

    if (!parsed.company || typeof parsed.company !== 'string') {
      return NextResponse.json(
        {
          error:
            'Claude Vision could not extract a company name from the screenshot.',
          code: 'JSON_PARSE_ERROR',
        },
        { status: 500 }
      );
    }

    if (!parsed.description || typeof parsed.description !== 'string') {
      return NextResponse.json(
        {
          error:
            'Claude Vision could not extract a job description from the screenshot.',
          code: 'JSON_PARSE_ERROR',
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------------------------
    // 8. Record successful usage AFTER the API call succeeds
    // -----------------------------------------------------------------------
    recordUsage(user.id);

    // -----------------------------------------------------------------------
    // 9. Build and return the structured response
    //    Shape mirrors ExtractedJobData from extension/src/shared/types.ts
    // -----------------------------------------------------------------------
    return NextResponse.json(
      {
        extracted_data: {
          source,
          url,
          title: parsed.title as string,
          company: parsed.company as string,
          location:
            typeof parsed.location === 'string' ? parsed.location : '',
          salary: typeof parsed.salary === 'string' ? parsed.salary : null,
          modality:
            parsed.modality === 'remote' ||
            parsed.modality === 'hybrid' ||
            parsed.modality === 'onsite'
              ? parsed.modality
              : null,
          description: parsed.description as string,
          requirements:
            typeof parsed.requirements === 'string'
              ? parsed.requirements
              : (parsed.description as string),
          benefits:
            typeof parsed.benefits === 'string' ? parsed.benefits : null,
          extracted_at: new Date().toISOString(),
          extraction_method: 'vision' as const,
          raw_text:
            typeof parsed.raw_text === 'string'
              ? parsed.raw_text
              : (parsed.description as string),
        },
        confidence:
          typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[extract-job-vision] Unhandled error:', error);

    // Surface Anthropic SDK errors separately for cleaner debugging
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          error: `Claude API error: ${error.message}`,
          code: 'CLAUDE_API_ERROR',
        },
        { status: 500 }
      );
    }

    // Generic fallback
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// OPTIONS — CORS preflight handler
// ---------------------------------------------------------------------------

/**
 * Handle CORS pre-flight requests from the Chrome extension.
 * The OPTIONS method must return 200; actual CORS headers are set globally
 * in next.config.ts for all /api/* routes.
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

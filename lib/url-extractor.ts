/**
 * URL Extractor Utility
 * Feature: F-014 — Job Description URL Extraction
 *
 * Pure utility module that validates job URLs, fetches their HTML content,
 * and parses job descriptions using cheerio. Includes SSRF protection by
 * blocking private/loopback IPs and non-HTTPS URLs.
 *
 * Supports LinkedIn, Indeed, and generic job portals.
 */

import * as cheerio from 'cheerio';
import { UrlExtractionErrorCode } from '@/lib/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum response body size in bytes (5 MB) */
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 10_000;

/** Minimum cleaned-text length to consider extraction successful */
const MIN_TEXT_LENGTH = 50;

/** User-Agent header sent when fetching job pages */
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  code?: UrlExtractionErrorCode;
}

export interface JobSource {
  type: 'linkedin' | 'indeed' | 'generic';
}

export interface JobExtractionResult {
  text: string;
  title?: string;
  company?: string;
  source: 'linkedin' | 'indeed' | 'generic';
}

// ---------------------------------------------------------------------------
// SSRF protection helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the given hostname resolves to a private or loopback IP
 * (10.x, 172.16-31.x, 192.168.x, 127.x) or is a reserved hostname.
 *
 * We do NOT perform actual DNS resolution here — that would require an async
 * system call. Instead we block known private-range literals and common
 * loopback/internal hostnames. This is sufficient for SSRF protection in
 * a serverless environment where DNS is not directly accessible.
 */
function isBlockedHostname(hostname: string): boolean {
  // Loopback and reserved hostnames
  const blockedHostnames = ['localhost', '0.0.0.0', '::1', 'metadata.google.internal'];
  if (blockedHostnames.includes(hostname.toLowerCase())) return true;

  // Reject raw IPv4 addresses that fall in private ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const [, a, b] = match.map(Number);
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 127.0.0.0/8
    if (a === 127) return true;
    // 169.254.0.0/16 (link-local / cloud metadata)
    if (a === 169 && b === 254) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

/**
 * Validates a job URL with SSRF protection.
 *
 * Rules:
 * - Must start with https://
 * - Hostname must not be a private IP or loopback address
 */
export function validateUrl(url: string): UrlValidationResult {
  // Must be a non-empty string
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return {
      valid: false,
      error: 'La URL no puede estar vacia.',
      code: 'INVALID_URL',
    };
  }

  const trimmed = url.trim();

  // Must use HTTPS only
  if (!trimmed.startsWith('https://')) {
    return {
      valid: false,
      error: 'La URL debe comenzar con https://',
      code: 'INVALID_URL',
    };
  }

  // Parse the URL to extract the hostname
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: 'La URL no tiene un formato valido.',
      code: 'INVALID_URL',
    };
  }

  // Block private/loopback hosts (SSRF protection)
  if (isBlockedHostname(parsed.hostname)) {
    return {
      valid: false,
      error: 'URL no permitida.',
      code: 'BLOCKED_URL',
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Source detection
// ---------------------------------------------------------------------------

/**
 * Detects the job portal based on the URL hostname.
 */
export function detectSource(url: string): 'linkedin' | 'indeed' | 'generic' {
  try {
    const { hostname } = new URL(url);
    const host = hostname.toLowerCase();

    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('indeed.com')) return 'indeed';
  } catch {
    // Malformed URL — treated as generic
  }
  return 'generic';
}

// ---------------------------------------------------------------------------
// Text cleaning helpers
// ---------------------------------------------------------------------------

/**
 * Loads an HTML string into cheerio and applies site-specific or generic
 * selectors to find the job description content.
 *
 * Returns cleaned plain text plus optional title and company metadata.
 */
function parseHtml(
  html: string,
  source: 'linkedin' | 'indeed' | 'generic'
): { rawText: string; title?: string; company?: string } {
  const $ = cheerio.load(html);

  // Remove noise elements that never contain job content
  $('script, style, noscript, nav, header, footer, aside, [aria-hidden="true"]').remove();

  let rawText = '';
  let title: string | undefined;
  let company: string | undefined;

  if (source === 'linkedin') {
    // --- LinkedIn-specific selectors ---
    title =
      $('h1.top-card-layout__title').first().text().trim() ||
      $('h1.t-24').first().text().trim() ||
      $('h1').first().text().trim() ||
      undefined;

    company =
      $('.topcard__org-name-link').first().text().trim() ||
      $('.top-card-layout__second-subline .topcard__flavor--bullet').first().text().trim() ||
      undefined;

    // Convert list items to bullet-prefixed lines before extracting text
    $('.description__text li, .show-more-less-html__markup li').each((_i, el) => {
      $(el).prepend('\n- ');
    });

    rawText =
      $('.description__text').text() ||
      $('.show-more-less-html__markup').text() ||
      $('[class*="description"]').first().text();
  } else if (source === 'indeed') {
    // --- Indeed-specific selectors ---
    title =
      $('.jobsearch-JobInfoHeader-title').first().text().trim() ||
      $('[class*="JobInfoHeader-title"]').first().text().trim() ||
      $('h1').first().text().trim() ||
      undefined;

    company =
      $('div[data-company-name]').first().text().trim() ||
      $('[class*="companyName"]').first().text().trim() ||
      undefined;

    // Convert list items to bullet-prefixed lines
    $('#jobDescriptionText li').each((_i, el) => {
      $(el).prepend('\n- ');
    });

    rawText =
      $('#jobDescriptionText').text() ||
      $('[class*="jobDescription"]').first().text();
  }

  // --- Generic / fallback selectors ---
  if (!rawText || rawText.trim().length < MIN_TEXT_LENGTH) {
    // Try common class-name patterns for job descriptions
    const candidates = [
      '[class*="job-description"]',
      '[class*="jobDescription"]',
      '[class*="job_description"]',
      '[id*="job-description"]',
      '[id*="jobDescription"]',
      '[class*="description"]',
      'article',
      'main',
    ];

    for (const selector of candidates) {
      const el = $(selector).first();
      if (el.length) {
        // Convert list items to bullet-prefixed lines in the candidate element
        el.find('li').each((_i, liEl) => {
          $(liEl).prepend('\n- ');
        });
        const candidateText = el.text().trim();
        if (candidateText.length >= MIN_TEXT_LENGTH) {
          rawText = candidateText;
          break;
        }
      }
    }

    // Last resort: body text (noise already removed above)
    if (!rawText || rawText.trim().length < MIN_TEXT_LENGTH) {
      $('body li').each((_i, el) => {
        $(el).prepend('\n- ');
      });
      rawText = $('body').text();
    }

    // Attempt title extraction for generic pages if not already set
    if (!title) {
      title = $('h1').first().text().trim() || undefined;
    }
  }

  return { rawText, title, company };
}

/**
 * Cleans raw extracted text:
 * - Collapses multiple consecutive whitespace/newlines
 * - Trims the result
 */
function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')         // Normalize line endings
    .replace(/[ \t]+/g, ' ')        // Collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')     // Collapse excess blank lines
    .trim();
}

// ---------------------------------------------------------------------------
// Main extraction function
// ---------------------------------------------------------------------------

/**
 * Fetches a job posting URL, parses the HTML, and returns structured text.
 *
 * @throws An object `{ code: UrlExtractionErrorCode, message: string }` on failure
 */
export async function extractJobText(url: string): Promise<JobExtractionResult> {
  // 1. Validate URL (includes SSRF protection)
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw { code: validation.code, message: validation.error };
  }

  const source = detectSource(url);

  // 2. Fetch with timeout and size limit
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        // Mimic a real browser to reduce bot detection blocks
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 401 / 403 typically indicate a login wall
      if (response.status === 401 || response.status === 403) {
        throw { code: 'LOGIN_WALL' as UrlExtractionErrorCode };
      }
      throw { code: 'FETCH_ERROR' as UrlExtractionErrorCode };
    }

    // 3. Guard against oversized responses
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
      throw { code: 'CONTENT_TOO_LARGE' as UrlExtractionErrorCode };
    }

    // Stream-read up to MAX_RESPONSE_BYTES before parsing
    const reader = response.body?.getReader();
    if (!reader) {
      throw { code: 'FETCH_ERROR' as UrlExtractionErrorCode };
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > MAX_RESPONSE_BYTES) {
          reader.cancel();
          throw { code: 'CONTENT_TOO_LARGE' as UrlExtractionErrorCode };
        }
        chunks.push(value);
      }
    }

    // Decode the accumulated chunks as UTF-8 text
    const decoder = new TextDecoder('utf-8');
    html = decoder.decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.byteLength + chunk.byteLength);
        merged.set(acc, 0);
        merged.set(chunk, acc.byteLength);
        return merged;
      }, new Uint8Array(0))
    );
  } catch (err) {
    clearTimeout(timeoutId);

    // Re-throw our typed errors as-is
    if (err && typeof err === 'object' && 'code' in err) {
      throw err;
    }

    // AbortController fires a DOMException with name 'AbortError'
    if (err instanceof Error && err.name === 'AbortError') {
      throw { code: 'FETCH_TIMEOUT' as UrlExtractionErrorCode };
    }

    throw { code: 'FETCH_ERROR' as UrlExtractionErrorCode };
  }

  // 4. Parse HTML with cheerio
  const { rawText, title, company } = parseHtml(html, source);

  // 5. Clean text
  const cleaned = cleanText(rawText);

  // Check for login-wall heuristics in the extracted text
  const loginWallPatterns = [
    'sign in to view',
    'iniciar sesion',
    'inicia sesion',
    'log in to see',
    'you must be logged in',
    'join to view',
    'debes iniciar sesion',
  ];
  const lowerCleaned = cleaned.toLowerCase();
  if (
    cleaned.length < MIN_TEXT_LENGTH ||
    loginWallPatterns.some((pattern) => lowerCleaned.includes(pattern))
  ) {
    throw { code: 'LOGIN_WALL' as UrlExtractionErrorCode };
  }

  // 6. Build the output text: "{title} en {company}\n\n{description}"
  let outputText = cleaned;
  if (title || company) {
    const header = [title, company ? `en ${company}` : null]
      .filter(Boolean)
      .join(' ');
    outputText = `${header}\n\n${cleaned}`;
  }

  return {
    text: outputText,
    title: title || undefined,
    company: company || undefined,
    source,
  };
}

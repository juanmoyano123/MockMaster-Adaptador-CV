/**
 * MockMaster Content Script — LinkedIn Job Extractor
 *
 * Injected by Chrome into every LinkedIn jobs/* page.
 *
 * Responsibilities:
 *   - Listen for EXTRACT_JOB messages from the background service worker.
 *   - Parse the LinkedIn job listing DOM and return an ExtractedJobData object.
 *   - Respond with success:true on extraction, or success:false so the
 *     sidepanel can trigger the Vision API fallback.
 *
 * IMPORTANT: Content scripts run in an isolated world — they share the page DOM
 * but NOT the JavaScript runtime. Do not assume any globals from the page.
 *
 * Extraction strategy:
 *   1. Expand collapsed content ("Show more" / "Ver más") and wait 500 ms.
 *   2. Try each selector list in order, using the first non-empty match.
 *   3. If the description is < 50 chars after all attempts, respond with
 *      success:false so the sidepanel triggers the Vision API fallback.
 */

import { ExtractedJobData, ExtensionMessage, MessageResponse } from '../shared/types';
import { MSG } from '../shared/constants';

// ---------------------------------------------------------------------------
// Selector lists (tried in order, first non-empty match wins)
// LinkedIn frequently changes class names — keep this list comprehensive.
// ---------------------------------------------------------------------------

const TITLE_SELECTORS: string[] = [
  '.job-details-jobs-unified-top-card__job-title h1',
  '.job-details-jobs-unified-top-card__job-title',
  'h1.t-24.t-bold',
  'h1.t-24',
  '.topcard__title',
  'h1[class*="job-title"]',
  'h1',
];

const COMPANY_SELECTORS: string[] = [
  '.job-details-jobs-unified-top-card__company-name a',
  '.job-details-jobs-unified-top-card__company-name',
  '.topcard__org-name-link',
  'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
  '.job-details-jobs-unified-top-card__primary-description-container a',
  // Newer LinkedIn layout (2025)
  '.jobs-unified-top-card__company-name a',
  '.jobs-unified-top-card__company-name',
];

const LOCATION_SELECTORS: string[] = [
  '.job-details-jobs-unified-top-card__bullet',
  '.topcard__flavor--bullet',
  'span.tvm__text.tvm__text--low-emphasis',
  '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
  // Newer layout
  '.jobs-unified-top-card__bullet',
  '.jobs-unified-top-card__workplace-type',
];

const DESCRIPTION_SELECTORS: string[] = [
  '.jobs-description-content__text',
  '#job-details',
  '.jobs-box__html-content',
  '.jobs-description__content',
  'article[class*="jobs-description"]',
  '.description__text',
  // Fallback: any element whose ID contains "job-details"
  '[id*="job-details"]',
];

// Selectors for dedicated salary elements
const SALARY_SELECTORS: string[] = [
  '.salary-main-rail__salary-range',
  '.compensation__salary',
  'span[class*="salary"]',
  // Compensation insight inside job insights list
  '.job-details-jobs-unified-top-card__job-insight span',
  '.jobs-unified-top-card__job-insight span',
];

// Selectors for the workplace-type badge (Remote / Hybrid / On-site)
const WORKPLACE_TYPE_SELECTORS: string[] = [
  '.workplace-type',
  '.job-details-jobs-unified-top-card__workplace-type',
  '.jobs-unified-top-card__workplace-type',
  'span[class*="workplace-type"]',
];

// "Show more" button text patterns (multi-language)
const SHOW_MORE_PATTERNS: RegExp[] = [
  /show\s+more/i,
  /ver\s+m[aá]s/i,
  /see\s+more/i,
  /leer\s+m[aá]s/i,
  /expand/i,
];

// ---------------------------------------------------------------------------
// Message listener
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse<ExtractedJobData>) => void
  ): boolean => {
    if (message.type !== MSG.EXTRACT_JOB) {
      // Not our message — let other listeners handle it
      return false;
    }

    console.debug('[MockMaster LinkedIn] EXTRACT_JOB received');

    // Kick off async extraction and send the result back.
    // The listener must return true synchronously to keep the channel open.
    extractLinkedInJob()
      .then((data) => {
        console.debug('[MockMaster LinkedIn] extraction success:', data.title);
        sendResponse({ success: true, data });
      })
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[MockMaster LinkedIn] extraction failed:', errorMessage);
        sendResponse({ success: false, error: errorMessage });
      });

    // Return true to keep the message channel open for the async response
    return true;
  }
);

// ---------------------------------------------------------------------------
// Main extraction pipeline
// ---------------------------------------------------------------------------

/**
 * Full async extraction pipeline:
 *   1. Expand collapsed description content.
 *   2. Extract each field using layered fallback selectors.
 *   3. Validate the result — if description is too short, throw so the
 *      caller returns success:false and triggers Vision fallback.
 */
async function extractLinkedInJob(): Promise<ExtractedJobData> {
  const url = window.location.href;
  const now = new Date().toISOString();

  // Step 1 — expand any "Show more" / "Ver más" buttons in the description.
  // We await this before reading the DOM so the full text is visible.
  await expandDescription();

  // Step 2 — extract individual fields
  const title = getTextContent(TITLE_SELECTORS);
  const company = getTextContent(COMPANY_SELECTORS);
  const location = getTextContent(LOCATION_SELECTORS);
  const description = getDescriptionText();
  const salary = extractSalaryFromSelectors() ?? extractSalaryFromText(document.body.innerText);
  const modality = detectModality(description + ' ' + getWorkplaceType());

  // Step 3 — minimal validation
  if (!title) {
    throw new Error(
      'No se pudo encontrar el titulo del aviso. ' +
      'La pagina puede no haber cargado completamente o el layout de LinkedIn cambio.'
    );
  }

  if (description.length < 50) {
    throw new Error(
      `Descripcion demasiado corta (${description.length} caracteres). ` +
      'Se requiere la API Vision como fallback.'
    );
  }

  // Step 4 — derive higher-level fields from the raw description text
  const requirements = extractRequirements(description);
  const benefits = extractBenefits(description);

  // Step 5 — build raw_text for the analyze-job API
  // This concatenation is what the LLM receives to understand the full listing.
  const rawText = buildRawText({ title, company, location, salary, modality, description });

  return {
    source: 'linkedin',
    url,
    title,
    company,
    location,
    salary,
    modality,
    description,
    requirements,
    benefits,
    extracted_at: now,
    extraction_method: 'dom',
    raw_text: rawText,
  };
}

// ---------------------------------------------------------------------------
// Helper: text extraction
// ---------------------------------------------------------------------------

/**
 * Tries each CSS selector in order and returns the trimmed innerText of the
 * first element that exists and has non-empty text.
 *
 * Returns an empty string if no selector matches — callers decide whether
 * an empty result is acceptable or should trigger a fallback.
 */
function getTextContent(selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const text = cleanText(el.innerText);
        if (text.length > 0) {
          return text;
        }
      }
    } catch (_e) {
      // Malformed selectors should not crash the extractor
      console.warn('[MockMaster LinkedIn] Bad selector:', selector);
    }
  }
  return '';
}

/**
 * Extracts the full job description text.
 *
 * LinkedIn renders description HTML inside containers — we prefer innerText
 * (which preserves newlines from <br>/<p> elements) over textContent.
 * Multiple consecutive blank lines are collapsed to a single blank line for
 * LLM readability.
 */
function getDescriptionText(): string {
  for (const selector of DESCRIPTION_SELECTORS) {
    try {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const text = cleanText(el.innerText);
        if (text.length >= 50) {
          return text;
        }
      }
    } catch (_e) {
      console.warn('[MockMaster LinkedIn] Bad description selector:', selector);
    }
  }
  return '';
}

/**
 * Reads the workplace type badge text (e.g. "Remote", "Hybrid", "On-site").
 * Used to supplement modality detection when the badge is present but
 * the description body does not mention the modality explicitly.
 */
function getWorkplaceType(): string {
  return getTextContent(WORKPLACE_TYPE_SELECTORS);
}

// ---------------------------------------------------------------------------
// Helper: expand collapsed content
// ---------------------------------------------------------------------------

/**
 * Clicks any visible "Show more" / "Ver mas" button inside the job description
 * container, then waits 500 ms for the DOM to update.
 *
 * LinkedIn lazy-loads the full description and hides it behind a button.
 * We must click it before reading .innerText, otherwise we get truncated text.
 *
 * The wait is short on purpose: LinkedIn's expand animation is CSS-only and
 * typically completes in < 300 ms. The extra headroom handles slower devices.
 */
async function expandDescription(): Promise<void> {
  // Candidate button selectors — LinkedIn has used several over the years
  const buttonSelectors = [
    'button.jobs-description__footer-button',
    'button[aria-label*="more"]',
    'button[aria-label*="más"]',
    '.jobs-description__footer button',
    'footer.jobs-description__footer button',
    '.artdeco-card__footer button',
    // Generic fallback: any button whose visible text matches a "show more" pattern
  ];

  let clicked = false;

  // First pass: try known selectors
  for (const selector of buttonSelectors) {
    try {
      const btn = document.querySelector<HTMLButtonElement>(selector);
      if (btn && isShowMoreButton(btn)) {
        btn.click();
        clicked = true;
        break;
      }
    } catch (_e) {
      // Ignore — try next selector
    }
  }

  // Second pass: scan all buttons on the page for text matching "show more" patterns
  if (!clicked) {
    const allButtons = document.querySelectorAll<HTMLButtonElement>('button');
    for (const btn of allButtons) {
      if (isShowMoreButton(btn)) {
        btn.click();
        clicked = true;
        break;
      }
    }
  }

  if (clicked) {
    // Wait for the DOM to update after the click
    await delay(500);
    console.debug('[MockMaster LinkedIn] "Show more" button clicked, waited 500 ms');
  } else {
    console.debug('[MockMaster LinkedIn] No "Show more" button found — description may already be expanded');
  }
}

/**
 * Returns true if the button's visible text matches any "show more" pattern.
 * Checks both innerText and aria-label to handle icon-only buttons.
 */
function isShowMoreButton(btn: HTMLButtonElement): boolean {
  const text = (btn.innerText ?? '').toLowerCase().trim();
  const ariaLabel = (btn.getAttribute('aria-label') ?? '').toLowerCase();
  const combined = `${text} ${ariaLabel}`;
  return SHOW_MORE_PATTERNS.some((pattern) => pattern.test(combined));
}

// ---------------------------------------------------------------------------
// Helper: salary extraction
// ---------------------------------------------------------------------------

/**
 * Tries dedicated salary DOM selectors first, then falls back to regex
 * on element text for selectors that may contain mixed content.
 */
function extractSalaryFromSelectors(): string | null {
  // Check the job-insight list for compensation mentions
  const insightEls = document.querySelectorAll<HTMLElement>(
    '.job-details-jobs-unified-top-card__job-insight, .jobs-unified-top-card__job-insight'
  );
  for (const el of insightEls) {
    const text = cleanText(el.innerText);
    if (SALARY_CONTENT_PATTERN.test(text)) {
      return text;
    }
  }

  // Try dedicated salary selectors
  for (const selector of SALARY_SELECTORS) {
    try {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const text = cleanText(el.innerText);
        if (text.length > 0) {
          return text;
        }
      }
    } catch (_e) {
      // Ignore bad selectors
    }
  }

  return null;
}

/**
 * Matches against keywords that typically appear alongside salary info.
 * Used to identify which insight pill contains compensation data.
 */
const SALARY_CONTENT_PATTERN = /\$|USD|ARS|salary|salario|sueldo|compensation|remuneraci[oó]n/i;

/**
 * Scans free-form text for currency amount patterns using regex.
 * Handles common formats:
 *   - $45,000 - $65,000
 *   - USD 3,000/month
 *   - $50K - $80K
 *   - ARS 500.000
 *
 * Returns the first match found, or null if no salary pattern is detected.
 */
function extractSalaryFromText(text: string): string | null {
  // Pattern captures currency symbol + digits with common separators + optional range
  const salaryPattern =
    /(?:USD|ARS|EUR|GBP)?\s*\$?\s*[\d]{1,3}(?:[.,\s][\d]{3})*(?:[.,]\d{2})?\s*(?:K|k)?\s*(?:[-–]\s*(?:USD|ARS|EUR|GBP)?\s*\$?\s*[\d]{1,3}(?:[.,\s][\d]{3})*(?:[.,]\d{2})?\s*(?:K|k)?)?\s*(?:\/\s*(?:month|year|hour|mes|año|hora|yr|mo))?/;

  const match = text.match(salaryPattern);
  if (match && match[0].trim().length > 2) {
    return match[0].trim();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helper: modality detection
// ---------------------------------------------------------------------------

/**
 * Infers the work modality from combined text (description + workplace badge).
 * Uses word-boundary anchors to avoid false positives (e.g. "hybrids" in a
 * different context, or "office" in "office365").
 *
 * Priority: hybrid > remote > onsite
 * Rationale: hybrid is the most specific, then remote, then on-site as default.
 */
function detectModality(text: string): ExtractedJobData['modality'] {
  const lower = text.toLowerCase();

  // Hybrid check first — a "hybrid remote" role should be classified as hybrid
  if (/\bhybrid\b|\bh[ií]brido\b|\bh[ií]brida\b/.test(lower)) {
    return 'hybrid';
  }

  // Remote
  if (/\bremote\b|\bremoto\b|\bremota\b|\bwork from home\b|\bwfh\b|\bteletrabajo\b/.test(lower)) {
    return 'remote';
  }

  // On-site (most permissive — check last to avoid false positives)
  if (/\bon-?site\b|\bpresencial\b|\bin.?office\b|\bin the office\b/.test(lower)) {
    return 'onsite';
  }

  return null;
}

// ---------------------------------------------------------------------------
// Helper: section extraction from description text
// ---------------------------------------------------------------------------

/**
 * Attempts to isolate the requirements / qualifications section.
 *
 * LinkedIn job descriptions are free-form, but many postings follow a
 * convention of titling the section with a keyword. We look for that keyword
 * and extract everything after it until the next blank line or ALL-CAPS heading.
 *
 * Falls back to the full description if no dedicated section is found —
 * this is safe because the LLM will still be able to identify requirements.
 */
function extractRequirements(description: string): string {
  const sectionPattern =
    /(?:requirements?|qualifications?|what you(?:'ll| will) need|requisitos?|calificaciones?|experiencia requerida)[:\s]*\n?([\s\S]+?)(?=\n\n[A-Z\u00C0-\u00DC]|\n\n[^\n]{1,50}\n|\n[A-Z]{2}|$)/i;

  const match = description.match(sectionPattern);
  if (match?.[1]) {
    return cleanText(match[1]);
  }

  // No dedicated section found — return full description as requirements context
  return description;
}

/**
 * Attempts to isolate the benefits section.
 * Returns null if the description does not contain a recognisable benefits block.
 */
function extractBenefits(description: string): string | null {
  const sectionPattern =
    /(?:benefits?|perks?|what we offer|beneficios?|lo que ofrecemos?|lo que te ofrecemos?|nuestros beneficios?)[:\s]*\n?([\s\S]+?)(?=\n\n[A-Z\u00C0-\u00DC]|\n\n[^\n]{1,50}\n|\n[A-Z]{2}|$)/i;

  const match = description.match(sectionPattern);
  if (match?.[1]) {
    return cleanText(match[1]);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Helper: raw_text builder
// ---------------------------------------------------------------------------

/**
 * Builds the raw_text field that is sent to the analyze-job API.
 *
 * The LLM receives this as the primary input for understanding the job.
 * We include all structured fields as labelled sections so the model can
 * parse them without relying on implicit position in the string.
 */
function buildRawText(fields: {
  title: string;
  company: string;
  location: string;
  salary: string | null;
  modality: ExtractedJobData['modality'];
  description: string;
}): string {
  const parts: string[] = [];

  if (fields.title) parts.push(`TITULO: ${fields.title}`);
  if (fields.company) parts.push(`EMPRESA: ${fields.company}`);
  if (fields.location) parts.push(`UBICACION: ${fields.location}`);
  if (fields.salary) parts.push(`SALARIO: ${fields.salary}`);
  if (fields.modality) parts.push(`MODALIDAD: ${fields.modality}`);
  if (fields.description) parts.push(`DESCRIPCION:\n${fields.description}`);

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Cleans extracted text by:
 *   - Trimming leading/trailing whitespace
 *   - Collapsing 3+ consecutive newlines to two (preserves paragraph breaks)
 *   - Collapsing runs of horizontal whitespace (tabs, multiple spaces) to one space
 *   - Removing LinkedIn UI artefacts (e.g. "…see more", "Show more" buttons
 *     whose text leaked into innerText)
 */
function cleanText(raw: string): string {
  return raw
    .trim()
    // Collapse runs of spaces/tabs to a single space (but keep newlines)
    .replace(/[ \t]{2,}/g, ' ')
    // Collapse 3+ consecutive newlines to exactly 2
    .replace(/\n{3,}/g, '\n\n')
    // Remove common LinkedIn UI noise that leaks into innerText
    .replace(/\.\.\.\s*(see more|show more|ver m[aá]s|leer m[aá]s)/gi, '')
    .replace(/^(see more|show more|ver m[aá]s|leer m[aá]s)\s*$/gim, '')
    .trim();
}

/**
 * Returns a Promise that resolves after `ms` milliseconds.
 * Used to wait for DOM updates after clicking the "Show more" button.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Init log
// ---------------------------------------------------------------------------

console.debug('[MockMaster LinkedIn] content script loaded on:', window.location.href);

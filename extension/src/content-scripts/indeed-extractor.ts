/**
 * MockMaster Content Script — Indeed Job Extractor
 *
 * Injected by Chrome into Indeed job listing pages (global + AR subdomains).
 *
 * Design principles:
 *   - Every field has multiple fallback CSS selectors because Indeed's DOM
 *     class names change frequently and differ between subdomains.
 *   - If the main document selectors yield nothing, we attempt to read the
 *     same-origin iframes Indeed sometimes uses to embed job details.
 *   - We never throw for missing optional fields (salary, modality, benefits).
 *     We DO throw if the description is < 50 chars so the background worker
 *     can trigger the Vision API fallback.
 *   - No external libraries — only document.querySelector / querySelectorAll.
 *
 * Indeed URL patterns handled:
 *   - /viewjob?jk=<id>       (direct job view, global)
 *   - /rc/clk?jk=<id>        (redirect-to-job click)
 *   - /jobs?q=…              (search results with embedded right-pane)
 *   - ar.indeed.com variants of all of the above
 */

import { ExtractedJobData, ExtensionMessage, MessageResponse } from '../shared/types';
import { MSG } from '../shared/constants';

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
      // Not our message — pass through to other listeners
      return false;
    }

    console.debug('[MockMaster Indeed] EXTRACT_JOB received');

    extractWithRetry()
      .then((data) => {
        console.debug('[MockMaster Indeed] extraction success:', data.title);
        sendResponse({ success: true, data });
      })
      .catch((err: unknown) => {
        console.error('[MockMaster Indeed] extraction failed:', err);
        sendResponse({ success: false, error: String(err) });
      });

    // Return true to keep the message channel open for the async sendResponse
    return true;
  }
);

// ---------------------------------------------------------------------------
// Selector constants
// Ordered from most specific / stable to least specific / fragile.
// ---------------------------------------------------------------------------

/** Title selectors, tried in order until one yields a non-empty string. */
const TITLE_SELECTORS = [
  'h1.jobsearch-JobInfoHeader-title',
  'h1[data-testid="jobsearch-JobInfoHeader-title"]',
  '.icl-u-xs-mb--xs h1',
  '.jobTitle h1',
  '.jobTitle',
  'h1',
] as const;

/** Company name selectors. */
const COMPANY_SELECTORS = [
  'div[data-company-name] a',
  'div[data-company-name]',
  '[data-testid="inlineHeader-companyName"] a',
  '[data-testid="inlineHeader-companyName"]',
  '.jobsearch-InlineCompanyRating-companyHeader a',
  '.jobsearch-InlineCompanyRating-companyHeader',
  'span[data-testid="company-name"]',
  '.icl-u-lg-mr--sm a',
  '.icl-u-lg-mr--sm',
] as const;

/** Location selectors. */
const LOCATION_SELECTORS = [
  'div[data-testid="job-location"]',
  'div[data-testid="inlineHeader-companyLocation"]',
  '[data-testid="jobsearch-JobInfoHeader-companyLocation"]',
  '.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)',
  '.icl-u-xs-mt--xs .companyLocation',
  '.companyLocation',
] as const;

/** Description selectors. */
const DESCRIPTION_SELECTORS = [
  '#jobDescriptionText',
  'div[id="jobDescriptionText"]',
  '.jobsearch-jobDescriptionText',
  '.jobsearch-JobComponent-description',
  '.job-description',
  // Indeed's newer React-rendered shell
  '[data-testid="jobDescriptionText"]',
  // Indeed home feed right panel (/?vjk=... URLs)
  '.jobsearch-RightPane #jobDescriptionText',
  '.jobsearch-RightPane .jobsearch-JobComponent-description',
  '[data-testid="job-details"] #jobDescriptionText',
  // Broader right-pane container as last resort
  '.jobsearch-RightPane',
  '.jobsearch-ViewJobLayout-jobDisplay',
  '[data-testid="job-details"]',
] as const;

/** Salary selectors — salary is optional. */
const SALARY_SELECTORS = [
  '#salaryInfoAndJobType',
  '.salary-snippet',
  '.jobsearch-JobMetadataHeader-item:first-child',
  'div[data-testid="attribute_snippet_testid"]',
  'span[class*="salary"]',
  '[data-testid="salaryInfoAndJobType"]',
] as const;

/** Metadata badge items that may contain modality keywords. */
const METADATA_ITEM_SELECTOR = '.jobsearch-JobMetadataHeader-item';

/** Structured section items Indeed sometimes renders inside descriptions. */
const SECTION_ITEM_SELECTOR = '.jobsearch-JobDescriptionSection-sectionItem';

// ---------------------------------------------------------------------------
// Retry wrapper — Indeed loads job details lazily via AJAX on SPA navigation
// ---------------------------------------------------------------------------

/**
 * Attempts extraction up to 3 times with a 1-second delay between attempts.
 * This handles the case where Indeed's home feed loads job details asynchronously
 * after the URL changes (SPA navigation via History API).
 */
async function extractWithRetry(maxAttempts = 3): Promise<ExtractedJobData> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await extractJobData();
    } catch (err) {
      lastError = err;
      console.debug(`[MockMaster Indeed] extraction attempt ${attempt}/${maxAttempts} failed, retrying...`);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Core extraction
// ---------------------------------------------------------------------------

/**
 * Top-level async extractor. Reads the Indeed job listing DOM and returns
 * a structured ExtractedJobData object.
 *
 * Throws if the job title or description cannot be found, so the background
 * service worker knows to invoke the Vision API fallback.
 */
async function extractJobData(): Promise<ExtractedJobData> {
  const url = window.location.href;
  const now = new Date().toISOString();

  // --- Title (mandatory) ---------------------------------------------------
  const title = getTextContent(TITLE_SELECTORS);
  if (!title) {
    throw new Error(
      'No se pudo encontrar el titulo del aviso en Indeed. ' +
        'La pagina puede no haber cargado completamente.'
    );
  }

  // --- Company -------------------------------------------------------------
  const company = getTextContent(COMPANY_SELECTORS) || 'Empresa no encontrada';

  // --- Location ------------------------------------------------------------
  const location = getTextContent(LOCATION_SELECTORS) || '';

  // --- Description (mandatory — must be >= 50 chars) ----------------------
  let description = extractDescription();

  // Fallback: try same-origin iframes if the main doc has nothing
  if (description.length < 50) {
    description = extractDescriptionFromIframes();
  }

  if (description.length < 50) {
    throw new Error(
      'La descripcion del aviso es demasiado corta o no se pudo extraer. ' +
        'Se activara el modo de extraccion por Vision.'
    );
  }

  // --- Salary (optional) ---------------------------------------------------
  const salary = extractSalary(description);

  // --- Modality (optional) ------------------------------------------------
  // Check dedicated metadata badges first, then fall back to description text
  const modality = detectModality(getMetadataText() + ' ' + description);

  // --- Requirements --------------------------------------------------------
  const requirements = extractRequirements(description);

  // --- Benefits ------------------------------------------------------------
  const benefits = extractBenefitsField(description);

  // --- Raw text for LLM ----------------------------------------------------
  const rawText = [title, company, location, description].filter(Boolean).join('\n\n');

  return {
    source: 'indeed',
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
// Helper: getTextContent
// ---------------------------------------------------------------------------

/**
 * Iterates through a list of CSS selectors and returns the trimmed innerText
 * of the first element that exists and has non-empty text content.
 *
 * Using innerText (not textContent) so that hidden elements and display:none
 * nodes are skipped automatically by the browser layout engine.
 *
 * @param selectors - Ordered list of CSS selectors to try.
 * @returns The first non-empty trimmed text, or an empty string if all fail.
 */
function getTextContent(selectors: readonly string[]): string {
  for (const selector of selectors) {
    try {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const text = el.innerText?.trim();
        if (text && text.length > 0) {
          return text;
        }
      }
    } catch {
      // Malformed selector — skip and try the next one
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// Helper: description extraction
// ---------------------------------------------------------------------------

/**
 * Extracts and cleans the job description from the main document.
 * Tries each DESCRIPTION_SELECTORS entry in order.
 */
function extractDescription(): string {
  for (const selector of DESCRIPTION_SELECTORS) {
    try {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const raw = el.innerText?.trim();
        if (raw && raw.length > 0) {
          return cleanDescription(raw);
        }
      }
    } catch {
      // Malformed selector — continue
    }
  }

  // Last resort: collect any structured section items Indeed renders
  const sectionItems = document.querySelectorAll<HTMLElement>(SECTION_ITEM_SELECTOR);
  if (sectionItems.length > 0) {
    const combined = Array.from(sectionItems)
      .map((el) => el.innerText?.trim())
      .filter(Boolean)
      .join('\n\n');
    if (combined.length > 0) {
      return cleanDescription(combined);
    }
  }

  return '';
}

/**
 * Attempts to read the job description from same-origin iframes.
 * Indeed occasionally renders job details inside an <iframe> (particularly
 * in the /jobs search-results view where the detail pane is embedded).
 *
 * Cross-origin iframes will throw a SecurityError, which we catch and skip.
 */
function extractDescriptionFromIframes(): string {
  const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) continue;

      for (const selector of DESCRIPTION_SELECTORS) {
        try {
          const el = iframeDoc.querySelector<HTMLElement>(selector);
          if (el) {
            const raw = el.innerText?.trim();
            if (raw && raw.length >= 50) {
              console.debug('[MockMaster Indeed] description found in iframe via', selector);
              return cleanDescription(raw);
            }
          }
        } catch {
          // Selector failed inside this iframe document — try next selector
        }
      }
    } catch {
      // Cross-origin or inaccessible iframe — skip
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// Helper: cleanDescription
// ---------------------------------------------------------------------------

/**
 * Removes Indeed UI artifacts from description text and normalises whitespace.
 *
 * Patterns stripped:
 *   - "Report this job" / "Reportar este trabajo" buttons
 *   - "Apply now" / "Aplicar ahora" call-to-action text
 *   - Trailing lines that are just page navigation boilerplate
 *   - Runs of 3+ newlines compressed to double newline
 *   - Leading / trailing whitespace
 *
 * @param text - Raw innerText from the description element.
 * @returns Cleaned description string.
 */
function cleanDescription(text: string): string {
  return text
    // Remove "Report this job" buttons (English and Spanish)
    .replace(/\breport\s+this\s+job\b/gi, '')
    .replace(/\breportar\s+este\s+trabajo\b/gi, '')
    // Remove standalone "Apply now" / "Aplicar ahora" call-to-action lines
    .replace(/^apply\s+now\s*$/gim, '')
    .replace(/^aplicar?\s+ahora\s*$/gim, '')
    // Remove "Easy apply" / "Aplicacion simplificada" badges
    .replace(/^easy\s+apply\s*$/gim, '')
    .replace(/^aplicaci[oó]n\s+simplificada\s*$/gim, '')
    // Remove "Save job" / "Guardar trabajo"
    .replace(/^(save|guardar)\s+job|trabajo\s*$/gim, '')
    // Collapse runs of 3+ newlines into exactly two
    .replace(/\n{3,}/g, '\n\n')
    // Normalise Windows-style line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Trim leading and trailing whitespace
    .trim();
}

// ---------------------------------------------------------------------------
// Helper: salary extraction
// ---------------------------------------------------------------------------

/**
 * Tries the dedicated salary DOM selectors first, then searches the
 * description text for salary patterns as a fallback.
 *
 * @param description - Cleaned description text (used as fallback).
 * @returns Salary string or null if nothing is found.
 */
function extractSalary(description: string): string | null {
  // Try dedicated salary elements first
  for (const selector of SALARY_SELECTORS) {
    try {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const text = el.innerText?.trim();
        if (text && /\$|USD|ARS|€|£|hora|mes|a[nñ]o|hour|month|year|salary|salario/i.test(text)) {
          return text;
        }
      }
    } catch {
      // Continue to next selector
    }
  }

  // Fallback: scan all metadata header items (Indeed places salary there)
  const metaItems = document.querySelectorAll<HTMLElement>(METADATA_ITEM_SELECTOR);
  for (const item of metaItems) {
    const text = item.innerText?.trim();
    if (text && /\$|USD|ARS|€|£|hora|mes|a[nñ]o|hour|month|year/i.test(text)) {
      return text;
    }
  }

  // Last resort: search description text for salary patterns
  return extractSalaryFromText(description);
}

/**
 * Searches a text string for salary-like patterns using a broad regex.
 * Captures amounts with currency symbols and optional period qualifiers.
 *
 * Examples matched:
 *   "$45,000 - $60,000 per year"
 *   "ARS 150.000/mes"
 *   "USD 25/hora"
 *   "$30 - $45 an hour"
 *
 * @param text - Arbitrary text to search.
 * @returns First matching salary snippet or null.
 */
function extractSalaryFromText(text: string): string | null {
  const salaryPattern =
    /(?:USD|ARS|€|£|\$)\s*[\d.,]+(?:\s*[-–]\s*(?:USD|ARS|€|£|\$)?\s*[\d.,]+)?(?:\s*(?:per|\/|a)\s*(?:hour|hora|month|mes|year|a[nñ]o))?/i;
  const match = text.match(salaryPattern);
  return match ? match[0].trim() : null;
}

// ---------------------------------------------------------------------------
// Helper: modality detection
// ---------------------------------------------------------------------------

/**
 * Returns the concatenated innerText of all Indeed job metadata header items.
 * These badges typically contain "Remote", "Hybrid", "Full-time", etc.
 */
function getMetadataText(): string {
  const items = document.querySelectorAll<HTMLElement>(METADATA_ITEM_SELECTOR);
  return Array.from(items)
    .map((el) => el.innerText?.trim())
    .filter(Boolean)
    .join(' ');
}

/**
 * Infers work modality from a combined text string.
 * Evaluates hybrid before remote so "hybrid / remote" is classified as hybrid.
 *
 * Words matched (English and Spanish):
 *   - Hybrid:  hybrid, híbrido, híbrida
 *   - Remote:  remote, remoto, remota, work from home, home office, teletrabajo
 *   - Onsite:  on-site, onsite, presencial, office (solo)
 *
 * @param text - Combined metadata + description text.
 * @returns Detected modality or null if none detected.
 */
function detectModality(text: string): ExtractedJobData['modality'] {
  const lower = text.toLowerCase();

  // Evaluate hybrid first — it is more specific than remote
  if (/\bhybrid\b|\bh[íi]brido\b|\bh[íi]brida\b/.test(lower)) return 'hybrid';

  if (
    /\bremote\b|\bremoto\b|\bremota\b|\bwork\s+from\s+home\b|\bhome\s+office\b|\bteletrabajo\b/.test(
      lower
    )
  ) {
    return 'remote';
  }

  if (/\bon.?site\b|\bpresencial\b/.test(lower)) return 'onsite';

  return null;
}

// ---------------------------------------------------------------------------
// Helper: requirements extraction
// ---------------------------------------------------------------------------

/**
 * Attempts to isolate the requirements / qualifications section from the
 * description text using common heading patterns in both English and Spanish.
 *
 * Falls back to the full description when no dedicated section is found,
 * because the LLM downstream can extract requirements from free-form text.
 *
 * @param description - Cleaned description text.
 * @returns Requirements text or the full description as fallback.
 */
function extractRequirements(description: string): string {
  // Section heading keywords (English + Spanish)
  const headingPattern =
    /(?:requirements?|qualifications?|what\s+you(?:'ll|.ll)\s+need|about\s+you|requisitos|calificaciones|habilidades\s+requeridas|lo\s+que\s+buscamos)[:\s\n]+(.+?)(?=\n{2,}|\n[A-Z\u00C0-\u024F]|$)/is;

  const match = description.match(headingPattern);
  if (match?.[1]) {
    return match[1].trim();
  }

  // Also try to locate HTML bullet-list sections in the DOM directly
  const descEl = document.querySelector<HTMLElement>(
    DESCRIPTION_SELECTORS.find((s) => !!document.querySelector(s)) ?? '#jobDescriptionText'
  );
  if (descEl) {
    const ulElements = descEl.querySelectorAll<HTMLElement>('ul');
    if (ulElements.length > 0) {
      // Return the text of the first bullet list that looks like requirements
      for (const ul of ulElements) {
        const listText = ul.innerText?.trim();
        if (listText && listText.length > 30) {
          return listText;
        }
      }
    }
  }

  // Fallback: full description
  return description;
}

// ---------------------------------------------------------------------------
// Helper: benefits extraction
// ---------------------------------------------------------------------------

/**
 * Attempts to isolate the benefits / perks section from the description text.
 * Returns null when no benefits section can be identified.
 *
 * @param description - Cleaned description text.
 * @returns Benefits text or null.
 */
function extractBenefitsField(description: string): string | null {
  // Section heading keywords
  const headingPattern =
    /(?:benefits?|perks|what\s+we\s+offer|beneficios|lo\s+que\s+ofrecemos|te\s+ofrecemos|ofrecemos|nuestros\s+beneficios)[:\s\n]+(.+?)(?=\n{2,}|\n[A-Z\u00C0-\u024F]|$)/is;

  const match = description.match(headingPattern);
  if (match?.[1]) {
    return match[1].trim();
  }

  // Also look for a dedicated structured section in the DOM
  const sectionItems = document.querySelectorAll<HTMLElement>(SECTION_ITEM_SELECTOR);
  for (const item of sectionItems) {
    const text = item.innerText?.toLowerCase();
    if (text && /benefits?|beneficios|ofrecemos/.test(text)) {
      return item.innerText.trim();
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Startup log
// ---------------------------------------------------------------------------

console.debug('[MockMaster Indeed] content script loaded on:', window.location.href);

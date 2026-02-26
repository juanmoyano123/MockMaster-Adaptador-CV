/**
 * Application-wide constants for the MockMaster Chrome Extension.
 *
 * Centralising all magic strings and patterns here makes it trivial to
 * update them in one place when the API moves or URL patterns change.
 */

import { SidebarState } from './types';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Base URL for the MockMaster backend API.
 *
 * In development (npm run dev) this points to the local Next.js server.
 * For production builds the value is replaced by the deployed URL below.
 *
 * IMPORTANT: do NOT hardcode credentials here. Auth tokens are managed via
 * chrome.storage.local (see storage.ts).
 */
export const API_BASE_URL_DEV = 'http://localhost:3000';
export const API_BASE_URL_PROD = 'https://mockmaster.vercel.app';

/**
 * Resolved base URL.
 * During development the webpack `mode` is 'development'; we use that to
 * switch endpoints without an additional env-var mechanism.
 *
 * Webpack's DefinePlugin replaces `process.env.NODE_ENV` at compile time
 * with a string literal ("development" or "production"), so there is NO
 * `process` reference at runtime.  Do NOT add a `typeof process` guard —
 * that would bypass the compile-time substitution and always evaluate to
 * false in the Chrome extension context where `process` doesn't exist.
 */
export const API_BASE_URL: string =
  process.env.NODE_ENV === 'development'
    ? API_BASE_URL_DEV
    : API_BASE_URL_PROD;

// ---------------------------------------------------------------------------
// API endpoints
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  analyzeJob: '/api/analyze-job',
  adaptResume: '/api/adapt-resume',
  calculateATSBreakdown: '/api/calculate-ats-breakdown',
  generatePDF: '/api/generate-pdf',
  subscriptionStatus: '/api/subscriptions/status',
  applications: '/api/applications',
  extractJobVision: '/api/extract-job-vision',
  userResume: '/api/user/resume',
} as const;

// ---------------------------------------------------------------------------
// Job listing URL patterns
// ---------------------------------------------------------------------------

/**
 * Regular expressions that identify a URL as a job listing page.
 * Used by the background service worker to decide whether to auto-trigger
 * extraction and update the sidepanel state.
 */
export const JOB_LISTING_PATTERNS: readonly RegExp[] = [
  // LinkedIn — individual job view
  /^https:\/\/(www\.)?linkedin\.com\/jobs\/view\//,
  // LinkedIn — search results (job details pane is embedded)
  /^https:\/\/(www\.)?linkedin\.com\/jobs\/search\//,
  // LinkedIn — curated collections
  /^https:\/\/(www\.)?linkedin\.com\/jobs\/collections\//,
  // Indeed — direct job view (global + AR)
  /^https:\/\/(www\.|ar\.)?indeed\.com\/viewjob/,
  // Indeed — redirect-to-job click
  /^https:\/\/(www\.|ar\.)?indeed\.com\/rc\/clk/,
  // Indeed — pagead click
  /^https:\/\/(www\.|ar\.)?indeed\.com\/pagead\/clk/,
  // Indeed — jobs search results
  /^https:\/\/(www\.|ar\.)?indeed\.com\/jobs/,
  // Indeed — home feed with job selected (vjk param)
  /^https:\/\/(www\.|ar\.)?indeed\.com\/?\?.*vjk=/,
];

/**
 * Returns true if the given URL matches any known job listing pattern.
 */
export function isJobListingUrl(url: string): boolean {
  return JOB_LISTING_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Returns the detected job board for a URL, or null if it is not a known
 * job listing URL.
 */
export function detectJobSource(url: string): 'linkedin' | 'indeed' | null {
  if (/linkedin\.com/.test(url)) return 'linkedin';
  if (/indeed\.com/.test(url)) return 'indeed';
  return null;
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

/** Keys used with chrome.storage.local */
export const STORAGE_KEYS = {
  authToken: 'mm_auth_token',
  cachedExtraction: 'mm_cached_extraction',
  lastTabUrl: 'mm_last_tab_url',
} as const;

// ---------------------------------------------------------------------------
// Message types (mirrors ExtensionMessage.type union — kept in sync manually)
// ---------------------------------------------------------------------------

export const MSG = {
  EXTRACT_JOB: 'EXTRACT_JOB',
  JOB_EXTRACTED: 'JOB_EXTRACTED',
  CAPTURE_SCREENSHOT: 'CAPTURE_SCREENSHOT',
  CHECK_AUTH: 'CHECK_AUTH',
  GET_TAB_URL: 'GET_TAB_URL',
  TAB_UPDATED: 'TAB_UPDATED',
  AUTH_CHANGED: 'AUTH_CHANGED',
  AUTH_TOKEN_RECEIVED: 'AUTH_TOKEN_RECEIVED',
} as const;

// ---------------------------------------------------------------------------
// UI / UX
// ---------------------------------------------------------------------------

/** Human-readable labels for sidebar states, used in placeholder UI */
export const STATE_LABELS: Record<SidebarState, string> = {
  loading: 'Cargando…',
  unauthenticated: 'Inicia sesion para continuar',
  unsupported_page: 'Navega a un aviso de empleo',
  extracting: 'Extrayendo informacion del aviso…',
  job_extracted: 'Aviso detectado',
  adapting: 'Adaptando tu CV con IA…',
  adapted: 'CV adaptado listo',
  application_saved: 'Postulacion guardada',
  error: 'Ocurrio un error',
};

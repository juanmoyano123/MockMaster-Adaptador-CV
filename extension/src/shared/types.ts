/**
 * Shared TypeScript types for the MockMaster Chrome Extension.
 *
 * These types are used across all three extension contexts:
 *   - Background service worker (background/)
 *   - Content scripts (content-scripts/)
 *   - Sidepanel React app (sidepanel/)
 *
 * Keep this file free of any DOM or Chrome API imports so it can be
 * imported in any context without side effects.
 */

// ---------------------------------------------------------------------------
// Job extraction
// ---------------------------------------------------------------------------

/**
 * Canonical shape of a job listing extracted from LinkedIn or Indeed.
 * The content scripts produce this object; the sidepanel consumes it.
 */
export interface ExtractedJobData {
  /** Which job board the data came from */
  source: 'linkedin' | 'indeed';
  /** Canonical URL of the job listing page */
  url: string;
  /** Job title as shown in the listing */
  title: string;
  /** Company name */
  company: string;
  /** Location string (city, country, or "Remote") */
  location: string;
  /** Salary range string if present, null otherwise */
  salary: string | null;
  /** Work modality if detected, null if not specified */
  modality: 'remote' | 'hybrid' | 'onsite' | null;
  /** Full job description body text */
  description: string;
  /** Requirements / qualifications section (may overlap with description) */
  requirements: string;
  /** Benefits section if present, null otherwise */
  benefits: string | null;
  /** ISO 8601 timestamp of when extraction happened */
  extracted_at: string;
  /**
   * How the data was extracted:
   *   - 'dom'    — CSS selector traversal (preferred, fast)
   *   - 'vision' — Screenshot sent to Vision API as fallback
   */
  extraction_method: 'dom' | 'vision';
  /** Complete raw text of the job listing for LLM processing */
  raw_text: string;
}

// ---------------------------------------------------------------------------
// Extension messaging
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all messages exchanged between extension contexts
 * via chrome.runtime.sendMessage / chrome.tabs.sendMessage.
 *
 * Pattern: { type: 'SCREAMING_SNAKE_CASE' } with optional payload fields.
 */
export type ExtensionMessage =
  /** Sidepanel -> Content script: trigger job extraction from the DOM */
  | { type: 'EXTRACT_JOB' }
  /** Content script -> Background / Sidepanel: extraction result */
  | { type: 'JOB_EXTRACTED'; data: ExtractedJobData }
  /** Sidepanel -> Background: request a screenshot of the active tab */
  | { type: 'CAPTURE_SCREENSHOT' }
  /** Sidepanel -> Background: check if user has a valid auth session */
  | { type: 'CHECK_AUTH' }
  /** Sidepanel -> Background: get the URL of the currently active tab */
  | { type: 'GET_TAB_URL' }
  /** Background -> Sidepanel: active tab URL updated */
  | {
      type: 'TAB_UPDATED';
      url: string;
      tabId: number;
      /** True when the URL matches a supported job listing pattern */
      isSupported: boolean;
      /** Which job board was detected, or null for non-job pages */
      source: 'linkedin' | 'indeed' | null;
    }
  /** Background -> Sidepanel: auth state changed */
  | { type: 'AUTH_CHANGED'; isAuthenticated: boolean }
  /** Content script (auth-relay) -> Background: token received from web app callback */
  | { type: 'AUTH_TOKEN_RECEIVED'; data: { token: string; user: { id: string; email: string; name: string } | null } };

/**
 * Generic response envelope for background -> sender replies.
 * Use `success: false` + `error` string for error cases.
 */
export type MessageResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Sidepanel state machine
// ---------------------------------------------------------------------------

/**
 * All possible states of the sidepanel UI.
 *
 * Transitions (linear happy path):
 *   loading -> unauthenticated | unsupported_page | job_extracted
 *   unauthenticated -> loading (after sign-in)
 *   unsupported_page -> extracting (when user navigates to a job page)
 *   extracting -> job_extracted | error
 *   job_extracted -> adapting
 *   adapting -> adapted | error
 *   adapted -> application_saved
 *   error -> extracting | job_extracted (retry)
 */
export type SidebarState =
  | 'loading'
  | 'unauthenticated'
  | 'unsupported_page'
  | 'extracting'
  | 'job_extracted'
  | 'adapting'
  | 'adapted'
  | 'application_saved'
  | 'error';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Minimal auth token payload stored in chrome.storage.local */
export interface StoredAuthToken {
  /** Supabase access token (JWT) */
  access_token: string;
  /** Supabase refresh token */
  refresh_token: string;
  /** Unix timestamp (ms) when the access token expires */
  expires_at: number;
  /** User ID from Supabase */
  user_id: string;
  /** User email */
  email: string;
}

// ---------------------------------------------------------------------------
// Application tracker
// ---------------------------------------------------------------------------

/**
 * A job application record as stored in the `applications` Supabase table
 * and returned by GET /api/applications.
 */
export interface Application {
  id: string;
  user_id: string;
  job_url: string;
  job_title: string;
  company: string;
  location: string | null;
  source: 'linkedin' | 'indeed' | 'other';
  status: ApplicationStatus;
  applied_at: string | null;
  cv_version_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/** Response from GET /api/subscriptions/status */
export interface SubscriptionStatus {
  plan: 'free' | 'pro';
  adaptations_used: number;
  adaptations_limit: number;
  /** True when the user still has remaining adaptations for the current period */
  can_adapt: boolean;
  reset_at: string | null;
}

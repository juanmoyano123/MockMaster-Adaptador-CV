/**
 * MockMaster API Client for the Chrome Extension Sidepanel
 *
 * This class is the single point of contact between the sidepanel React app
 * and the MockMaster Next.js backend.  All HTTP calls go through here.
 *
 * Design decisions:
 *   - Singleton pattern: one instance shared across the whole sidepanel.
 *   - Token managed externally: the sidepanel loads the token from
 *     chrome.storage.local on mount and calls setToken() once.
 *   - All methods throw on error so callers can use try/catch uniformly.
 *   - Generic `request()` handles auth headers, base URL, and error parsing.
 */

import { API_BASE_URL, API_ENDPOINTS } from '../../shared/constants';
import { SubscriptionStatus, Application, ApplicationStatus } from '../../shared/types';

// ---------------------------------------------------------------------------
// Types mirroring backend lib/types.ts
// ---------------------------------------------------------------------------

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  location?: string;
}

export interface ExperienceItem {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  year: string;
}

export interface ParsedContent {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

export interface ResumeData {
  name: string;
  original_text: string;
  parsed_content: ParsedContent;
  uploaded_at: string;
}

export interface JobAnalysisResult {
  job_title: string;
  company_name: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  seniority_level: string;
  industry: string;
}

export interface JobAnalysis {
  raw_text?: string;
  text_hash: string;
  analysis: JobAnalysisResult;
  analyzed_at: string;
}

export interface AdaptedExperienceItem extends ExperienceItem {
  relevance_score: number;
}

export interface AdaptedContent {
  contact: ContactInfo;
  summary: string;
  experience: AdaptedExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

export interface ChangesSummary {
  skills_highlighted: number;
  bullets_reformulated: number;
  experiences_reordered: boolean;
}

export interface AdaptedResume {
  original_resume_hash: string;
  job_analysis_hash: string;
  adapted_content: AdaptedContent;
  ats_score: number;
  ats_breakdown?: ATSScoreBreakdown;
  changes_summary: ChangesSummary;
  adapted_at: string;
}

export interface ATSScoreBreakdown {
  total_score: number;
  keyword_score: number;
  skills_score: number;
  experience_score: number;
  format_score: number;
  keywords_matched: number;
  keywords_total: number;
  missing_keywords: string[];
  skills_matched: string[];
  skills_missing: string[];
  suggestions: string[];
}

export interface UserResumeRow {
  id: string;
  name: string;
  original_text: string;
  parsed_content: ParsedContent;
  uploaded_at: string;
}

/**
 * Raw shape returned by GET /api/subscriptions/status.
 *
 * This is an implementation detail of the API transport layer — the
 * sidepanel always consumes the mapped SubscriptionStatus shape instead.
 * Kept private to this module so callers never depend on the raw format.
 */
interface ApiSubscriptionResponse {
  /** Subscription tier: 'free' or 'pro' */
  tier: 'free' | 'pro';
  /** Subscription lifecycle status (e.g. 'active', 'trialing', 'canceled') */
  status: string;
  /** Plan metadata returned by the API */
  plan: {
    name: string;
    price: number;
    currency: string;
    features: string[];
  };
  /** Usage counters for the current billing period */
  usage: {
    adaptations_used: number;
    adaptations_limit: number;
    /** True when the user still has remaining adaptations */
    can_adapt: boolean;
    /** ISO 8601 start date of the current usage period */
    period_start: string;
  };
  /** Nullable subscription timestamps (null for free users with no sub record) */
  subscription: {
    current_period_end: string | null;
    trial_ends_at: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Client class
// ---------------------------------------------------------------------------

class MockMasterClient {
  private accessToken: string | null = null;
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  /** Store the Supabase access token that will be sent with every request */
  setToken(token: string): void {
    this.accessToken = token;
  }

  /** Clear the stored token (e.g. on sign-out) */
  clearToken(): void {
    this.accessToken = null;
  }

  /** Returns true if a token is currently set */
  hasToken(): boolean {
    return this.accessToken !== null;
  }

  // -------------------------------------------------------------------------
  // Core HTTP helper
  // -------------------------------------------------------------------------

  /**
   * Executes a fetch request against the MockMaster API.
   *
   * Automatically:
   *   - Prepends the base URL
   *   - Adds the Authorization header when a token is set
   *   - Sets Content-Type: application/json for non-GET requests
   *   - Throws a descriptive Error for non-2xx responses
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      let errorCode: string | undefined;
      try {
        const body = await response.json();
        errorMessage = body.error ?? body.message ?? errorMessage;
        errorCode = body.code;
      } catch {
        // Response body was not JSON — use the status text
      }
      const err = new Error(errorMessage) as Error & { code?: string };
      err.code = errorCode;
      throw err;
    }

    return response.json() as Promise<T>;
  }

  // -------------------------------------------------------------------------
  // Job analysis
  // -------------------------------------------------------------------------

  /**
   * Sends the raw job description text to the API for structured analysis.
   *
   * Backend: POST /api/analyze-job
   *   Request:  { text: string }
   *   Response: { text_hash: string, analysis: JobAnalysisResult, analyzed_at: string }
   *
   * The response shape exactly matches JobAnalysis (raw_text is optional and
   * not included by the backend endpoint).
   */
  async analyzeJob(text: string): Promise<JobAnalysis> {
    return this.request<JobAnalysis>(API_ENDPOINTS.analyzeJob, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // -------------------------------------------------------------------------
  // Resume adaptation
  // -------------------------------------------------------------------------

  /**
   * Sends the user's resume and the job analysis to the AI adaptation endpoint.
   *
   * Backend: POST /api/adapt-resume
   *   Request:  { resume: ResumeData, jobAnalysis: JobAnalysis }   <-- camelCase key
   *   Response: AdaptedResume (direct, not wrapped in an envelope)
   *
   * NOTE: The backend destructures `{ resume, jobAnalysis }` (camelCase).
   * The old snake_case key `job_analysis` caused silent validation failures.
   */
  async adaptResume(resume: ResumeData, jobAnalysis: JobAnalysis): Promise<AdaptedResume> {
    return this.request<AdaptedResume>(API_ENDPOINTS.adaptResume, {
      method: 'POST',
      body: JSON.stringify({ resume, jobAnalysis }),
    });
  }

  // -------------------------------------------------------------------------
  // Subscription
  // -------------------------------------------------------------------------

  /**
   * Returns the current user's subscription plan, usage, and quota.
   * Used by the sidepanel to gate the "Adaptar CV" action.
   *
   * Maps the raw API response (ApiSubscriptionResponse) to the canonical
   * SubscriptionStatus shape used throughout the sidepanel.
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await this.request<ApiSubscriptionResponse>(
      API_ENDPOINTS.subscriptionStatus
    );

    // Compute reset_at as the first day of the month AFTER the period start.
    // Example: period_start = 2026-02-10 → reset_at = 2026-03-01T00:00:00.000Z
    const periodStart = new Date(response.usage.period_start);
    const resetAt = new Date(
      periodStart.getFullYear(),
      periodStart.getMonth() + 1,
      1
    );

    return {
      plan: response.tier,
      adaptations_used: response.usage.adaptations_used,
      adaptations_limit: response.usage.adaptations_limit,
      can_adapt: response.usage.can_adapt,
      reset_at: resetAt.toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // ATS score
  // -------------------------------------------------------------------------

  /**
   * Calculates the detailed ATS compatibility score breakdown.
   *
   * Backend: POST /api/calculate-ats-breakdown
   *   Request:  { adapted_content: AdaptedContent, job_analysis: JobAnalysis }
   *   Response: { breakdown: ATSScoreBreakdown }
   *
   * Accepts AdaptedContent (the inner content object from AdaptedResume) and
   * unwraps the `{ breakdown }` envelope before returning.
   */
  async calculateATSBreakdown(
    adaptedContent: AdaptedContent,
    jobAnalysis: JobAnalysis
  ): Promise<ATSScoreBreakdown> {
    const response = await this.request<{ breakdown: ATSScoreBreakdown }>(
      API_ENDPOINTS.calculateATSBreakdown,
      {
        method: 'POST',
        body: JSON.stringify({
          adapted_content: adaptedContent,
          job_analysis: jobAnalysis,
        }),
      }
    );
    return response.breakdown;
  }

  // -------------------------------------------------------------------------
  // PDF generation
  // -------------------------------------------------------------------------

  /**
   * Requests a PDF export of the adapted resume.
   * Returns a Blob that can be downloaded or shared.
   *
   * Track C: implement template selection and response handling.
   */
  async generatePDF(
    adapted: AdaptedResume,
    template: string,
    company: string
  ): Promise<Blob> {
    const url = `${this.baseUrl}${API_ENDPOINTS.generatePDF}`;

    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ adapted_resume: adapted, template, company }),
    });

    if (!response.ok) {
      throw new Error(`PDF generation failed: HTTP ${response.status}`);
    }

    return response.blob();
  }

  // -------------------------------------------------------------------------
  // Vision extraction fallback
  // -------------------------------------------------------------------------

  /**
   * Sends a base64-encoded screenshot to the Vision API endpoint for
   * server-side job data extraction (fallback when DOM parsing fails).
   *
   * Track B: implement screenshot capture + this method body.
   */
  async extractJobVision(
    screenshot: string,
    source: 'linkedin' | 'indeed',
    url: string
  ): Promise<unknown> {
    // TODO (Track B): implement request body + response parsing
    return this.request(API_ENDPOINTS.extractJobVision, {
      method: 'POST',
      body: JSON.stringify({ screenshot, source, url }),
    });
  }

  // -------------------------------------------------------------------------
  // User resume
  // -------------------------------------------------------------------------

  /**
   * Returns the currently authenticated user's stored resume.
   *
   * Backend: GET /api/user/resume
   *   Response: { resume: UserResumeRow }
   *
   * The API wraps the record in a `{ resume }` envelope — this method
   * unwraps it so callers receive the row directly.
   *
   * Throws if no resume exists (404 becomes an Error with code NOT_FOUND).
   */
  async getUserResume(): Promise<UserResumeRow> {
    const response = await this.request<{ resume: UserResumeRow }>(
      API_ENDPOINTS.userResume
    );
    return response.resume;
  }

  // -------------------------------------------------------------------------
  // Applications tracker
  // -------------------------------------------------------------------------

  /**
   * Creates a new application record in the tracker.
   *
   * Track D: implement full request body shape.
   */
  async createApplication(data: Partial<Application>): Promise<Application> {
    // TODO (Track D): validate required fields before sending
    return this.request<Application>(API_ENDPOINTS.applications, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Returns all application records for the current user, with optional
   * filtering and pagination.
   *
   * Track D: implement query params.
   */
  async getApplications(params?: {
    status?: ApplicationStatus;
    source?: 'linkedin' | 'indeed' | 'other';
    limit?: number;
    offset?: number;
  }): Promise<Application[]> {
    const qs = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return this.request<Application[]>(`${API_ENDPOINTS.applications}${qs}`);
  }

  /**
   * Checks whether an application for the given job URL already exists.
   * Returns the application if found, or null.
   *
   * Track D: implement response handling.
   */
  async checkApplicationExists(jobUrl: string): Promise<Application | null> {
    try {
      const qs = '?' + new URLSearchParams({ job_url: jobUrl }).toString();
      const results = await this.request<Application[]>(
        `${API_ENDPOINTS.applications}${qs}`
      );
      return results[0] ?? null;
    } catch {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/** Shared client instance used across the whole sidepanel React app */
export const mockMasterClient = new MockMasterClient();

export default MockMasterClient;

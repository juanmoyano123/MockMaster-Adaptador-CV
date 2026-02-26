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
 *
 * Track C will fill in the actual request bodies and response parsing.
 * This skeleton defines every method signature so TypeScript can validate
 * call-sites in the sidepanel components.
 */

import { API_BASE_URL, API_ENDPOINTS } from '../../shared/constants';
import { SubscriptionStatus, Application, ApplicationStatus } from '../../shared/types';

// ---------------------------------------------------------------------------
// Response shapes (mirrors the Next.js API route responses)
// ---------------------------------------------------------------------------

export interface JobAnalysis {
  title: string;
  company: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_years: number | null;
  education: string | null;
  key_responsibilities: string[];
  seniority: string | null;
  summary: string;
}

export interface AdaptedResume {
  professional_summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  languages: LanguageEntry[];
  certifications: string[];
  raw_text: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  description: string;
  achievements: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
}

export interface LanguageEntry {
  language: string;
  level: string;
}

export interface ATSBreakdown {
  overall_score: number;
  keyword_match: number;
  format_score: number;
  experience_match: number;
  skills_match: number;
  feedback: string[];
}

export interface UserResume {
  id: string;
  user_id: string;
  content: string;
  parsed_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
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
      try {
        const body = await response.json();
        errorMessage = body.error ?? body.message ?? errorMessage;
      } catch {
        // Response body was not JSON — use the status text
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  // -------------------------------------------------------------------------
  // Job analysis
  // -------------------------------------------------------------------------

  /**
   * Sends the raw job description text to the API for structured analysis.
   * Returns a JobAnalysis object with extracted skills, requirements, etc.
   *
   * Track C: implement request body + response parsing.
   */
  async analyzeJob(text: string): Promise<JobAnalysis> {
    // TODO (Track C): validate response shape, handle quota errors
    // NOTE: the backend route expects { text }, NOT { job_description }
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
   * Returns an AdaptedResume with sections tailored for the specific job.
   *
   * Track C: implement request body + response parsing.
   */
  async adaptResume(
    resume: UserResume,
    jobAnalysis: JobAnalysis
  ): Promise<AdaptedResume> {
    // TODO (Track C): validate response shape, handle quota/rate-limit errors
    return this.request<AdaptedResume>(API_ENDPOINTS.adaptResume, {
      method: 'POST',
      body: JSON.stringify({ resume, job_analysis: jobAnalysis }),
    });
  }

  // -------------------------------------------------------------------------
  // Subscription
  // -------------------------------------------------------------------------

  /**
   * Returns the current user's subscription plan, usage, and quota.
   * Used by the sidepanel to gate the "Adaptar CV" action.
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    return this.request<SubscriptionStatus>(API_ENDPOINTS.subscriptionStatus);
  }

  // -------------------------------------------------------------------------
  // ATS score
  // -------------------------------------------------------------------------

  /**
   * Calculates the ATS compatibility score between the adapted resume and
   * the original job description.
   *
   * Track C: implement request body + response parsing.
   */
  async calculateATSBreakdown(
    adapted: AdaptedResume,
    jobAnalysis: JobAnalysis
  ): Promise<ATSBreakdown> {
    // TODO (Track C): validate response shape
    return this.request<ATSBreakdown>(API_ENDPOINTS.calculateATSBreakdown, {
      method: 'POST',
      body: JSON.stringify({ adapted_resume: adapted, job_analysis: jobAnalysis }),
    });
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
   * If no resume exists, the API returns a 404 which becomes a thrown Error.
   */
  async getUserResume(): Promise<UserResume> {
    return this.request<UserResume>(API_ENDPOINTS.userResume);
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

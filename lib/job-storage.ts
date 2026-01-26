/**
 * localStorage abstraction layer for job analysis storage
 * Feature: F-003
 *
 * Stores job analysis data in browser localStorage for MVP.
 * Single job storage (new analysis overwrites old).
 */

import { JobAnalysis } from './types';

class JobAnalysisStorage {
  private readonly STORAGE_KEY = 'mockmaster_job_analysis';

  /**
   * Check if localStorage is available and working
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Saves job analysis data to localStorage
   * Overwrites any existing analysis (single job storage)
   *
   * @throws Error if localStorage is unavailable or quota exceeded
   */
  save(data: JobAnalysis): void {
    if (!this.isStorageAvailable()) {
      throw new Error(
        'localStorage is not available. Please enable cookies and site data.'
      );
    }

    try {
      const json = JSON.stringify(data);
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch (e) {
      // Handle QuotaExceededError
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        throw new Error(
          'Storage quota exceeded. Job description is too large. Try a shorter version or clear browser data.'
        );
      }
      throw new Error('Failed to save job analysis. Please try again.');
    }
  }

  /**
   * Retrieves job analysis data from localStorage
   *
   * @returns JobAnalysis object or null if not found/corrupted
   */
  get(): JobAnalysis | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) {
        return null;
      }

      const data = JSON.parse(json) as JobAnalysis;

      // Basic validation to ensure data structure is intact
      if (
        !data.raw_text ||
        !data.text_hash ||
        !data.analysis ||
        !data.analyzed_at
      ) {
        console.error('Invalid job analysis data structure in localStorage');
        return null;
      }

      return data;
    } catch (e) {
      console.error('Failed to parse job analysis data from localStorage:', e);
      return null;
    }
  }

  /**
   * Deletes job analysis data from localStorage
   */
  delete(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to delete job analysis:', e);
    }
  }

  /**
   * Checks if a job analysis exists in storage
   */
  has(): boolean {
    return this.get() !== null;
  }

  /**
   * Checks if the provided text hash matches the cached analysis
   * Used for cache detection to avoid redundant API calls
   *
   * @param textHash - SHA-256 hash of the job description text
   * @returns true if cached analysis exists with matching hash
   */
  isCached(textHash: string): boolean {
    const existing = this.get();
    if (!existing) {
      return false;
    }
    return existing.text_hash === textHash;
  }

  /**
   * Gets the approximate storage size used by the job analysis in bytes
   */
  getStorageSize(): number {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) {
        return 0;
      }
      // Each character in JavaScript is 2 bytes in UTF-16
      return json.length * 2;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Gets storage size in a human-readable format
   */
  getStorageSizeFormatted(): string {
    const bytes = this.getStorageSize();
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

// Export singleton instance
export const jobAnalysisStorage = new JobAnalysisStorage();

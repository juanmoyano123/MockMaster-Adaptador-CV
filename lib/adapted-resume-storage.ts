/**
 * localStorage abstraction layer for adapted resume storage
 * Feature: F-004 (Enhanced with F-012 for editing)
 *
 * Stores AI-adapted resume data in browser localStorage for MVP.
 * Single adaptation per browser (new adaptation overwrites old).
 * Supports user edits stored separately from original AI version.
 */

import { AdaptedResume, AdaptedContent } from './types';

/**
 * Metadata about user edits
 */
export interface EditedContent {
  adapted_content: AdaptedContent;
  last_edited: string; // ISO timestamp
  sections_edited: string[]; // ['summary', 'experience', 'skills']
}

class AdaptedResumeStorage {
  private readonly STORAGE_KEY = 'mockmaster_adapted_resume';
  private readonly EDITED_KEY = 'mockmaster_edited_resume';

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
   * Saves adapted resume data to localStorage
   * Overwrites any existing adaptation (single adaptation storage)
   *
   * @throws Error if localStorage is unavailable or quota exceeded
   */
  save(data: AdaptedResume): void {
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
          'Storage quota exceeded. Adapted resume is too large. Try clearing browser data.'
        );
      }
      throw new Error('Failed to save adapted resume. Please try again.');
    }
  }

  /**
   * Retrieves adapted resume data from localStorage
   *
   * @returns AdaptedResume object or null if not found/corrupted
   */
  get(): AdaptedResume | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) {
        return null;
      }

      const data = JSON.parse(json) as AdaptedResume;

      // Basic validation to ensure data structure is intact
      if (
        !data.original_resume_hash ||
        !data.job_analysis_hash ||
        !data.adapted_content ||
        !data.adapted_at
      ) {
        console.error('Invalid adapted resume data structure in localStorage');
        return null;
      }

      return data;
    } catch (e) {
      console.error('Failed to parse adapted resume data from localStorage:', e);
      return null;
    }
  }

  /**
   * Deletes adapted resume data from localStorage
   */
  delete(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to delete adapted resume:', e);
    }
  }

  /**
   * Checks if an adapted resume exists in storage
   */
  has(): boolean {
    return this.get() !== null;
  }

  /**
   * Checks if the provided hashes match the cached adaptation
   * Used to detect if user needs to re-adapt for different resume/job
   *
   * @param resumeHash - Hash of the original resume text
   * @param jobHash - Hash of the job analysis
   * @returns true if cached adaptation matches these inputs
   */
  isCached(resumeHash: string, jobHash: string): boolean {
    const existing = this.get();
    if (!existing) {
      return false;
    }
    return (
      existing.original_resume_hash === resumeHash &&
      existing.job_analysis_hash === jobHash
    );
  }

  /**
   * Gets the approximate storage size used by the adapted resume in bytes
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

  /**
   * Clears all MockMaster data from localStorage
   * Used for "Start Over" functionality
   */
  clearAll(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem('mockmaster_resume');
      localStorage.removeItem('mockmaster_job_analysis');
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.EDITED_KEY);
    } catch (e) {
      console.error('Failed to clear all data:', e);
    }
  }

  // ============================================
  // Edit-related methods (Feature F-012)
  // ============================================

  /**
   * Save user's edited version (separate from original AI version)
   * Feature: F-012
   *
   * @param content - The edited adapted content
   * @param sectionsEdited - Array of section names that were edited
   * @throws Error if localStorage is unavailable or quota exceeded
   */
  saveEdited(content: AdaptedContent, sectionsEdited: string[]): void {
    if (!this.isStorageAvailable()) {
      throw new Error(
        'localStorage is not available. Please enable cookies and site data.'
      );
    }

    try {
      const editData: EditedContent = {
        adapted_content: content,
        last_edited: new Date().toISOString(),
        sections_edited: sectionsEdited,
      };
      const json = JSON.stringify(editData);
      localStorage.setItem(this.EDITED_KEY, json);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        throw new Error(
          'Storage quota exceeded. Edited resume is too large. Try clearing browser data.'
        );
      }
      throw new Error('Failed to save edited resume. Please try again.');
    }
  }

  /**
   * Get user's edited version
   * Feature: F-012
   *
   * @returns EditedContent object or null if no edits exist
   */
  getEdited(): EditedContent | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const json = localStorage.getItem(this.EDITED_KEY);
      if (!json) {
        return null;
      }

      const data = JSON.parse(json) as EditedContent;

      // Basic validation
      if (
        !data.adapted_content ||
        !data.last_edited ||
        !data.sections_edited
      ) {
        console.error('Invalid edited resume data structure in localStorage');
        return null;
      }

      return data;
    } catch (e) {
      console.error('Failed to parse edited resume data from localStorage:', e);
      return null;
    }
  }

  /**
   * Get content for display/export (edited if exists, else original)
   * Feature: F-012
   *
   * This is the primary method for getting content to display or export.
   * It returns the edited version if it exists, otherwise the original AI version.
   *
   * @returns AdaptedContent or null if neither exists
   */
  getContentForExport(): AdaptedContent | null {
    const edited = this.getEdited();
    if (edited) {
      return edited.adapted_content;
    }

    const original = this.get();
    return original ? original.adapted_content : null;
  }

  /**
   * Check if user has made edits
   * Feature: F-012
   *
   * @returns true if edited version exists
   */
  hasEdits(): boolean {
    return this.getEdited() !== null;
  }

  /**
   * Delete edited version (keep original AI version)
   * Feature: F-012
   */
  deleteEdited(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.EDITED_KEY);
    } catch (e) {
      console.error('Failed to delete edited resume:', e);
    }
  }

  /**
   * Reset to AI version (delete all edits)
   * Feature: F-012
   *
   * This is an alias for deleteEdited() with a more semantic name
   */
  resetToAIVersion(): void {
    this.deleteEdited();
  }
}

// Export singleton instance
export const adaptedResumeStorage = new AdaptedResumeStorage();

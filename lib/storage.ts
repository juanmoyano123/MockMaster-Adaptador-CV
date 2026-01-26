/**
 * localStorage abstraction layer for resume storage
 * Feature: F-002
 *
 * Stores resume data in browser localStorage for MVP.
 * Limits: 1 resume per browser, ~5-10MB storage quota.
 */

import { ResumeData } from './types';

class ResumeStorage {
  private readonly STORAGE_KEY = 'mockmaster_resume';

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
   * Saves resume data to localStorage
   * Throws error if localStorage is unavailable or quota exceeded
   */
  saveResume(resume: ResumeData): void {
    if (!this.isStorageAvailable()) {
      throw new Error('localStorage is not available. Please enable cookies and site data.');
    }

    try {
      const json = JSON.stringify(resume);
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch (e) {
      // Handle QuotaExceededError
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Your resume is too large. Try reducing file size or clearing browser data.');
      }
      throw new Error('Failed to save resume. Please try again.');
    }
  }

  /**
   * Retrieves resume data from localStorage
   * Returns null if no resume exists or if data is corrupted
   */
  getResume(): ResumeData | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) {
        return null;
      }

      const data = JSON.parse(json) as ResumeData;

      // Basic validation to ensure data structure is intact
      if (!data.name || !data.original_text || !data.parsed_content) {
        console.error('Invalid resume data structure in localStorage');
        return null;
      }

      return data;
    } catch (e) {
      console.error('Failed to parse resume data from localStorage:', e);
      return null;
    }
  }

  /**
   * Deletes resume data from localStorage
   */
  deleteResume(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to delete resume:', e);
    }
  }

  /**
   * Checks if a resume exists in storage
   */
  hasResume(): boolean {
    return this.getResume() !== null;
  }

  /**
   * Gets the approximate storage size used by the resume in bytes
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
   * Warns if storage size is approaching quota (>3MB)
   */
  shouldWarnStorageSize(): boolean {
    const bytes = this.getStorageSize();
    const warningThreshold = 3 * 1024 * 1024; // 3MB
    return bytes > warningThreshold;
  }
}

// Export singleton instance
export const resumeStorage = new ResumeStorage();

/**
 * localStorage abstraction layer for Job Description Library
 * Feature: F-007
 *
 * Stores multiple saved job descriptions for quick reuse.
 * Users can save, tag, search, and reuse job descriptions.
 */

import { SavedJobDescription, JobLibraryStats, JobAnalysis } from './types';

class JobLibraryStorage {
  private readonly STORAGE_KEY = 'mockmaster_job_library';
  private readonly MAX_ITEMS = 50; // Limit to prevent localStorage overflow

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
   * Generate a UUID for new items
   */
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Get all saved job descriptions from localStorage
   */
  getAll(): SavedJobDescription[] {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) {
        return [];
      }

      const items = JSON.parse(json) as SavedJobDescription[];

      // Sort by last_used_at (most recent first)
      return items.sort((a, b) =>
        new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime()
      );
    } catch (e) {
      console.error('Failed to parse job library from localStorage:', e);
      return [];
    }
  }

  /**
   * Get a single job description by ID
   */
  getById(id: string): SavedJobDescription | null {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  /**
   * Save a new job description to the library
   *
   * @param name - User-defined name for the job
   * @param tags - Array of tags for categorization
   * @param jobAnalysis - The analyzed job data
   * @returns The saved item with generated ID
   */
  save(
    name: string,
    tags: string[],
    jobAnalysis: JobAnalysis
  ): SavedJobDescription {
    if (!this.isStorageAvailable()) {
      throw new Error(
        'localStorage is not available. Please enable cookies and site data.'
      );
    }

    const items = this.getAll();

    // Check for duplicates by hash
    const existing = items.find(item => item.text_hash === jobAnalysis.text_hash);
    if (existing) {
      // Update existing item instead of creating duplicate
      return this.update(existing.id, { name, tags });
    }

    // Check limit
    if (items.length >= this.MAX_ITEMS) {
      // Remove oldest item (by last_used_at)
      const oldest = items[items.length - 1];
      this.delete(oldest.id);
    }

    const now = new Date().toISOString();
    const newItem: SavedJobDescription = {
      id: this.generateId(),
      name: name.trim(),
      tags: tags.map(t => t.trim().toLowerCase()),
      raw_text: jobAnalysis.raw_text,
      text_hash: jobAnalysis.text_hash,
      analysis: jobAnalysis.analysis,
      created_at: now,
      last_used_at: now,
    };

    try {
      const updatedItems = [newItem, ...items];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedItems));
      return newItem;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        throw new Error(
          'Storage quota exceeded. Please delete some saved job descriptions.'
        );
      }
      throw new Error('Failed to save job description. Please try again.');
    }
  }

  /**
   * Update an existing job description
   */
  update(
    id: string,
    updates: Partial<Pick<SavedJobDescription, 'name' | 'tags'>>
  ): SavedJobDescription {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error('Job description not found');
    }

    const updatedItem: SavedJobDescription = {
      ...items[index],
      ...updates,
      last_used_at: new Date().toISOString(),
    };

    if (updates.tags) {
      updatedItem.tags = updates.tags.map(t => t.trim().toLowerCase());
    }
    if (updates.name) {
      updatedItem.name = updates.name.trim();
    }

    items[index] = updatedItem;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      return updatedItem;
    } catch (e) {
      throw new Error('Failed to update job description. Please try again.');
    }
  }

  /**
   * Mark a job as recently used (updates last_used_at)
   */
  markAsUsed(id: string): void {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) return;

    items[index].last_used_at = new Date().toISOString();

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to update last_used_at:', e);
    }
  }

  /**
   * Delete a job description from the library
   */
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);

    if (filtered.length === items.length) {
      return false; // Item not found
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Failed to delete job description:', e);
      return false;
    }
  }

  /**
   * Search job descriptions by name or tags
   */
  search(query: string): SavedJobDescription[] {
    const items = this.getAll();
    const q = query.toLowerCase().trim();

    if (!q) return items;

    return items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.includes(q)) ||
      item.analysis.job_title.toLowerCase().includes(q) ||
      item.analysis.company_name.toLowerCase().includes(q)
    );
  }

  /**
   * Filter job descriptions by tag
   */
  filterByTag(tag: string): SavedJobDescription[] {
    const items = this.getAll();
    const t = tag.toLowerCase().trim();

    return items.filter(item => item.tags.includes(t));
  }

  /**
   * Get all unique tags from the library
   */
  getAllTags(): string[] {
    const items = this.getAll();
    const tagSet = new Set<string>();

    items.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  /**
   * Get library statistics
   */
  getStats(): JobLibraryStats {
    const items = this.getAll();
    const tags = this.getAllTags();

    return {
      total_saved: items.length,
      total_tags: tags.length,
      most_recent: items.length > 0 ? items[0].last_used_at : null,
    };
  }

  /**
   * Check if library is empty
   */
  isEmpty(): boolean {
    return this.getAll().length === 0;
  }

  /**
   * Check if a job description with given hash exists
   */
  existsByHash(textHash: string): boolean {
    const items = this.getAll();
    return items.some(item => item.text_hash === textHash);
  }

  /**
   * Get approximate storage size in bytes
   */
  getStorageSize(): number {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) return 0;
      return json.length * 2; // UTF-16
    } catch (e) {
      return 0;
    }
  }

  /**
   * Get storage size in human-readable format
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
   * Clear all saved job descriptions
   */
  clearAll(): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear job library:', e);
    }
  }
}

// Export singleton instance
export const jobLibraryStorage = new JobLibraryStorage();

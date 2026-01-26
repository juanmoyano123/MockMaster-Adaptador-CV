/**
 * Unit Tests: Adapted Resume Storage
 * Feature: F-004
 *
 * Tests localStorage operations for adapted resume data
 */

import { adaptedResumeStorage } from '@/lib/adapted-resume-storage';
import { AdaptedResume } from '@/lib/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('AdaptedResumeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockAdaptedResume: AdaptedResume = {
    original_resume_hash: 'abc123',
    job_analysis_hash: 'def456',
    adapted_content: {
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
      },
      summary: 'Experienced software engineer with 5 years in web development.',
      experience: [
        {
          company: 'Tech Corp',
          title: 'Senior Engineer',
          dates: '2020-Present',
          bullets: ['Led team of 5 engineers', 'Built scalable systems'],
          relevance_score: 95,
        },
      ],
      education: [
        {
          school: 'State University',
          degree: 'BS Computer Science',
          year: '2018',
        },
      ],
      skills: ['JavaScript', 'React', 'Node.js'],
    },
    ats_score: 85,
    changes_summary: {
      skills_highlighted: 5,
      bullets_reformulated: 10,
      experiences_reordered: true,
    },
    adapted_at: '2026-01-25T10:00:00.000Z',
  };

  describe('save()', () => {
    test('saves adapted resume to localStorage', () => {
      adaptedResumeStorage.save(mockAdaptedResume);

      const retrieved = adaptedResumeStorage.get();
      expect(retrieved).toEqual(mockAdaptedResume);
    });

    test('overwrites previous adaptation', () => {
      const first: AdaptedResume = {
        ...mockAdaptedResume,
        ats_score: 70,
      };
      const second: AdaptedResume = {
        ...mockAdaptedResume,
        ats_score: 85,
      };

      adaptedResumeStorage.save(first);
      adaptedResumeStorage.save(second);

      const retrieved = adaptedResumeStorage.get();
      expect(retrieved?.ats_score).toBe(85);
    });
  });

  describe('get()', () => {
    test('returns null when no data exists', () => {
      const result = adaptedResumeStorage.get();
      expect(result).toBeNull();
    });

    test('returns adapted resume when data exists', () => {
      adaptedResumeStorage.save(mockAdaptedResume);

      const result = adaptedResumeStorage.get();
      expect(result).toEqual(mockAdaptedResume);
    });

    test('returns null for corrupted data', () => {
      localStorage.setItem('mockmaster_adapted_resume', 'invalid json');

      const result = adaptedResumeStorage.get();
      expect(result).toBeNull();
    });

    test('returns null for incomplete data structure', () => {
      localStorage.setItem(
        'mockmaster_adapted_resume',
        JSON.stringify({ ats_score: 85 })
      );

      const result = adaptedResumeStorage.get();
      expect(result).toBeNull();
    });
  });

  describe('delete()', () => {
    test('deletes adapted resume from localStorage', () => {
      adaptedResumeStorage.save(mockAdaptedResume);
      expect(adaptedResumeStorage.has()).toBe(true);

      adaptedResumeStorage.delete();
      expect(adaptedResumeStorage.has()).toBe(false);
    });

    test('does not throw when deleting non-existent data', () => {
      expect(() => adaptedResumeStorage.delete()).not.toThrow();
    });
  });

  describe('has()', () => {
    test('returns false when no data exists', () => {
      expect(adaptedResumeStorage.has()).toBe(false);
    });

    test('returns true when data exists', () => {
      adaptedResumeStorage.save(mockAdaptedResume);
      expect(adaptedResumeStorage.has()).toBe(true);
    });

    test('returns false for corrupted data', () => {
      localStorage.setItem('mockmaster_adapted_resume', 'invalid');
      expect(adaptedResumeStorage.has()).toBe(false);
    });
  });

  describe('isCached()', () => {
    test('returns false when no data exists', () => {
      expect(adaptedResumeStorage.isCached('abc123', 'def456')).toBe(false);
    });

    test('returns true when hashes match', () => {
      adaptedResumeStorage.save(mockAdaptedResume);
      expect(adaptedResumeStorage.isCached('abc123', 'def456')).toBe(true);
    });

    test('returns false when resume hash does not match', () => {
      adaptedResumeStorage.save(mockAdaptedResume);
      expect(adaptedResumeStorage.isCached('different', 'def456')).toBe(false);
    });

    test('returns false when job hash does not match', () => {
      adaptedResumeStorage.save(mockAdaptedResume);
      expect(adaptedResumeStorage.isCached('abc123', 'different')).toBe(false);
    });
  });

  describe('getStorageSize()', () => {
    test('returns 0 when no data exists', () => {
      expect(adaptedResumeStorage.getStorageSize()).toBe(0);
    });

    test('returns positive size when data exists', () => {
      adaptedResumeStorage.save(mockAdaptedResume);
      const size = adaptedResumeStorage.getStorageSize();
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('getStorageSizeFormatted()', () => {
    test('returns "0 B" when no data exists', () => {
      expect(adaptedResumeStorage.getStorageSizeFormatted()).toBe('0 B');
    });

    test('returns formatted size when data exists', () => {
      adaptedResumeStorage.save(mockAdaptedResume);
      const formatted = adaptedResumeStorage.getStorageSizeFormatted();
      expect(formatted).toMatch(/^\d+\.\d+ (B|KB|MB)$/);
    });
  });

  describe('clearAll()', () => {
    test('clears all MockMaster data', () => {
      localStorage.setItem('mockmaster_resume', 'resume data');
      localStorage.setItem('mockmaster_job_analysis', 'job data');
      adaptedResumeStorage.save(mockAdaptedResume);

      adaptedResumeStorage.clearAll();

      expect(localStorage.getItem('mockmaster_resume')).toBeNull();
      expect(localStorage.getItem('mockmaster_job_analysis')).toBeNull();
      expect(localStorage.getItem('mockmaster_adapted_resume')).toBeNull();
    });
  });
});

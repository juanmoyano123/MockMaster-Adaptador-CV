/**
 * Unit tests for localStorage resume storage
 * Feature: F-002
 *
 * To run: npm test __tests__/storage.test.ts
 */

import { resumeStorage } from '../lib/storage';
import { ResumeData } from '../lib/types';

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
  writable: true,
});

describe('ResumeStorage', () => {
  const mockResume: ResumeData = {
    name: 'test_resume.pdf',
    original_text: 'John Doe\njohn@example.com\nSoftware Engineer',
    parsed_content: {
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      experience: [
        {
          company: 'Tech Corp',
          title: 'Software Engineer',
          dates: '2020-Present',
          bullets: ['Built apps', 'Led team'],
        },
      ],
      education: [
        {
          school: 'MIT',
          degree: 'BS Computer Science',
          year: '2020',
        },
      ],
      skills: ['JavaScript', 'Python', 'React'],
    },
    uploaded_at: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveResume', () => {
    test('saves resume to localStorage', () => {
      resumeStorage.saveResume(mockResume);

      const stored = localStorage.getItem('mockmaster_resume');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.name).toBe(mockResume.name);
      expect(parsed.parsed_content.contact.email).toBe('john@example.com');
    });

    test('overwrites existing resume', () => {
      resumeStorage.saveResume(mockResume);

      const updatedResume = { ...mockResume, name: 'updated_resume.pdf' };
      resumeStorage.saveResume(updatedResume);

      const stored = localStorage.getItem('mockmaster_resume');
      const parsed = JSON.parse(stored!);
      expect(parsed.name).toBe('updated_resume.pdf');
    });
  });

  describe('getResume', () => {
    test('retrieves resume from localStorage', () => {
      resumeStorage.saveResume(mockResume);

      const retrieved = resumeStorage.getResume();
      expect(retrieved).toBeTruthy();
      expect(retrieved?.name).toBe(mockResume.name);
      expect(retrieved?.parsed_content.contact.name).toBe('John Doe');
    });

    test('returns null when no resume exists', () => {
      const retrieved = resumeStorage.getResume();
      expect(retrieved).toBeNull();
    });

    test('returns null for corrupted JSON', () => {
      localStorage.setItem('mockmaster_resume', 'invalid json {');

      const retrieved = resumeStorage.getResume();
      expect(retrieved).toBeNull();
    });

    test('returns null for invalid data structure', () => {
      localStorage.setItem('mockmaster_resume', JSON.stringify({ foo: 'bar' }));

      const retrieved = resumeStorage.getResume();
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteResume', () => {
    test('removes resume from localStorage', () => {
      resumeStorage.saveResume(mockResume);
      expect(localStorage.getItem('mockmaster_resume')).toBeTruthy();

      resumeStorage.deleteResume();
      expect(localStorage.getItem('mockmaster_resume')).toBeNull();
    });

    test('does not throw when deleting non-existent resume', () => {
      expect(() => {
        resumeStorage.deleteResume();
      }).not.toThrow();
    });
  });

  describe('hasResume', () => {
    test('returns true when resume exists', () => {
      resumeStorage.saveResume(mockResume);
      expect(resumeStorage.hasResume()).toBe(true);
    });

    test('returns false when no resume exists', () => {
      expect(resumeStorage.hasResume()).toBe(false);
    });

    test('returns false for corrupted data', () => {
      localStorage.setItem('mockmaster_resume', 'invalid');
      expect(resumeStorage.hasResume()).toBe(false);
    });
  });

  describe('getStorageSize', () => {
    test('returns 0 when no resume exists', () => {
      expect(resumeStorage.getStorageSize()).toBe(0);
    });

    test('returns approximate size in bytes', () => {
      resumeStorage.saveResume(mockResume);

      const size = resumeStorage.getStorageSize();
      expect(size).toBeGreaterThan(0);

      // Each character is 2 bytes in UTF-16
      const json = JSON.stringify(mockResume);
      expect(size).toBe(json.length * 2);
    });
  });

  describe('getStorageSizeFormatted', () => {
    test('formats bytes correctly', () => {
      resumeStorage.saveResume(mockResume);

      const formatted = resumeStorage.getStorageSizeFormatted();
      expect(formatted).toMatch(/\d+\.\d+ (B|KB|MB)/);
    });

    test('returns "0 B" when no resume exists', () => {
      expect(resumeStorage.getStorageSizeFormatted()).toBe('0 B');
    });
  });

  describe('shouldWarnStorageSize', () => {
    test('returns false for small resumes', () => {
      resumeStorage.saveResume(mockResume);
      expect(resumeStorage.shouldWarnStorageSize()).toBe(false);
    });

    test('returns true for large resumes', () => {
      // Create a large resume (over 3MB)
      const largeText = 'A'.repeat(2 * 1024 * 1024); // 2MB of text
      const largeResume = { ...mockResume, original_text: largeText };

      resumeStorage.saveResume(largeResume);
      expect(resumeStorage.shouldWarnStorageSize()).toBe(true);
    });
  });
});

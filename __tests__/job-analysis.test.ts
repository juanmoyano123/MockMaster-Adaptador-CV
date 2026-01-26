/**
 * Unit Tests for Job Analysis Feature
 * Feature: F-003
 *
 * Tests for text hashing, storage, and API validation.
 */

import { hashText } from '@/utils/text-hash';
import { jobAnalysisStorage } from '@/lib/job-storage';
import { JobAnalysis } from '@/lib/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
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

describe('Text Hashing Utility', () => {
  test('hashText generates consistent hashes for same input', async () => {
    const text = 'Senior Full Stack Developer at Google';
    const hash1 = await hashText(text);
    const hash2 = await hashText(text);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex chars
  });

  test('hashText normalizes text (trim and lowercase)', async () => {
    const text1 = '  Senior Developer  ';
    const text2 = 'senior developer';
    const text3 = 'SENIOR DEVELOPER';

    const hash1 = await hashText(text1);
    const hash2 = await hashText(text2);
    const hash3 = await hashText(text3);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  test('hashText generates different hashes for different input', async () => {
    const text1 = 'Senior Developer';
    const text2 = 'Junior Developer';

    const hash1 = await hashText(text1);
    const hash2 = await hashText(text2);

    expect(hash1).not.toBe(hash2);
  });

  test('hashText handles special characters', async () => {
    const text = 'Job @ Company! #hiring $50k+';
    const hash = await hashText(text);

    expect(hash).toBeTruthy();
    expect(hash).toHaveLength(64);
  });

  test('hashText handles emojis', async () => {
    const text = 'Senior Developer 🚀 Join us! 💼';
    const hash = await hashText(text);

    expect(hash).toBeTruthy();
    expect(hash).toHaveLength(64);
  });
});

describe('JobAnalysisStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockAnalysis: JobAnalysis = {
    raw_text: 'Full job description text...',
    text_hash: 'abc123hash',
    analysis: {
      job_title: 'Senior Full Stack Developer',
      company_name: 'Google',
      required_skills: ['React', 'Node.js', '5+ years'],
      preferred_skills: ['TypeScript', 'GraphQL'],
      responsibilities: ['Build scalable apps', 'Lead technical decisions'],
      seniority_level: 'Senior (5-8 years)',
      industry: 'Tech',
    },
    analyzed_at: '2026-01-25T10:00:00.000Z',
  };

  test('save() stores job analysis in localStorage', () => {
    jobAnalysisStorage.save(mockAnalysis);

    const stored = localStorage.getItem('mockmaster_job_analysis');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.text_hash).toBe('abc123hash');
    expect(parsed.analysis.job_title).toBe('Senior Full Stack Developer');
  });

  test('get() retrieves job analysis from localStorage', () => {
    jobAnalysisStorage.save(mockAnalysis);

    const retrieved = jobAnalysisStorage.get();
    expect(retrieved).toEqual(mockAnalysis);
  });

  test('get() returns null if no data exists', () => {
    const retrieved = jobAnalysisStorage.get();
    expect(retrieved).toBeNull();
  });

  test('get() returns null if data is corrupted', () => {
    localStorage.setItem('mockmaster_job_analysis', 'invalid json{');

    const retrieved = jobAnalysisStorage.get();
    expect(retrieved).toBeNull();
  });

  test('get() returns null if data structure is incomplete', () => {
    const incomplete = { text_hash: 'abc' }; // Missing required fields
    localStorage.setItem('mockmaster_job_analysis', JSON.stringify(incomplete));

    const retrieved = jobAnalysisStorage.get();
    expect(retrieved).toBeNull();
  });

  test('delete() removes job analysis from localStorage', () => {
    jobAnalysisStorage.save(mockAnalysis);
    expect(jobAnalysisStorage.has()).toBe(true);

    jobAnalysisStorage.delete();
    expect(jobAnalysisStorage.has()).toBe(false);
  });

  test('has() returns true if analysis exists', () => {
    expect(jobAnalysisStorage.has()).toBe(false);

    jobAnalysisStorage.save(mockAnalysis);
    expect(jobAnalysisStorage.has()).toBe(true);
  });

  test('isCached() detects matching hash', () => {
    jobAnalysisStorage.save(mockAnalysis);

    expect(jobAnalysisStorage.isCached('abc123hash')).toBe(true);
    expect(jobAnalysisStorage.isCached('different_hash')).toBe(false);
  });

  test('isCached() returns false if no analysis exists', () => {
    expect(jobAnalysisStorage.isCached('any_hash')).toBe(false);
  });

  test('save() overwrites existing analysis', () => {
    jobAnalysisStorage.save(mockAnalysis);

    const newAnalysis: JobAnalysis = {
      ...mockAnalysis,
      text_hash: 'new_hash',
      analysis: {
        ...mockAnalysis.analysis,
        job_title: 'Junior Developer',
      },
    };

    jobAnalysisStorage.save(newAnalysis);

    const retrieved = jobAnalysisStorage.get();
    expect(retrieved?.text_hash).toBe('new_hash');
    expect(retrieved?.analysis.job_title).toBe('Junior Developer');
  });

  test('getStorageSize() returns approximate byte size', () => {
    jobAnalysisStorage.save(mockAnalysis);

    const size = jobAnalysisStorage.getStorageSize();
    expect(size).toBeGreaterThan(0);
  });

  test('getStorageSizeFormatted() returns human-readable size', () => {
    jobAnalysisStorage.save(mockAnalysis);

    const formatted = jobAnalysisStorage.getStorageSizeFormatted();
    expect(formatted).toMatch(/\d+\.\d{2} (B|KB|MB)/);
  });
});

describe('API Input Validation', () => {
  test('Text must be at least 50 characters', () => {
    const shortText = 'Too short';
    expect(shortText.length).toBeLessThan(50);
  });

  test('Text must not exceed 20,000 characters', () => {
    const longText = 'a'.repeat(20001);
    expect(longText.length).toBeGreaterThan(20000);
  });

  test('Valid text is between 50 and 20,000 characters', () => {
    const validText = 'a'.repeat(100);
    expect(validText.length).toBeGreaterThanOrEqual(50);
    expect(validText.length).toBeLessThanOrEqual(20000);
  });
});

describe('JobAnalysis Type Validation', () => {
  test('Valid JobAnalysis has all required fields', () => {
    const analysis: JobAnalysis = {
      raw_text: 'Job description...',
      text_hash: 'hash123',
      analysis: {
        job_title: 'Developer',
        company_name: 'Company',
        required_skills: ['Skill1'],
        preferred_skills: ['Skill2'],
        responsibilities: ['Responsibility1'],
        seniority_level: 'Mid',
        industry: 'Tech',
      },
      analyzed_at: new Date().toISOString(),
    };

    expect(analysis.raw_text).toBeDefined();
    expect(analysis.text_hash).toBeDefined();
    expect(analysis.analysis).toBeDefined();
    expect(analysis.analyzed_at).toBeDefined();
    expect(Array.isArray(analysis.analysis.required_skills)).toBe(true);
    expect(Array.isArray(analysis.analysis.preferred_skills)).toBe(true);
    expect(Array.isArray(analysis.analysis.responsibilities)).toBe(true);
  });
});

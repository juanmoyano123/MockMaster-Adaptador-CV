/**
 * Unit Tests: Anti-Hallucination Validation
 * Feature: F-004
 *
 * Tests validation logic to prevent AI from inventing content
 */

import { validateNoHallucination, simpleHash } from '@/lib/validation';
import { ResumeData, AdaptedResume } from '@/lib/types';

describe('validateNoHallucination', () => {
  const mockOriginalResume: ResumeData = {
    name: 'resume.pdf',
    original_text: 'Resume text...',
    parsed_content: {
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
      },
      summary: 'Software engineer with 5 years experience.',
      experience: [
        {
          company: 'Tech Corp',
          title: 'Senior Engineer',
          dates: '2020-Present',
          bullets: ['Led team', 'Built systems'],
        },
        {
          company: 'StartupXYZ',
          title: 'Junior Developer',
          dates: '2018-2020',
          bullets: ['Developed features', 'Fixed bugs'],
        },
      ],
      education: [
        {
          school: 'State University',
          degree: 'BS Computer Science',
          year: '2018',
        },
      ],
      skills: ['JavaScript', 'Python', 'React'],
    },
    uploaded_at: '2026-01-25T10:00:00.000Z',
  };

  const createValidAdaptation = (): AdaptedResume => ({
    original_resume_hash: 'abc123',
    job_analysis_hash: 'def456',
    adapted_content: {
      contact: { ...mockOriginalResume.parsed_content.contact },
      summary: 'Backend-focused engineer with 5 years building scalable systems.',
      experience: [
        {
          company: 'Tech Corp',
          title: 'Senior Engineer',
          dates: '2020-Present',
          bullets: ['Led team of 5 engineers', 'Built scalable microservices'],
          relevance_score: 95,
        },
        {
          company: 'StartupXYZ',
          title: 'Junior Developer',
          dates: '2018-2020',
          bullets: ['Developed web features', 'Fixed critical bugs'],
          relevance_score: 70,
        },
      ],
      education: [...mockOriginalResume.parsed_content.education],
      skills: ['Python', 'JavaScript', 'React'], // Reordered
    },
    ats_score: 85,
    changes_summary: {
      skills_highlighted: 2,
      bullets_reformulated: 4,
      experiences_reordered: false,
    },
    adapted_at: '2026-01-25T11:00:00.000Z',
  });

  describe('Valid adaptations', () => {
    test('passes validation for legitimate adaptation', () => {
      const adapted = createValidAdaptation();
      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('allows experience reordering', () => {
      const adapted = createValidAdaptation();
      // Swap experience order
      const [first, second] = adapted.adapted_content.experience;
      adapted.adapted_content.experience = [second, first];

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('allows bullet point reformulation', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.experience[0].bullets = [
        'Led a high-performing team of 5 engineers',
        'Architected and built scalable microservices platform',
      ];

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('allows skill reordering', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.skills = ['React', 'Python', 'JavaScript'];

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('allows minor job title formatting differences', () => {
      const adapted = createValidAdaptation();
      // Minor formatting change
      adapted.adapted_content.experience[0].title = 'Senior Engineer';

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Hallucination detection', () => {
    test('fails when AI adds fake company', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.experience.push({
        company: 'FakeCompany Inc',
        title: 'Lead Developer',
        dates: '2015-2018',
        bullets: ['Did stuff'],
        relevance_score: 90,
      });

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('added fake experiences'));
      expect(result.errors).toContain(expect.stringContaining('FakeCompany Inc'));
    });

    test('fails when experience count exceeds original', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.experience = [
        ...adapted.adapted_content.experience,
        {
          company: 'Another Corp',
          title: 'Developer',
          dates: '2016-2018',
          bullets: ['Worked on things'],
          relevance_score: 80,
        },
      ];

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('added fake experiences'))).toBe(true);
    });

    test('fails when contact info is modified', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.contact.email = 'different@example.com';

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('contact information'));
    });

    test('fails when education is modified', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.education[0].degree = 'MS Computer Science';

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('education information'));
    });

    test('fails when job title is significantly changed', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.experience[0].title = 'Chief Technology Officer';

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('changed job title'))).toBe(true);
    });
  });

  describe('Score validation', () => {
    test('fails when ATS score is negative', () => {
      const adapted = createValidAdaptation();
      adapted.ats_score = -10;

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ATS score out of range'));
    });

    test('fails when ATS score exceeds 100', () => {
      const adapted = createValidAdaptation();
      adapted.ats_score = 150;

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ATS score out of range'));
    });

    test('fails when relevance score is negative', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.experience[0].relevance_score = -5;

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid relevance score'))).toBe(true);
    });

    test('fails when relevance score exceeds 100', () => {
      const adapted = createValidAdaptation();
      adapted.adapted_content.experience[0].relevance_score = 105;

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid relevance score'))).toBe(true);
    });
  });

  describe('Multiple errors', () => {
    test('reports all validation errors', () => {
      const adapted = createValidAdaptation();
      // Introduce multiple errors
      adapted.adapted_content.contact.email = 'different@example.com';
      adapted.adapted_content.education[0].degree = 'MS Computer Science';
      adapted.ats_score = 150;

      const result = validateNoHallucination(mockOriginalResume, adapted);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
      expect(result.errors).toContain(expect.stringContaining('contact information'));
      expect(result.errors).toContain(expect.stringContaining('education information'));
      expect(result.errors).toContain(expect.stringContaining('ATS score out of range'));
    });
  });
});

describe('simpleHash', () => {
  test('generates consistent hash for same input', () => {
    const text = 'This is a test resume text';
    const hash1 = simpleHash(text);
    const hash2 = simpleHash(text);

    expect(hash1).toBe(hash2);
  });

  test('generates different hashes for different inputs', () => {
    const text1 = 'Resume A';
    const text2 = 'Resume B';

    const hash1 = simpleHash(text1);
    const hash2 = simpleHash(text2);

    expect(hash1).not.toBe(hash2);
  });

  test('generates non-empty hash', () => {
    const hash = simpleHash('test');
    expect(hash).toBeTruthy();
    expect(hash.length).toBeGreaterThan(0);
  });

  test('handles empty string', () => {
    const hash = simpleHash('');
    expect(hash).toBe('0');
  });
});

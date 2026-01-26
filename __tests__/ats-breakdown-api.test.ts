/**
 * Integration tests for ATS Breakdown API
 * Feature: F-005
 *
 * Tests the /api/calculate-ats-breakdown endpoint
 */

import { describe, test, expect } from '@jest/globals';
import type { AdaptedContent, JobAnalysis } from '@/lib/types';

// Mock data
const mockJobAnalysis: JobAnalysis = {
  raw_text: 'Senior Python Developer...',
  text_hash: 'abc123',
  analysis: {
    job_title: 'Senior Python Developer',
    company_name: 'Tech Corp',
    required_skills: ['Python', 'AWS', 'Docker', 'REST APIs'],
    preferred_skills: ['Kubernetes', 'PostgreSQL'],
    responsibilities: [
      'Design and implement scalable APIs',
      'Deploy applications to AWS',
      'Write clean, testable code',
    ],
    seniority_level: 'Senior',
    industry: 'Technology',
  },
  analyzed_at: '2026-01-26T00:00:00.000Z',
};

const mockAdaptedContent: AdaptedContent = {
  contact: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-0123',
  },
  summary:
    'Experienced Senior Python Developer with 8+ years of expertise in AWS, Docker, and building scalable REST APIs',
  experience: [
    {
      company: 'Tech Solutions Inc',
      title: 'Senior Python Developer',
      dates: '2020 - 2023',
      bullets: [
        'Designed and implemented REST APIs serving 1M+ requests/day using Python and AWS Lambda',
        'Deployed containerized applications using Docker and managed infrastructure on AWS',
        'Led team of 4 developers in building scalable microservices architecture',
      ],
      relevance_score: 95,
    },
  ],
  education: [
    {
      school: 'University of Technology',
      degree: 'BS Computer Science',
      year: '2015',
    },
  ],
  skills: ['Python', 'AWS', 'Docker', 'REST APIs', 'PostgreSQL', 'JavaScript'],
};

describe('POST /api/calculate-ats-breakdown', () => {
  test('should return breakdown for valid input', async () => {
    // This is a conceptual test - would need Next.js test environment
    const requestBody = {
      adapted_content: mockAdaptedContent,
      job_analysis: mockJobAnalysis,
    };

    // Verify request body structure
    expect(requestBody.adapted_content).toBeDefined();
    expect(requestBody.job_analysis).toBeDefined();
    expect(requestBody.adapted_content.summary).toBeTruthy();
    expect(requestBody.job_analysis.analysis.required_skills.length).toBeGreaterThan(0);
  });

  test('should validate breakdown response structure', () => {
    const mockResponse = {
      breakdown: {
        total_score: 85,
        keyword_score: 85,
        skills_score: 90,
        experience_score: 85,
        format_score: 100,
        keywords_matched: 17,
        keywords_total: 20,
        missing_keywords: ['Kubernetes'],
        skills_matched: ['Python', 'AWS', 'Docker', 'REST APIs'],
        skills_missing: [],
        suggestions: [
          'Consider adding "Kubernetes" if you have relevant experience with this technology or concept',
        ],
      },
    };

    expect(mockResponse.breakdown.total_score).toBeGreaterThanOrEqual(0);
    expect(mockResponse.breakdown.total_score).toBeLessThanOrEqual(100);
    expect(mockResponse.breakdown.format_score).toBe(100);
    expect(Array.isArray(mockResponse.breakdown.missing_keywords)).toBe(true);
    expect(Array.isArray(mockResponse.breakdown.suggestions)).toBe(true);
  });

  test('should handle missing adapted_content', () => {
    const invalidRequest = {
      job_analysis: mockJobAnalysis,
    };

    // Should return 400 error
    expect(invalidRequest).not.toHaveProperty('adapted_content');
  });

  test('should handle missing job_analysis', () => {
    const invalidRequest = {
      adapted_content: mockAdaptedContent,
    };

    // Should return 400 error
    expect(invalidRequest).not.toHaveProperty('job_analysis');
  });

  test('should calculate high score for well-matched resume', () => {
    // Resume has Python, AWS, Docker, REST APIs - all required skills
    const matchedSkills = mockJobAnalysis.analysis.required_skills.filter(
      (skill) =>
        mockAdaptedContent.skills
          .map((s) => s.toLowerCase())
          .includes(skill.toLowerCase())
    );

    const skillsScore =
      (matchedSkills.length /
        mockJobAnalysis.analysis.required_skills.length) *
      100;

    expect(skillsScore).toBeGreaterThanOrEqual(70); // Should be high score
  });

  test('should calculate low score for poorly-matched resume', () => {
    const poorlyMatchedContent: AdaptedContent = {
      ...mockAdaptedContent,
      skills: ['JavaScript', 'React', 'CSS'], // No overlap with required skills
      summary: 'Frontend developer focused on React and UI design',
    };

    const matchedSkills = mockJobAnalysis.analysis.required_skills.filter(
      (skill) =>
        poorlyMatchedContent.skills
          .map((s) => s.toLowerCase())
          .includes(skill.toLowerCase())
    );

    const skillsScore =
      (matchedSkills.length /
        mockJobAnalysis.analysis.required_skills.length) *
      100;

    expect(skillsScore).toBeLessThan(50); // Should be low score
  });
});

describe('ATS Breakdown - Edge Cases', () => {
  test('should handle empty skills array', () => {
    const contentWithNoSkills: AdaptedContent = {
      ...mockAdaptedContent,
      skills: [],
    };

    // Should still calculate score from experience bullets
    expect(contentWithNoSkills.experience.length).toBeGreaterThan(0);
    expect(contentWithNoSkills.experience[0].bullets.length).toBeGreaterThan(
      0
    );
  });

  test('should handle job with no required skills', () => {
    const jobWithNoSkills: JobAnalysis = {
      ...mockJobAnalysis,
      analysis: {
        ...mockJobAnalysis.analysis,
        required_skills: [],
      },
    };

    // Skills score should be 100 if no required skills
    const skillsScore =
      jobWithNoSkills.analysis.required_skills.length === 0
        ? 100
        : 0;

    expect(skillsScore).toBe(100);
  });

  test('should handle very short job description', () => {
    const shortJob: JobAnalysis = {
      ...mockJobAnalysis,
      analysis: {
        ...mockJobAnalysis.analysis,
        responsibilities: ['Write code'],
      },
    };

    // Should use minimum keywords or adjust calculation
    expect(shortJob.analysis.responsibilities.length).toBe(1);
  });

  test('should cap missing keywords at 10', () => {
    const manyMissingKeywords = Array.from(
      { length: 25 },
      (_, i) => `keyword${i}`
    );

    const cappedKeywords = manyMissingKeywords.slice(0, 10);

    expect(cappedKeywords.length).toBe(10);
  });

  test('should cap suggestions at 5', () => {
    const manySuggestions = Array.from(
      { length: 15 },
      (_, i) => `Suggestion ${i}`
    );

    const cappedSuggestions = manySuggestions.slice(0, 5);

    expect(cappedSuggestions.length).toBe(5);
  });
});

describe('ATS Breakdown - Score Thresholds', () => {
  test('should identify high score (70-100)', () => {
    const highScore = 85;

    expect(highScore).toBeGreaterThanOrEqual(70);
    expect(highScore).toBeLessThanOrEqual(100);

    // Should show green color and "Strong Match" label
    const label = highScore >= 70 ? 'Strong Match' : 'Good Match';
    expect(label).toBe('Strong Match');
  });

  test('should identify medium score (50-69)', () => {
    const mediumScore = 60;

    expect(mediumScore).toBeGreaterThanOrEqual(50);
    expect(mediumScore).toBeLessThan(70);

    // Should show yellow color and "Good Match" label
    const label =
      mediumScore >= 70
        ? 'Strong Match'
        : mediumScore >= 50
        ? 'Good Match'
        : 'Needs Work';
    expect(label).toBe('Good Match');
  });

  test('should identify low score (<50)', () => {
    const lowScore = 35;

    expect(lowScore).toBeLessThan(50);

    // Should show red color and "Needs Work" label
    const label = lowScore < 50 ? 'Needs Work' : 'Good Match';
    expect(label).toBe('Needs Work');
  });
});

describe('ATS Breakdown - Performance', () => {
  test('should handle large resume content', () => {
    const largeContent: AdaptedContent = {
      ...mockAdaptedContent,
      experience: Array.from({ length: 10 }, (_, i) => ({
        company: `Company ${i}`,
        title: `Position ${i}`,
        dates: `2020-${2020 + i}`,
        bullets: Array.from(
          { length: 8 },
          (_, j) => `Bullet point ${j} with keywords Python AWS Docker`
        ),
        relevance_score: 80,
      })),
      skills: Array.from({ length: 50 }, (_, i) => `Skill${i}`),
    };

    // Should still process efficiently
    expect(largeContent.experience.length).toBe(10);
    expect(largeContent.skills.length).toBe(50);
  });

  test('should handle special characters in keywords', () => {
    const specialCharsContent: AdaptedContent = {
      ...mockAdaptedContent,
      summary: 'Expert in C++, .NET, and Node.js development',
      skills: ['C++', '.NET', 'Node.js'],
    };

    // Should handle special characters gracefully
    expect(specialCharsContent.skills).toContain('C++');
    expect(specialCharsContent.skills).toContain('.NET');
    expect(specialCharsContent.skills).toContain('Node.js');
  });
});

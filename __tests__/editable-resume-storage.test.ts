/**
 * Unit Tests for Editable Resume Storage
 * Feature: F-012 - Edit Adapted Resume Before Export
 *
 * Tests for the edit-related storage methods
 */

import { adaptedResumeStorage } from '@/lib/adapted-resume-storage';
import { AdaptedResume, AdaptedContent } from '@/lib/types';

describe('Editable Resume Storage (F-012)', () => {
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

  // Replace global localStorage
  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  // Helper: Create mock adapted content
  const createMockAdaptedContent = (): AdaptedContent => ({
    contact: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      linkedin: 'linkedin.com/in/johndoe',
      location: 'New York, NY',
    },
    summary: 'Experienced software engineer with 5+ years in web development.',
    experience: [
      {
        company: 'Tech Corp',
        title: 'Senior Engineer',
        dates: '2020 - Present',
        bullets: [
          'Led development of microservices architecture',
          'Mentored junior developers',
        ],
        relevance_score: 95,
      },
    ],
    education: [
      {
        school: 'University of Technology',
        degree: 'BS Computer Science',
        year: '2018',
      },
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
  });

  // Helper: Create mock adapted resume
  const createMockAdaptedResume = (): AdaptedResume => ({
    original_resume_hash: 'hash123',
    job_analysis_hash: 'jobhash456',
    adapted_content: createMockAdaptedContent(),
    ats_score: 85,
    changes_summary: {
      skills_highlighted: 3,
      bullets_reformulated: 5,
      experiences_reordered: true,
    },
    adapted_at: new Date().toISOString(),
  });

  describe('saveEdited()', () => {
    it('should save edited content to localStorage', () => {
      const content = createMockAdaptedContent();
      const sections = ['summary'];

      adaptedResumeStorage.saveEdited(content, sections);

      const saved = localStorage.getItem('mockmaster_edited_resume');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.adapted_content).toEqual(content);
      expect(parsed.sections_edited).toEqual(sections);
      expect(parsed.last_edited).toBeTruthy();
    });

    it('should include timestamp when saving', () => {
      const content = createMockAdaptedContent();
      const beforeSave = new Date().toISOString();

      adaptedResumeStorage.saveEdited(content, ['summary']);

      const saved = adaptedResumeStorage.getEdited();
      expect(saved?.last_edited).toBeTruthy();
      expect(new Date(saved!.last_edited).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeSave).getTime()
      );
    });

    it('should track multiple edited sections', () => {
      const content = createMockAdaptedContent();
      const sections = ['summary', 'experience', 'skills'];

      adaptedResumeStorage.saveEdited(content, sections);

      const saved = adaptedResumeStorage.getEdited();
      expect(saved?.sections_edited).toEqual(sections);
    });
  });

  describe('getEdited()', () => {
    it('should return null when no edits exist', () => {
      const edited = adaptedResumeStorage.getEdited();
      expect(edited).toBeNull();
    });

    it('should return edited content when it exists', () => {
      const content = createMockAdaptedContent();
      adaptedResumeStorage.saveEdited(content, ['summary']);

      const edited = adaptedResumeStorage.getEdited();
      expect(edited).toBeTruthy();
      expect(edited?.adapted_content).toEqual(content);
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('mockmaster_edited_resume', 'invalid json');
      const edited = adaptedResumeStorage.getEdited();
      expect(edited).toBeNull();
    });
  });

  describe('getContentForExport()', () => {
    it('should return edited version when edits exist', () => {
      const originalContent = createMockAdaptedContent();
      const editedContent = {
        ...originalContent,
        summary: 'EDITED SUMMARY',
      };

      // Save original
      const originalResume = createMockAdaptedResume();
      adaptedResumeStorage.save(originalResume);

      // Save edited version
      adaptedResumeStorage.saveEdited(editedContent, ['summary']);

      // Should return edited
      const content = adaptedResumeStorage.getContentForExport();
      expect(content?.summary).toBe('EDITED SUMMARY');
    });

    it('should return original when no edits exist', () => {
      const originalResume = createMockAdaptedResume();
      adaptedResumeStorage.save(originalResume);

      const content = adaptedResumeStorage.getContentForExport();
      expect(content).toEqual(originalResume.adapted_content);
    });

    it('should return null when neither original nor edited exists', () => {
      const content = adaptedResumeStorage.getContentForExport();
      expect(content).toBeNull();
    });
  });

  describe('hasEdits()', () => {
    it('should return false when no edits exist', () => {
      expect(adaptedResumeStorage.hasEdits()).toBe(false);
    });

    it('should return true when edits exist', () => {
      const content = createMockAdaptedContent();
      adaptedResumeStorage.saveEdited(content, ['summary']);
      expect(adaptedResumeStorage.hasEdits()).toBe(true);
    });
  });

  describe('deleteEdited()', () => {
    it('should delete edited content from localStorage', () => {
      const content = createMockAdaptedContent();
      adaptedResumeStorage.saveEdited(content, ['summary']);

      expect(adaptedResumeStorage.hasEdits()).toBe(true);

      adaptedResumeStorage.deleteEdited();

      expect(adaptedResumeStorage.hasEdits()).toBe(false);
      expect(localStorage.getItem('mockmaster_edited_resume')).toBeNull();
    });

    it('should not affect original adapted resume', () => {
      const originalResume = createMockAdaptedResume();
      adaptedResumeStorage.save(originalResume);

      const editedContent = {
        ...originalResume.adapted_content,
        summary: 'EDITED',
      };
      adaptedResumeStorage.saveEdited(editedContent, ['summary']);

      adaptedResumeStorage.deleteEdited();

      // Original should still exist
      const original = adaptedResumeStorage.get();
      expect(original).toBeTruthy();
      expect(original?.adapted_content.summary).not.toBe('EDITED');
    });
  });

  describe('resetToAIVersion()', () => {
    it('should be an alias for deleteEdited()', () => {
      const content = createMockAdaptedContent();
      adaptedResumeStorage.saveEdited(content, ['summary']);

      expect(adaptedResumeStorage.hasEdits()).toBe(true);

      adaptedResumeStorage.resetToAIVersion();

      expect(adaptedResumeStorage.hasEdits()).toBe(false);
    });
  });

  describe('clearAll()', () => {
    it('should clear both original and edited versions', () => {
      const originalResume = createMockAdaptedResume();
      adaptedResumeStorage.save(originalResume);

      const editedContent = {
        ...originalResume.adapted_content,
        summary: 'EDITED',
      };
      adaptedResumeStorage.saveEdited(editedContent, ['summary']);

      adaptedResumeStorage.clearAll();

      expect(adaptedResumeStorage.get()).toBeNull();
      expect(adaptedResumeStorage.hasEdits()).toBe(false);
      expect(localStorage.getItem('mockmaster_resume')).toBeNull();
      expect(localStorage.getItem('mockmaster_job_analysis')).toBeNull();
      expect(localStorage.getItem('mockmaster_adapted_resume')).toBeNull();
      expect(localStorage.getItem('mockmaster_edited_resume')).toBeNull();
    });
  });

  describe('Integration: Full Edit Flow', () => {
    it('should handle complete edit, reset, re-edit workflow', () => {
      // 1. Save original
      const originalResume = createMockAdaptedResume();
      adaptedResumeStorage.save(originalResume);

      // 2. Edit summary
      const edited1 = {
        ...originalResume.adapted_content,
        summary: 'First edit',
      };
      adaptedResumeStorage.saveEdited(edited1, ['summary']);
      expect(adaptedResumeStorage.getContentForExport()?.summary).toBe('First edit');

      // 3. Reset to AI version
      adaptedResumeStorage.resetToAIVersion();
      expect(adaptedResumeStorage.getContentForExport()?.summary).toBe(
        originalResume.adapted_content.summary
      );

      // 4. Edit again
      const edited2 = {
        ...originalResume.adapted_content,
        summary: 'Second edit',
      };
      adaptedResumeStorage.saveEdited(edited2, ['summary']);
      expect(adaptedResumeStorage.getContentForExport()?.summary).toBe('Second edit');
    });

    it('should preserve edited skills when editing summary', () => {
      const originalResume = createMockAdaptedResume();
      adaptedResumeStorage.save(originalResume);

      // Edit skills
      const withEditedSkills = {
        ...originalResume.adapted_content,
        skills: [...originalResume.adapted_content.skills, 'Python'],
      };
      adaptedResumeStorage.saveEdited(withEditedSkills, ['skills']);

      // Edit summary
      const withEditedSummary = {
        ...withEditedSkills,
        summary: 'New summary',
      };
      adaptedResumeStorage.saveEdited(withEditedSummary, ['skills', 'summary']);

      // Both changes should be preserved
      const final = adaptedResumeStorage.getContentForExport();
      expect(final?.summary).toBe('New summary');
      expect(final?.skills).toContain('Python');
    });
  });
});

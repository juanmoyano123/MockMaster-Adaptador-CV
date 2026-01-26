/**
 * Unit Tests for PDF Generation
 * Feature: F-006
 */

import { generatePDFFilename, validatePDFRequest } from '@/lib/pdf-utils';
import {
  renderTemplateToHTML,
  generateCleanTemplateHTML,
  generateModernTemplateHTML,
  generateCompactTemplateHTML,
} from '@/lib/pdf-templates-html';
import { AdaptedContent, TemplateType } from '@/lib/types';

describe('PDF Utils', () => {
  describe('generatePDFFilename', () => {
    it('should generate filename with company name and date', () => {
      const filename = generatePDFFilename('TechCorp');
      expect(filename).toMatch(/^Resume_TechCorp_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should sanitize special characters in company name', () => {
      const filename = generatePDFFilename('Tech@Corp! Inc.');
      expect(filename).toMatch(/^Resume_TechCorp_Inc_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should replace spaces with underscores', () => {
      const filename = generatePDFFilename('Big Tech Company');
      expect(filename).toMatch(/^Resume_Big_Tech_Company_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should limit company name length', () => {
      const longName = 'A'.repeat(100);
      const filename = generatePDFFilename(longName);
      expect(filename.length).toBeLessThan(100);
    });
  });

  describe('validatePDFRequest', () => {
    const validRequest = {
      adapted_content: {
        contact: { name: 'John Doe', email: 'john@example.com' },
        summary: 'Test summary',
        experience: [],
        education: [],
        skills: [],
      },
      template: 'modern',
      company_name: 'TechCorp',
    };

    it('should validate valid request', () => {
      const result = validatePDFRequest(validRequest);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject request with missing adapted_content', () => {
      const invalid = { ...validRequest, adapted_content: undefined };
      const result = validatePDFRequest(invalid);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('adapted_content');
    });

    it('should reject request with missing template', () => {
      const invalid = { ...validRequest, template: undefined };
      const result = validatePDFRequest(invalid);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('template');
    });

    it('should reject request with missing company_name', () => {
      const invalid = { ...validRequest, company_name: undefined };
      const result = validatePDFRequest(invalid);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('company_name');
    });

    it('should reject request with invalid template', () => {
      const invalid = { ...validRequest, template: 'invalid' };
      const result = validatePDFRequest(invalid);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid template');
    });

    it('should reject non-object request', () => {
      const result = validatePDFRequest(null);
      expect(result.valid).toBe(false);
    });
  });
});

describe('PDF Template HTML Generation', () => {
  const mockContent: AdaptedContent = {
    contact: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      linkedin: 'linkedin.com/in/johndoe',
      location: 'San Francisco, CA',
    },
    summary: 'Experienced software engineer with 5+ years of expertise.',
    experience: [
      {
        company: 'TechCorp',
        title: 'Senior Software Engineer',
        dates: '2020-2024',
        bullets: [
          'Led team of 5 engineers',
          'Improved performance by 50%',
        ],
        relevance_score: 95,
      },
    ],
    education: [
      {
        school: 'MIT',
        degree: 'BS Computer Science',
        year: '2019',
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  };

  describe('generateCleanTemplateHTML', () => {
    it('should generate valid HTML', () => {
      const html = generateCleanTemplateHTML(mockContent);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
    });

    it('should include contact information', () => {
      const html = generateCleanTemplateHTML(mockContent);
      expect(html).toContain('John Doe');
      expect(html).toContain('john@example.com');
      expect(html).toContain('555-1234');
    });

    it('should include professional summary', () => {
      const html = generateCleanTemplateHTML(mockContent);
      expect(html).toContain('Professional Summary');
      expect(html).toContain('Experienced software engineer');
    });

    it('should include work experience', () => {
      const html = generateCleanTemplateHTML(mockContent);
      expect(html).toContain('Work Experience');
      expect(html).toContain('TechCorp');
      expect(html).toContain('Senior Software Engineer');
      expect(html).toContain('Led team of 5 engineers');
    });

    it('should include education', () => {
      const html = generateCleanTemplateHTML(mockContent);
      expect(html).toContain('Education');
      expect(html).toContain('MIT');
      expect(html).toContain('BS Computer Science');
    });

    it('should include skills', () => {
      const html = generateCleanTemplateHTML(mockContent);
      expect(html).toContain('Skills');
      expect(html).toContain('JavaScript');
      expect(html).toContain('TypeScript');
    });

    it('should escape HTML special characters', () => {
      const contentWithSpecialChars = {
        ...mockContent,
        contact: { ...mockContent.contact, name: 'John <script>alert("XSS")</script> Doe' },
      };
      const html = generateCleanTemplateHTML(contentWithSpecialChars);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should use Georgia font family', () => {
      const html = generateCleanTemplateHTML(mockContent);
      expect(html).toContain('Georgia');
    });

    it('should use black color only', () => {
      const html = generateCleanTemplateHTML(mockContent);
      expect(html).toContain('#000');
      expect(html).not.toContain('#1E3A5F'); // Modern template blue
    });
  });

  describe('generateModernTemplateHTML', () => {
    it('should generate valid HTML', () => {
      const html = generateModernTemplateHTML(mockContent);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should use Helvetica font family', () => {
      const html = generateModernTemplateHTML(mockContent);
      expect(html).toContain('Helvetica');
    });

    it('should use navy blue color for headings', () => {
      const html = generateModernTemplateHTML(mockContent);
      expect(html).toContain('#1E3A5F');
    });

    it('should include all content sections', () => {
      const html = generateModernTemplateHTML(mockContent);
      expect(html).toContain('John Doe');
      expect(html).toContain('Professional Summary');
      expect(html).toContain('Work Experience');
      expect(html).toContain('Education');
      expect(html).toContain('Skills');
    });
  });

  describe('generateCompactTemplateHTML', () => {
    it('should generate valid HTML', () => {
      const html = generateCompactTemplateHTML(mockContent);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should use Arial Narrow font family', () => {
      const html = generateCompactTemplateHTML(mockContent);
      expect(html).toContain('Arial Narrow');
    });

    it('should use smaller font sizes', () => {
      const html = generateCompactTemplateHTML(mockContent);
      expect(html).toContain('10pt'); // Compact uses 10pt vs 11pt
    });

    it('should include all content sections', () => {
      const html = generateCompactTemplateHTML(mockContent);
      expect(html).toContain('John Doe');
      expect(html).toContain('Professional Summary');
      expect(html).toContain('Work Experience');
      expect(html).toContain('Education');
      expect(html).toContain('Skills');
    });
  });

  describe('renderTemplateToHTML', () => {
    it('should render clean template', () => {
      const html = renderTemplateToHTML(mockContent, 'clean');
      expect(html).toContain('Georgia');
    });

    it('should render modern template', () => {
      const html = renderTemplateToHTML(mockContent, 'modern');
      expect(html).toContain('Helvetica');
    });

    it('should render compact template', () => {
      const html = renderTemplateToHTML(mockContent, 'compact');
      expect(html).toContain('Arial Narrow');
    });

    it('should throw error for invalid template', () => {
      expect(() => {
        renderTemplateToHTML(mockContent, 'invalid' as TemplateType);
      }).toThrow('Invalid template');
    });
  });

  describe('Template HTML Size', () => {
    it('should generate reasonable HTML size', () => {
      const html = renderTemplateToHTML(mockContent, 'modern');
      const sizeKB = Buffer.from(html).length / 1024;
      expect(sizeKB).toBeLessThan(50); // HTML should be small
    });
  });
});

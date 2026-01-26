/**
 * Unit tests for file validation utilities
 * Feature: F-002
 *
 * To run: npm test __tests__/file-validation.test.ts
 */

import { validateFile, validateTextLength, isSupportedExtension, getFileTypeName } from '../utils/file-validation';

describe('file-validation', () => {
  describe('validateFile', () => {
    test('accepts valid PDF file', () => {
      const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('accepts valid DOCX file', () => {
      const file = new File(['dummy'], 'resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    test('rejects file over 10MB', () => {
      // Create a large buffer (11MB)
      const largeBuffer = new ArrayBuffer(11 * 1024 * 1024);
      const file = new File([largeBuffer], 'large.pdf', { type: 'application/pdf' });

      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File too large');
      expect(result.errorCode).toBe('FILE_TOO_LARGE');
    });

    test('rejects invalid file type (.jpg)', () => {
      const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
      expect(result.errorCode).toBe('INVALID_TYPE');
    });

    test('rejects .xlsx spreadsheet', () => {
      const file = new File(['dummy'], 'data.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('INVALID_TYPE');
    });
  });

  describe('validateTextLength', () => {
    test('accepts text under 50KB', () => {
      const text = 'A'.repeat(1000); // 1KB
      const result = validateTextLength(text);
      expect(result.valid).toBe(true);
    });

    test('rejects text over 50KB', () => {
      const text = 'A'.repeat(51 * 1024); // 51KB
      const result = validateTextLength(text);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
      expect(result.errorCode).toBe('TEXT_TOO_LONG');
    });

    test('rejects empty text', () => {
      const result = validateTextLength('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
      expect(result.errorCode).toBe('INVALID_FORMAT');
    });

    test('accepts text at exactly 50KB', () => {
      const text = 'A'.repeat(50 * 1024); // Exactly 50KB
      const result = validateTextLength(text);
      expect(result.valid).toBe(true);
    });
  });

  describe('isSupportedExtension', () => {
    test('returns true for .pdf', () => {
      expect(isSupportedExtension('resume.pdf')).toBe(true);
    });

    test('returns true for .docx', () => {
      expect(isSupportedExtension('resume.docx')).toBe(true);
    });

    test('returns true for .doc', () => {
      expect(isSupportedExtension('resume.doc')).toBe(true);
    });

    test('returns false for .jpg', () => {
      expect(isSupportedExtension('photo.jpg')).toBe(false);
    });

    test('is case-insensitive', () => {
      expect(isSupportedExtension('Resume.PDF')).toBe(true);
      expect(isSupportedExtension('Resume.DOCX')).toBe(true);
    });
  });

  describe('getFileTypeName', () => {
    test('returns "PDF" for PDF files', () => {
      const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
      expect(getFileTypeName(file)).toBe('PDF');
    });

    test('returns "Word Document" for DOCX files', () => {
      const file = new File(['dummy'], 'resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      expect(getFileTypeName(file)).toBe('Word Document');
    });

    test('returns "Word Document (Legacy)" for DOC files', () => {
      const file = new File(['dummy'], 'resume.doc', { type: 'application/msword' });
      expect(getFileTypeName(file)).toBe('Word Document (Legacy)');
    });

    test('returns "Unknown" for unsupported types', () => {
      const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
      expect(getFileTypeName(file)).toBe('Unknown');
    });
  });
});

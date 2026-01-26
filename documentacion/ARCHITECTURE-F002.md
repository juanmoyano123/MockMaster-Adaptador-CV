# ARCHITECTURE: F-002 - Resume Upload & Parsing (localStorage)

## 1. USER FLOW

### Flow 1: PDF Upload
1. User lands on home page with upload interface
2. User drags & drops PDF or clicks "Choose File"
3. Frontend validates file (type: PDF, size: <10MB)
4. Frontend reads file using FileReader API
5. Frontend extracts text using pdf-parse library
6. Frontend sends raw text to `/api/parse-resume` endpoint
7. Claude API structures the text into JSON format
8. Frontend displays ResumePreview with editable sections
9. User reviews/edits parsed content
10. User clicks "Save Resume"
11. Frontend stores to localStorage as `mockmaster_resume`
12. Success message displayed

### Flow 2: DOCX Upload
1. User clicks "Choose File" and selects .docx
2. Frontend validates file (type: DOCX, size: <10MB)
3. Frontend reads file using mammoth library
4. Frontend extracts plain text with preserved formatting
5. Rest of flow same as PDF (steps 6-12)

### Flow 3: Paste Text
1. User clicks "Paste Text Instead" tab
2. Text area appears
3. User pastes resume plain text
4. User clicks "Parse Resume"
5. Frontend sends text to `/api/parse-resume`
6. Rest of flow same as PDF (steps 7-12)

### Flow 4: Resume Already Exists
1. User returns to site
2. Frontend checks localStorage for `mockmaster_resume`
3. If exists, show "You have a resume saved" with preview
4. User can "Edit Resume" or "Upload New Resume"

## 2. DATABASE (localStorage)

### localStorage Schema
```typescript
// Key: 'mockmaster_resume'
// Value: JSON string of ResumeData

interface ResumeData {
  name: string;                // "John_Doe_Resume.pdf"
  original_text: string;        // Raw extracted text
  parsed_content: ParsedContent;
  uploaded_at: string;          // ISO 8601 timestamp
}

interface ParsedContent {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  location?: string;
}

interface ExperienceItem {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
}

interface EducationItem {
  school: string;
  degree: string;
  year: string;
}
```

### Storage Limits
- localStorage max: ~5-10MB (browser dependent)
- Resume text typically: 5-50KB
- Safe limit for MVP: 1 resume only
- Warning if text exceeds 500KB

## 3. API ENDPOINTS

### POST /api/parse-resume

**Purpose**: Use Claude API to structure raw resume text into JSON

**Request**:
```typescript
{
  text: string;  // Raw resume text (max 50KB)
}
```

**Response (Success - 200)**:
```typescript
{
  parsed_content: ParsedContent;
}
```

**Response (Error - 400)**:
```typescript
{
  error: string;
  code: 'TEXT_TOO_LONG' | 'INVALID_FORMAT' | 'PARSING_FAILED';
}
```

**Response (Error - 500)**:
```typescript
{
  error: string;
  code: 'CLAUDE_API_ERROR' | 'INTERNAL_ERROR';
}
```

**Claude API Prompt**:
```
You are a resume parser. Extract structured information from this resume text.

Return ONLY valid JSON (no markdown, no explanations) in this exact format:
{
  "contact": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "linkedin": "linkedin.com/in/username",
    "location": "City, State"
  },
  "summary": "Professional summary paragraph",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "dates": "Jan 2020 - Present",
      "bullets": [
        "Achievement bullet point 1",
        "Achievement bullet point 2"
      ]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Bachelor of Science in Computer Science",
      "year": "2020"
    }
  ],
  "skills": ["JavaScript", "Python", "React", "Node.js"]
}

Resume text:
{resume_text}
```

**Error Handling**:
- Rate limit exceeded: Return 429 with retry-after
- Claude API timeout: Return 500 with friendly message
- Invalid JSON from Claude: Retry once, then fail gracefully
- Text too long (>50KB): Return 400 before calling API

## 4. REACT COMPONENTS

### Component Hierarchy
```
HomePage (app/page.tsx)
├── ResumeUploadFlow
│   ├── ResumeUpload (if no resume exists)
│   │   ├── FileDropzone
│   │   ├── FileInput
│   │   └── PasteTextForm
│   └── ResumePreview (after upload or if resume exists)
│       ├── EditableContactSection
│       ├── EditableSummarySection
│       ├── EditableExperienceList
│       ├── EditableEducationList
│       └── EditableSkillsList
```

### Component: ResumeUploadFlow
**Location**: `components/ResumeUploadFlow.tsx`
**Purpose**: Orchestrates upload/preview logic
**State**:
```typescript
const [resumeData, setResumeData] = useState<ResumeData | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Component: ResumeUpload
**Location**: `components/ResumeUpload.tsx`
**Props**: None
**State**:
```typescript
const [dragActive, setDragActive] = useState(false);
const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
const [isProcessing, setIsProcessing] = useState(false);
```

**Methods**:
- `handleFileDrop(e: DragEvent)`: Handle drag & drop
- `handleFileSelect(e: ChangeEvent<HTMLInputElement>)`: Handle file input
- `processFile(file: File)`: Orchestrate file processing
- `handleTextPaste(text: string)`: Handle paste text mode

### Component: ResumePreview
**Location**: `components/ResumePreview.tsx`
**Props**:
```typescript
interface ResumePreviewProps {
  resumeData: ResumeData;
  onSave: (data: ResumeData) => void;
  onUploadNew: () => void;
}
```

**State**: Editable copy of resumeData

### Component: PasteTextForm
**Location**: `components/PasteTextForm.tsx`
**Props**:
```typescript
interface PasteTextFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}
```

## 5. LIBRARIES & SERVICES

### Service: resume-parser.ts
**Location**: `lib/resume-parser.ts`

**Functions**:
```typescript
// Parse PDF file to text
export async function parsePDF(file: File): Promise<string>

// Parse DOCX file to text
export async function parseDOCX(file: File): Promise<string>

// Call Claude API to structure text
export async function structureResumeWithAI(text: string): Promise<ParsedContent>
```

**Dependencies**:
- `pdf-parse`: PDF text extraction
- `mammoth`: DOCX text extraction

### Service: storage.ts
**Location**: `lib/storage.ts`

**Class**: `ResumeStorage`
```typescript
class ResumeStorage {
  private readonly STORAGE_KEY = 'mockmaster_resume';

  saveResume(resume: ResumeData): void
  getResume(): ResumeData | null
  deleteResume(): void
  hasResume(): boolean
  getStorageSize(): number  // bytes used
}

export const resumeStorage = new ResumeStorage();
```

**Error Handling**:
- QuotaExceededError: Clear old data, show error to user
- Invalid JSON: Log error, return null
- localStorage disabled: Show error, offer download JSON

### Utility: file-validation.ts
**Location**: `utils/file-validation.ts`

**Functions**:
```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'FILE_CORRUPTED';
}

export function validateFile(file: File): ValidationResult

export function validateTextLength(text: string): ValidationResult

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 50 * 1024; // 50KB
```

## 6. TESTS

### Unit Tests

**File**: `__tests__/file-validation.test.ts`
```typescript
describe('file-validation', () => {
  test('accepts valid PDF file');
  test('accepts valid DOCX file');
  test('rejects file over 10MB');
  test('rejects invalid file type (.jpg)');
  test('accepts text under 50KB');
  test('rejects text over 50KB');
});
```

**File**: `__tests__/storage.test.ts`
```typescript
describe('ResumeStorage', () => {
  beforeEach(() => localStorage.clear());

  test('saves resume to localStorage');
  test('retrieves resume from localStorage');
  test('returns null when no resume exists');
  test('deletes resume from localStorage');
  test('hasResume returns correct boolean');
  test('handles JSON parse errors gracefully');
  test('handles QuotaExceededError');
});
```

**File**: `__tests__/resume-parser.test.ts`
```typescript
describe('resume-parser', () => {
  test('parsePDF extracts text from valid PDF');
  test('parsePDF throws error for corrupted PDF');
  test('parseDOCX extracts text from valid DOCX');
  test('structureResumeWithAI calls API correctly', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ parsed_content: mockParsedContent })
    });

    const result = await structureResumeWithAI('test resume text');
    expect(result).toEqual(mockParsedContent);
  });
});
```

### Integration Tests

**File**: `__tests__/resume-upload-flow.integration.test.tsx`
```typescript
describe('Resume Upload Flow (Integration)', () => {
  test('Full PDF upload flow', async () => {
    // 1. Render component
    // 2. Upload PDF file
    // 3. Wait for parsing
    // 4. Verify preview shows
    // 5. Edit content
    // 6. Save to localStorage
    // 7. Verify localStorage contains data
    // 8. Reload component
    // 9. Verify resume still displayed
  });

  test('Full text paste flow', async () => {
    // Similar to above but with paste
  });

  test('Replace existing resume', async () => {
    // 1. Save resume
    // 2. Upload new resume
    // 3. Verify old resume replaced
  });
});
```

### API Route Tests

**File**: `__tests__/api/parse-resume.test.ts`
```typescript
describe('POST /api/parse-resume', () => {
  test('returns structured content for valid text');
  test('returns 400 for text exceeding 50KB');
  test('returns 500 when Claude API fails');
  test('retries once if Claude returns invalid JSON');
  test('handles Claude API timeout');
});
```

## 7. MANUAL TEST CHECKLIST

### Desktop Testing (Chrome, Firefox, Safari)

**PDF Upload**:
- [ ] Drag & drop PDF works
- [ ] Click to upload PDF works
- [ ] Loading indicator shows during processing
- [ ] Preview displays correctly after parsing
- [ ] Can edit all sections (contact, summary, experience, education, skills)
- [ ] Save button persists to localStorage
- [ ] Page reload shows saved resume

**DOCX Upload**:
- [ ] DOCX file processes correctly
- [ ] Bullet points preserved
- [ ] Formatting reasonably preserved

**Text Paste**:
- [ ] Can switch to paste mode
- [ ] Text area accepts paste
- [ ] Parse button triggers Claude API
- [ ] Results display correctly

**Error Handling**:
- [ ] Upload .jpg shows error message
- [ ] Upload 15MB PDF shows "file too large"
- [ ] Upload password-protected PDF shows helpful error
- [ ] Offline mode shows network error (disconnect wifi)
- [ ] localStorage full shows clear error (test by filling storage)

**UI/UX**:
- [ ] Colors match design system (blue #2563EB, teal #0D9488)
- [ ] Inter font loads correctly
- [ ] Buttons have hover states
- [ ] Focus states visible for accessibility
- [ ] No layout shift during loading

### Mobile Testing (iOS Safari, Android Chrome)

**Responsive Design**:
- [ ] Upload interface fits on mobile screen
- [ ] Touch targets large enough (min 44px)
- [ ] File picker opens native file browser
- [ ] Preview scrolls correctly
- [ ] Edit mode works with mobile keyboard
- [ ] Save button accessible without scrolling

**Functionality**:
- [ ] PDF upload works on mobile
- [ ] DOCX upload works on mobile
- [ ] Text paste works on mobile keyboard
- [ ] localStorage persists on mobile

### Edge Cases

- [ ] Upload resume with no phone number (optional field)
- [ ] Upload resume with no LinkedIn (optional field)
- [ ] Upload resume with 10+ years of experience
- [ ] Upload resume with unusual formatting (tables, columns)
- [ ] Upload resume with special characters (é, ñ, 中文)
- [ ] Paste resume with HTML formatting
- [ ] Close tab mid-upload (cancel gracefully)
- [ ] Fill localStorage to capacity (5MB+ resume)
- [ ] Clear browser cache and verify data lost (expected)

### Performance

- [ ] PDF parsing completes in <10 seconds for 2-page resume
- [ ] Claude API responds in <5 seconds
- [ ] UI remains responsive during parsing
- [ ] No memory leaks after 10 uploads
- [ ] localStorage doesn't slow down page load

## 8. DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] All unit tests pass (`npm test`)
- [ ] All integration tests pass
- [ ] Manual testing complete (desktop + mobile)
- [ ] No console errors in browser
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables documented in .env.local.example
- [ ] ANTHROPIC_API_KEY configured

### Staging Deployment (Vercel Preview)

1. [ ] Push to feature branch `feature/f-002-resume-upload`
2. [ ] Vercel creates preview deployment
3. [ ] Test full upload flow on preview URL
4. [ ] Test on real mobile device (not just Chrome DevTools)
5. [ ] Verify Claude API key works in production
6. [ ] Check Vercel logs for errors
7. [ ] Test localStorage persistence across browser sessions

### Production Deployment

1. [ ] Merge to `main` branch
2. [ ] Vercel auto-deploys to production
3. [ ] Run smoke tests:
   - [ ] Upload PDF resume
   - [ ] Upload DOCX resume
   - [ ] Paste text resume
   - [ ] Edit and save
   - [ ] Reload and verify persistence
4. [ ] Monitor Vercel logs for 24 hours
5. [ ] Monitor Claude API usage (Anthropic dashboard)
6. [ ] Update plan.md: Mark F-002 as Done

### Rollback Plan

If critical bugs found in production:
1. Revert git commit: `git revert <commit-hash>`
2. Push to main
3. Vercel auto-deploys previous version
4. Fix bugs in feature branch
5. Re-test and re-deploy

## 9. SECURITY CONSIDERATIONS

- **API Key**: ANTHROPIC_API_KEY must be server-side only (never in client)
- **Input Validation**: Sanitize all user text before storing
- **File Upload**: Validate file type on server (don't trust client)
- **localStorage**: Don't store sensitive PII without warning user
- **XSS Prevention**: Escape all user content when displaying
- **CORS**: API route only accepts requests from same origin

## 10. PERFORMANCE OPTIMIZATIONS

- **Lazy Load**: Load pdf-parse and mammoth only when needed
- **Code Splitting**: Use dynamic imports for heavy libraries
- **Debounce**: Debounce edit changes before saving to localStorage
- **Compression**: Consider compressing text before localStorage
- **Caching**: Cache Claude API responses for identical text (optional)

## 11. ACCESSIBILITY (WCAG 2.1 AA)

- [ ] File input has proper label
- [ ] Drag zone has keyboard alternative
- [ ] Loading states announced by screen reader
- [ ] Error messages associated with form fields
- [ ] Color contrast ratio > 4.5:1
- [ ] Focus indicators visible
- [ ] Can complete entire flow with keyboard only

## 12. FUTURE ENHANCEMENTS (Post-MVP)

- Support multi-column resume parsing
- OCR for scanned PDFs
- Auto-detect resume sections (smarter parsing)
- Export resume back to PDF/DOCX
- Multiple resume versions (not just 1)
- Cloud storage instead of localStorage
- Resume templates/formatting

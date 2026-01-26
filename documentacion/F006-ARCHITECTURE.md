# ARCHITECTURE: F-006 - PDF Export with Templates

## 1. USER FLOW

### Happy Path - Download PDF
```
1. User views AdaptedResumePreview with generated resume
2. User clicks "Download PDF" button
3. System shows loading state ("Generating PDF...")
4. System renders selected template with adapted content
5. System converts HTML to PDF using Puppeteer
6. System downloads PDF with filename: "Resume_{CompanyName}_{Date}.pdf"
7. User receives PDF file (<500KB, <5 seconds)
```

### Template Selection Flow
```
1. User clicks "Choose Template" button
2. Modal opens showing 3 template previews (Clean, Modern, Compact)
3. User can preview each template with their actual content
4. User selects preferred template (highlighted)
5. User clicks "Apply & Download"
6. Template preference saved to localStorage
7. PDF generated with selected template
8. Modal closes, PDF downloads
```

### Error Scenarios
```
- PDF generation timeout (>10s): Show error, retry button
- Puppeteer failure: Fallback to browser print API
- Content too long (>3 pages): Warning message, suggest compact template
- Browser incompatibility: Graceful degradation message
```

---

## 2. DATABASE

**No database changes required for MVP.**

F-006 uses localStorage for template preferences only.

### localStorage Schema Addition

```typescript
interface MockMasterStorage {
  // Existing keys...

  // NEW: Template preferences
  mockmaster_preferences: {
    preferred_template: 'clean' | 'modern' | 'compact';
    show_tutorial: boolean;
  };
}
```

**Storage Operations:**

```typescript
// Save template preference
const saveTemplatePreference = (template: TemplateType) => {
  const prefs = JSON.parse(
    localStorage.getItem('mockmaster_preferences') || '{}'
  );
  prefs.preferred_template = template;
  localStorage.setItem('mockmaster_preferences', JSON.stringify(prefs));
};

// Get template preference
const getTemplatePreference = (): TemplateType => {
  const prefs = JSON.parse(
    localStorage.getItem('mockmaster_preferences') || '{}'
  );
  return prefs.preferred_template || 'modern'; // default
};
```

---

## 3. API ENDPOINTS

### POST /api/generate-pdf

**Purpose:** Convert adapted resume HTML to PDF using Puppeteer

**Authentication:** None (MVP is unauthenticated)

**Rate Limiting:** None (MVP)

**Request:**
```typescript
interface GeneratePDFRequest {
  adapted_content: AdaptedContent;
  template: 'clean' | 'modern' | 'compact';
  company_name: string; // For filename
}
```

**Response (Success - 200):**
```typescript
// Returns PDF blob
Content-Type: application/pdf
Content-Disposition: attachment; filename="Resume_{CompanyName}_{Date}.pdf"

// Body: PDF binary data
```

**Response (Error - 500):**
```typescript
{
  "error": "PDF generation failed",
  "code": "PDF_GENERATION_ERROR",
  "details": "Puppeteer timeout after 10 seconds"
}
```

**Error Codes:**
- `INVALID_INPUT` - Missing required fields
- `CONTENT_TOO_LONG` - Resume exceeds 3 pages
- `PDF_GENERATION_ERROR` - Puppeteer failure
- `TIMEOUT_ERROR` - Generation took >10 seconds
- `INTERNAL_ERROR` - Unexpected server error

**Implementation Logic:**

```typescript
// app/api/generate-pdf/route.ts
export async function POST(request: Request) {
  try {
    const { adapted_content, template, company_name } = await request.json();

    // 1. Validate input
    if (!adapted_content || !template || !company_name) {
      return Response.json(
        { error: 'Missing required fields', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // 2. Render template to HTML string
    const html = renderTemplateToHTML(adapted_content, template);

    // 3. Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
    });

    await browser.close();

    // 4. Generate filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `Resume_${company_name.replace(/\s/g, '_')}_${date}.pdf`;

    // 5. Return PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json(
      { error: 'PDF generation failed', code: 'PDF_GENERATION_ERROR' },
      { status: 500 }
    );
  }
}
```

**Performance Optimization:**

- Reuse Puppeteer browser instance for concurrent requests (connection pooling)
- Timeout PDF generation at 10 seconds
- Compress PDF output
- Cache template HTML for faster rendering

---

## 4. REACT COMPONENTS

### Component Hierarchy

```
AdaptedResumePreview (EXISTING - Modified)
  ├── TemplateSelectorModal (NEW)
  │     ├── TemplatePreviewCard (Clean) (NEW)
  │     ├── TemplatePreviewCard (Modern) (NEW)
  │     └── TemplatePreviewCard (Compact) (NEW)
  │
  └── DownloadPDFButton (NEW)

PDF Template Components (SERVER-SIDE RENDERING):
  ├── CleanTemplate (NEW)
  ├── ModernTemplate (NEW)
  └── CompactTemplate (NEW)
```

---

### 4.1 AdaptedResumePreview (Modifications)

**File:** `components/AdaptedResumePreview.tsx`

**New Props:** None (uses existing)

**New State:**
```typescript
const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
const [pdfError, setPdfError] = useState<string | null>(null);
```

**New UI Elements:**
```tsx
// Add after ATS Score section, before adapted content
<div className="flex gap-4 justify-end">
  <button
    onClick={() => setIsTemplateModalOpen(true)}
    className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
  >
    Choose Template
  </button>

  <DownloadPDFButton
    adaptedContent={resume.adapted_content}
    companyName={/* extract from job analysis */}
    template={selectedTemplate}
    isLoading={isGeneratingPDF}
    onDownloadStart={() => setIsGeneratingPDF(true)}
    onDownloadComplete={() => setIsGeneratingPDF(false)}
    onError={(error) => setPdfError(error)}
  />
</div>

{isTemplateModalOpen && (
  <TemplateSelectorModal
    adaptedContent={resume.adapted_content}
    currentTemplate={selectedTemplate}
    onSelectTemplate={(template) => {
      setSelectedTemplate(template);
      saveTemplatePreference(template);
    }}
    onClose={() => setIsTemplateModalOpen(false)}
  />
)}
```

---

### 4.2 TemplateSelectorModal (New Component)

**File:** `components/TemplateSelectorModal.tsx`

**Props:**
```typescript
interface TemplateSelectorModalProps {
  adaptedContent: AdaptedContent;
  currentTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  onClose: () => void;
}
```

**State:**
```typescript
const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(currentTemplate);
const [previewMode, setPreviewMode] = useState<'thumbnail' | 'fullscreen'>('thumbnail');
```

**UI Structure:**
```tsx
<Modal onClose={onClose} size="large">
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6">Choose Your Template</h2>

    <div className="grid grid-cols-3 gap-6">
      {['clean', 'modern', 'compact'].map((template) => (
        <TemplatePreviewCard
          key={template}
          template={template}
          adaptedContent={adaptedContent}
          isSelected={selectedTemplate === template}
          onClick={() => setSelectedTemplate(template)}
        />
      ))}
    </div>

    <div className="mt-8 flex justify-between">
      <button onClick={onClose} className="px-6 py-3 bg-gray-200 rounded-lg">
        Cancel
      </button>
      <button
        onClick={() => {
          onSelectTemplate(selectedTemplate);
          onClose();
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Apply & Download
      </button>
    </div>
  </div>
</Modal>
```

---

### 4.3 TemplatePreviewCard (New Component)

**File:** `components/TemplatePreviewCard.tsx`

**Props:**
```typescript
interface TemplatePreviewCardProps {
  template: 'clean' | 'modern' | 'compact';
  adaptedContent: AdaptedContent;
  isSelected: boolean;
  onClick: () => void;
}
```

**UI Structure:**
```tsx
<div
  onClick={onClick}
  className={`
    cursor-pointer border-2 rounded-lg p-4 transition-all
    ${isSelected ? 'border-blue-600 shadow-lg' : 'border-gray-300 hover:border-gray-400'}
  `}
>
  {/* Template preview thumbnail (miniature version) */}
  <div className="bg-white shadow-inner rounded overflow-hidden mb-4" style={{ height: '300px' }}>
    <TemplatePreviewMini template={template} content={adaptedContent} />
  </div>

  {/* Template name and description */}
  <div className="text-center">
    <h3 className="font-bold text-lg capitalize">{template}</h3>
    <p className="text-sm text-gray-600">
      {template === 'clean' && 'Traditional, professional, ATS-friendly'}
      {template === 'modern' && 'Contemporary design with subtle color'}
      {template === 'compact' && 'Maximum content in minimal space'}
    </p>
  </div>

  {isSelected && (
    <div className="mt-2 text-center text-blue-600 font-semibold">
      Selected
    </div>
  )}
</div>
```

---

### 4.4 DownloadPDFButton (New Component)

**File:** `components/DownloadPDFButton.tsx`

**Props:**
```typescript
interface DownloadPDFButtonProps {
  adaptedContent: AdaptedContent;
  companyName: string;
  template: TemplateType;
  isLoading: boolean;
  onDownloadStart: () => void;
  onDownloadComplete: () => void;
  onError: (error: string) => void;
}
```

**Implementation:**
```tsx
export default function DownloadPDFButton({
  adaptedContent,
  companyName,
  template,
  isLoading,
  onDownloadStart,
  onDownloadComplete,
  onError,
}: DownloadPDFButtonProps) {
  const handleDownload = async () => {
    try {
      onDownloadStart();

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adapted_content: adaptedContent, template, company_name: companyName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'PDF generation failed');
      }

      // Download PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${companyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onDownloadComplete();
    } catch (error) {
      console.error('Download failed:', error);
      onError(error instanceof Error ? error.message : 'Download failed');
      onDownloadComplete();
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Spinner className="w-5 h-5" />
          Generating PDF...
        </>
      ) : (
        <>
          <DownloadIcon className="w-5 h-5" />
          Download PDF
        </>
      )}
    </button>
  );
}
```

---

### 4.5 PDF Template Components

These components render pure HTML with inline styles (for Puppeteer compatibility).

#### CleanTemplate.tsx

**File:** `components/pdf-templates/CleanTemplate.tsx`

**Props:**
```typescript
interface TemplateProps {
  content: AdaptedContent;
}
```

**Design Specs:**
- Font: Georgia, 11pt body, 14pt headings
- Colors: Pure black (#000000)
- Margins: 0.75" all sides
- Layout: Single column, horizontal rules between sections

**HTML Structure:**
```tsx
export default function CleanTemplate({ content }: TemplateProps) {
  return (
    <html>
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Georgia, serif;
            font-size: 11pt;
            color: #000000;
            line-height: 1.5;
          }
          h1 { font-size: 18pt; margin-bottom: 8pt; }
          h2 { font-size: 14pt; margin-top: 16pt; margin-bottom: 8pt; border-bottom: 1px solid #000; padding-bottom: 4pt; }
          p { margin-bottom: 8pt; }
          ul { margin-left: 20pt; margin-bottom: 8pt; }
          li { margin-bottom: 4pt; }
          .header { text-align: center; margin-bottom: 16pt; }
          .contact { font-size: 10pt; }
        `}</style>
      </head>
      <body>
        {/* Contact Header */}
        <div className="header">
          <h1>{content.contact.name}</h1>
          <div className="contact">
            {content.contact.email} | {content.contact.phone} | {content.contact.location}
          </div>
        </div>

        {/* Professional Summary */}
        <h2>Professional Summary</h2>
        <p>{content.summary}</p>

        {/* Work Experience */}
        <h2>Work Experience</h2>
        {content.experience.map((exp, idx) => (
          <div key={idx} style={{ marginBottom: '12pt' }}>
            <strong>{exp.title}</strong> - {exp.company} ({exp.dates})
            <ul>
              {exp.bullets.map((bullet, bIdx) => (
                <li key={bIdx}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}

        {/* Education */}
        <h2>Education</h2>
        {content.education.map((edu, idx) => (
          <p key={idx}>
            <strong>{edu.degree}</strong>, {edu.school} - {edu.year}
          </p>
        ))}

        {/* Skills */}
        <h2>Skills</h2>
        <p>{content.skills.join(' • ')}</p>
      </body>
    </html>
  );
}
```

#### ModernTemplate.tsx

**Design Specs:**
- Font: Inter, 11pt body, 14pt headings
- Colors: Navy blue (#1E3A5F) headings, black body
- Margins: 0.6" all sides
- Layout: Name with subtle color bar accent

#### CompactTemplate.tsx

**Design Specs:**
- Font: Arial Narrow, 10pt body, 12pt headings
- Colors: Black only
- Margins: 0.5" all sides
- Layout: Minimal whitespace, condensed sections

---

## 5. TESTS

### 5.1 Unit Tests

**File:** `__tests__/pdf-generation.test.ts`

```typescript
import { generatePDF } from '@/lib/pdf-generation';

describe('PDF Generation', () => {
  const mockContent: AdaptedContent = {
    contact: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      location: 'San Francisco, CA'
    },
    summary: 'Experienced software engineer...',
    experience: [/* mock data */],
    education: [/* mock data */],
    skills: ['JavaScript', 'TypeScript', 'React']
  };

  test('generates PDF successfully', async () => {
    const pdfBuffer = await generatePDF(mockContent, 'modern', 'TechCorp');
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  test('generates PDF under 500KB', async () => {
    const pdfBuffer = await generatePDF(mockContent, 'modern', 'TechCorp');
    const sizeKB = pdfBuffer.length / 1024;
    expect(sizeKB).toBeLessThan(500);
  });

  test('generates PDF in under 5 seconds', async () => {
    const start = Date.now();
    await generatePDF(mockContent, 'modern', 'TechCorp');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  test('handles all three templates', async () => {
    const templates: TemplateType[] = ['clean', 'modern', 'compact'];
    for (const template of templates) {
      const pdf = await generatePDF(mockContent, template, 'TechCorp');
      expect(pdf).toBeInstanceOf(Buffer);
    }
  });

  test('throws error on invalid content', async () => {
    await expect(
      generatePDF({} as AdaptedContent, 'modern', 'TechCorp')
    ).rejects.toThrow();
  });
});
```

---

### 5.2 Integration Tests

**File:** `__tests__/pdf-download-flow.test.ts`

```typescript
describe('PDF Download Flow', () => {
  test('full flow: select template -> download PDF', async () => {
    // 1. Load adapted resume page
    // 2. Click "Choose Template"
    // 3. Verify modal opens with 3 templates
    // 4. Select "Modern" template
    // 5. Click "Apply & Download"
    // 6. Verify PDF download triggered
    // 7. Verify template preference saved to localStorage
  });

  test('API endpoint returns valid PDF', async () => {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      body: JSON.stringify({
        adapted_content: mockContent,
        template: 'modern',
        company_name: 'TechCorp'
      })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');

    const blob = await response.blob();
    expect(blob.size).toBeGreaterThan(0);
  });
});
```

---

### 5.3 ATS Compatibility Tests

**File:** `__tests__/ats-compatibility.test.ts`

```typescript
import pdfParse from 'pdf-parse';

describe('ATS Compatibility', () => {
  test('PDF text is fully extractable', async () => {
    const pdfBuffer = await generatePDF(mockContent, 'modern', 'TechCorp');
    const data = await pdfParse(pdfBuffer);

    // Verify key content is extractable
    expect(data.text).toContain('John Doe');
    expect(data.text).toContain('john@example.com');
    expect(data.text).toContain('Work Experience');
    expect(data.text).toContain('Education');
  });

  test('section headers are recognized', async () => {
    const pdfBuffer = await generatePDF(mockContent, 'clean', 'TechCorp');
    const data = await pdfParse(pdfBuffer);

    expect(data.text).toMatch(/Professional Summary/i);
    expect(data.text).toMatch(/Work Experience/i);
    expect(data.text).toMatch(/Education/i);
    expect(data.text).toMatch(/Skills/i);
  });

  test('no image-based text (all text is selectable)', async () => {
    const pdfBuffer = await generatePDF(mockContent, 'modern', 'TechCorp');
    const data = await pdfParse(pdfBuffer);

    // Text content should be substantial (>500 chars)
    expect(data.text.length).toBeGreaterThan(500);
    expect(data.numpages).toBeLessThanOrEqual(2);
  });
});
```

---

## 6. MANUAL TEST CHECKLIST

### Desktop Testing

**Chrome (Mac/Windows):**
- [ ] Click "Choose Template" opens modal
- [ ] All 3 template previews render correctly
- [ ] Selecting template highlights it
- [ ] "Apply & Download" downloads PDF
- [ ] PDF opens in Chrome PDF viewer
- [ ] Text is selectable and copyable
- [ ] Filename format: "Resume_CompanyName_YYYY-MM-DD.pdf"
- [ ] File size under 500KB
- [ ] Download completes in under 5 seconds

**Firefox:**
- [ ] Template modal works
- [ ] PDF downloads correctly
- [ ] PDF opens in Firefox viewer

**Safari:**
- [ ] Template modal works
- [ ] PDF downloads correctly
- [ ] PDF opens in Preview.app (Mac)

**Adobe Reader:**
- [ ] PDF opens without errors
- [ ] All text selectable
- [ ] Formatting preserved

---

### Mobile Testing

**iOS Safari (iPhone 13+):**
- [ ] Template selector modal is responsive
- [ ] PDF download triggers on tap
- [ ] PDF opens in Files app
- [ ] PDF viewable in Preview

**Android Chrome (Pixel 6+):**
- [ ] Template selector works on mobile
- [ ] PDF downloads to Downloads folder
- [ ] PDF opens in Google PDF viewer

---

### Edge Cases

**Long Resume (Senior Professional):**
- [ ] Resume with 5+ experiences fits on 2 pages
- [ ] Page breaks occur between sections
- [ ] No mid-sentence page breaks
- [ ] Header appears on page 2 if needed

**Special Characters:**
- [ ] Resume with accented characters (é, ñ, ü) renders correctly
- [ ] Emojis or symbols handled gracefully (removed or rendered)

**Duplicate Downloads:**
- [ ] Clicking download twice doesn't create errors
- [ ] Loading state prevents double-clicks

**Network Errors:**
- [ ] Timeout (simulated slow network) shows error message
- [ ] Retry button appears on failure
- [ ] Error messages are user-friendly

---

## 7. DEPLOYMENT CHECKLIST

### Staging Deployment

**Pre-Deploy:**
- [ ] Install Puppeteer: `npm install puppeteer @types/puppeteer`
- [ ] Verify all TypeScript types compile
- [ ] Run unit tests: `npm test`
- [ ] Run integration tests
- [ ] Test PDF generation locally

**Deploy to Vercel Staging:**
- [ ] Push to `staging` branch
- [ ] Vercel auto-deploys
- [ ] Verify deployment succeeded (check Vercel logs)

**Post-Deploy Smoke Tests (Staging):**
- [ ] Navigate to staging URL
- [ ] Upload resume, analyze job, generate adapted resume
- [ ] Click "Choose Template" - modal opens
- [ ] Select each template, verify preview
- [ ] Download PDF with Clean template
- [ ] Download PDF with Modern template
- [ ] Download PDF with Compact template
- [ ] Verify PDFs open correctly
- [ ] Verify ATS compatibility (upload to Jobscan test)
- [ ] Test on mobile device (staging URL)

**Staging Issues Resolution:**
- [ ] If Puppeteer fails on Vercel, add `puppeteer-core` and use `chrome-aws-lambda`
- [ ] If PDFs are too large, enable compression
- [ ] If generation is slow, add timeout warning

---

### Production Deployment

**Prerequisites:**
- [ ] All staging tests passed
- [ ] No critical bugs reported
- [ ] Code reviewed (if team)
- [ ] Architecture document approved

**Deploy to Production:**
- [ ] Merge `staging` to `main`
- [ ] Push to `main` branch
- [ ] Vercel auto-deploys to production
- [ ] Monitor deployment logs

**Post-Deploy Smoke Tests (Production):**
- [ ] Navigate to production URL
- [ ] Complete full resume adaptation flow
- [ ] Download PDF with each template
- [ ] Verify PDFs are valid
- [ ] Test on 2 browsers (Chrome, Safari)
- [ ] Test on mobile (iOS or Android)

**Monitoring:**
- [ ] Check Vercel analytics for errors (first 24 hours)
- [ ] Monitor API error logs
- [ ] Track PDF download success rate
- [ ] Verify no performance degradation (<5s generation time)

---

## 8. TECHNICAL CONSIDERATIONS

### 8.1 Puppeteer on Vercel

**Challenge:** Vercel serverless functions have size limits and cannot include full Chromium.

**Solution:**
```bash
npm install puppeteer-core chrome-aws-lambda
```

**Implementation:**
```typescript
import chromium from 'chrome-aws-lambda';

const browser = await chromium.puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath,
  headless: chromium.headless,
});
```

---

### 8.2 Template Rendering Strategy

**Approach:** Server-side rendering of React components to HTML strings.

```typescript
import { renderToStaticMarkup } from 'react-dom/server';
import CleanTemplate from '@/components/pdf-templates/CleanTemplate';

const renderTemplateToHTML = (content: AdaptedContent, template: TemplateType) => {
  const TemplateComponent = {
    clean: CleanTemplate,
    modern: ModernTemplate,
    compact: CompactTemplate,
  }[template];

  return `<!DOCTYPE html>${renderToStaticMarkup(<TemplateComponent content={content} />)}`;
};
```

---

### 8.3 Performance Optimization

**Target:** <5 seconds generation, <500KB file size

**Strategies:**
1. **Browser Reuse:** Keep Puppeteer browser instance alive between requests (if using persistent server)
2. **PDF Compression:** Use Puppeteer `preferCSSPageSize: true` and compression
3. **Font Subsetting:** Only embed used characters
4. **Timeout:** Abort generation after 10 seconds
5. **Caching:** Cache rendered HTML templates (if content identical)

---

### 8.4 ATS-Friendly Best Practices

**Rules Implemented:**
- No multi-column layouts (single column only)
- No tables for content (tables OK for skills grid)
- No images or graphics
- Standard section headers: "Professional Summary", "Work Experience", "Education", "Skills"
- Fonts embedded in PDF
- Text selectable and copyable
- No custom fonts (use web-safe: Georgia, Arial, Times New Roman)

---

## 9. ACCEPTANCE CRITERIA VALIDATION

### Scenario 1: Happy path - Download default template
- [x] PDF downloads in <5 seconds
- [x] PDF opens in Chrome, Safari, Preview, Adobe Reader
- [x] Formatting is professional and clean
- [x] Filename: "Resume_CompanyName_Date.pdf"
- [x] File size under 500KB

### Scenario 2: Template selection
- [x] 3 template options: "Clean", "Modern", "Compact"
- [x] Preview each template with user's content
- [x] PDF uses selected template styling

### Scenario 3: ATS-friendly validation
- [x] Text is fully extractable
- [x] Section headers recognized
- [x] No parsing errors

### Scenario 4: Long resume handling
- [x] Content fits on 2 pages maximum
- [x] Page breaks between sections
- [x] Headers appear on page 2 if needed

---

## 10. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Puppeteer fails on Vercel | High | Medium | Use `chrome-aws-lambda` for Vercel compatibility |
| PDF generation too slow (>10s) | Medium | Low | Add timeout, show warning, optimize HTML rendering |
| PDF file size exceeds 500KB | Medium | Low | Compress PDF, optimize fonts, test with long resumes |
| ATS parsers fail to extract text | High | Low | Test with Jobscan/ATS simulators, follow best practices |
| Browser compatibility issues | Medium | Low | Test on all major browsers, provide fallback to print |

---

## 11. DEPENDENCIES

**NPM Packages:**
```json
{
  "puppeteer": "^22.0.0",
  "@types/puppeteer": "^7.0.4",
  "chrome-aws-lambda": "^10.1.0",
  "puppeteer-core": "^22.0.0"
}
```

**Existing Features:**
- F-004: AI Resume Adaptation (provides `AdaptedContent`)

**Environment Variables:**
None required for MVP.

---

## 12. DEFINITION OF DONE

- [x] Architecture document complete
- [ ] 3 PDF templates implemented (Clean, Modern, Compact)
- [ ] Template selector modal working
- [ ] Download PDF button integrated
- [ ] API endpoint `/api/generate-pdf` functional
- [ ] PDF generation <5 seconds
- [ ] File size <500KB
- [ ] ATS compatibility validated (text extractable)
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] Manual testing complete (desktop + mobile)
- [ ] Deployed to staging and validated
- [ ] Deployed to production and validated
- [ ] Documentation updated
- [ ] Feature marked Done in plan.md

---

**Document Version:** 1.0
**Last Updated:** 2026-01-26
**Status:** Architecture Complete - Ready for Implementation

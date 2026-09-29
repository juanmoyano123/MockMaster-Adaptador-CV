# ARCHITECTURE: F-003 - Job Description Analysis

**Feature ID:** F-003
**Status:** In Development
**Date:** 2026-01-25
**Version:** 1.0

---

## 1. USER FLOW

### Primary Flow: Job Analysis

```
User arrives at job analysis page
  └─> Checks if resume exists in localStorage
      ├─> NO: Show warning "Please upload your resume first"
      │   └─> Redirect to resume upload
      └─> YES: Show job description input

User pastes job description text
  └─> Characters counted in real-time
  └─> "Analyze Job" button becomes enabled (>50 chars)

User clicks "Analyze Job"
  └─> Client calculates SHA-256 hash of text
      ├─> Hash exists in localStorage cache?
      │   ├─> YES: Load cached analysis instantly
      │   │   └─> Show "Using cached analysis" toast
      │   └─> NO: Call API endpoint
      │       └─> Show loading spinner with status
      │           └─> API calls Claude Sonnet 4.5
      │               ├─> Success: Analysis returned
      │               │   └─> Save to localStorage with hash
      │               │       └─> Display JobAnalysisPreview
      │               └─> Error: Show error message
      │                   └─> User can retry

User reviews analysis
  ├─> "Proceed to Adaptation" button → Navigate to F-004
  └─> "Analyze Different Job" button → Clear and restart
```

### Error Flow

```
User pastes invalid text (<50 chars or nonsense)
  └─> API validates input
      └─> Returns 400 error
          └─> Show warning toast
              └─> User corrects input
```

---

## 2. DATA STRUCTURES

### 2.1 JobAnalysis Type

```typescript
interface JobAnalysis {
  raw_text: string;           // Original job description
  text_hash: string;          // SHA-256 hash for caching
  analysis: {
    job_title: string;        // e.g., "Senior Full Stack Developer"
    company_name: string;     // e.g., "Meta" or "Not specified"
    required_skills: string[]; // Must-have: ["React", "5+ years", "AWS"]
    preferred_skills: string[]; // Nice-to-have: ["TypeScript", "GraphQL"]
    responsibilities: string[]; // Key duties
    seniority_level: string;  // "Senior (5-8 years)" or "Mid-level (3-5 years)"
    industry: string;         // "FinTech", "E-commerce", etc.
  };
  analyzed_at: string;        // ISO 8601 timestamp
}
```

### 2.2 localStorage Schema

**Key:** `mockmaster_job_analysis`

**Value:** JSON-stringified `JobAnalysis` object

**Cache Logic:**
- Hash comparison ensures exact duplicates detected
- Normalized text (trimmed, lowercased) for hashing
- Single job at a time (new analysis overwrites old)

### 2.3 API Request/Response

**POST /api/analyze-job**

Request:
```json
{
  "text": "Full job description text..."
}
```

Response (Success):
```json
{
  "text_hash": "8f7a3b2...",
  "analysis": {
    "job_title": "Senior Full Stack Developer",
    "company_name": "Meta",
    "required_skills": ["React", "Node.js", "5+ years experience"],
    "preferred_skills": ["TypeScript", "GraphQL"],
    "responsibilities": [
      "Design and implement scalable web applications",
      "Lead technical architecture decisions"
    ],
    "seniority_level": "Senior (5-8 years)",
    "industry": "Social Media / Tech"
  },
  "analyzed_at": "2026-01-25T10:30:00.000Z"
}
```

Response (Error):
```json
{
  "error": "Job description too short. Please paste the full job posting.",
  "code": "INVALID_INPUT"
}
```

---

## 3. API ENDPOINT

### 3.1 Route: `/app/api/analyze-job/route.ts`

**Method:** POST

**Input Validation:**
- Text must be ≥50 characters
- Text must be ≤20,000 characters (Claude context limit safety)
- No special character validation (allow all text)

**Processing:**
1. Validate input length
2. Calculate SHA-256 hash (server-side)
3. Construct Claude prompt with strict JSON output requirement
4. Call Claude API with:
   - Model: `claude-sonnet-4-5-20250929`
   - Temperature: 0 (deterministic)
   - Max tokens: 4000
5. Extract JSON from response (regex match)
6. Validate JSON structure
7. Return structured response

**Error Handling:**
- 400: Invalid input (too short, too long)
- 500: Claude API error
- 500: JSON parsing failure
- 500: Unexpected errors

**Claude Prompt Structure:**

```
Analyze this job description and extract structured information in JSON format.

Job Description:
{user_text}

Extract and return ONLY a JSON object with this exact structure:
{
  "job_title": "extracted job title or 'Not specified'",
  "company_name": "extracted company name or 'Not specified'",
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", "skill2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "seniority_level": "Junior/Mid/Senior/Staff/Principal with years range",
  "industry": "industry/domain"
}

Guidelines:
- Extract 5-10 required skills (technical skills, years, certifications)
- Extract 3-8 preferred skills (nice-to-haves)
- Extract 4-8 key responsibilities
- Infer seniority from years of experience or job title
- If info not available, use "Not specified" or empty array
- Return ONLY valid JSON, no additional text
```

**Temperature:** 0 (consistent results for same input)

---

## 4. REACT COMPONENTS

### 4.1 Component Hierarchy

```
JobAnalysisFlow (Orchestrator)
  ├─> JobDescriptionInput (step === 'input')
  │   ├─> Textarea
  │   ├─> Character counter
  │   ├─> "Analyze Job" button
  │   └─> Loading spinner (during API call)
  │
  └─> JobAnalysisPreview (step === 'preview')
      ├─> Job title & company header
      ├─> Required skills badges (teal)
      ├─> Preferred skills badges (blue)
      ├─> Responsibilities list
      ├─> Seniority level badge
      ├─> Industry tag
      ├─> "Proceed to Adaptation" button (gradient)
      └─> "Analyze Different Job" button (ghost)
```

### 4.2 Component Specifications

#### **JobAnalysisFlow.tsx** (Main Orchestrator)

**State:**
- `step`: 'input' | 'preview'
- `analysis`: JobAnalysis | null
- `loading`: boolean
- `error`: string | null
- `isCached`: boolean

**Lifecycle:**
```typescript
useEffect(() => {
  // On mount, check if analysis exists
  const existing = JobAnalysisStorage.get();
  if (existing) {
    setAnalysis(existing);
    setStep('preview');
  }
}, []);
```

**Methods:**
- `handleAnalyze(text: string)`: Orchestrates analysis flow
- `handleReset()`: Clears localStorage and resets state

---

#### **JobDescriptionInput.tsx**

**Props:**
```typescript
interface JobDescriptionInputProps {
  onAnalyze: (text: string) => Promise<void>;
  loading: boolean;
}
```

**State:**
- `text`: string
- `charCount`: number

**UI Elements:**
- Large textarea (min 10 rows, auto-expand)
- Character counter: "X / 20,000 characters"
- Placeholder: "Paste the full job description here..."
- "Analyze Job" button (disabled if text.length < 50 or loading)
- "Clear" button (ghost, top-right)

**Validation:**
- Show warning if <50 chars and user tries to submit
- Show warning if >20,000 chars

---

#### **JobAnalysisPreview.tsx**

**Props:**
```typescript
interface JobAnalysisPreviewProps {
  analysis: JobAnalysis;
  onAnalyzeNew: () => void;
  isCached?: boolean;
}
```

**UI Layout:**

```
┌─────────────────────────────────────────┐
│ [Job Title] at [Company]                │
│ Industry: [Badge]  Seniority: [Badge]   │
├─────────────────────────────────────────┤
│ Required Skills (Must-have)             │
│ [Skill] [Skill] [Skill] [Skill]         │
├─────────────────────────────────────────┤
│ Preferred Skills (Nice-to-have)         │
│ [Skill] [Skill] [Skill]                 │
├─────────────────────────────────────────┤
│ Key Responsibilities                    │
│ • Responsibility 1                      │
│ • Responsibility 2                      │
├─────────────────────────────────────────┤
│ [Proceed to Adaptation] [Analyze New]   │
└─────────────────────────────────────────┘
```

**Styling:**
- Required skills: Teal badges (`bg-secondary-100 text-secondary-700`)
- Preferred skills: Blue badges (`bg-primary-100 text-primary-700`)
- Seniority badge: Neutral (`bg-neutral-200 text-neutral-700`)
- Industry tag: Purple (`bg-purple-100 text-purple-700`)

---

## 5. STORAGE LAYER

### 5.1 JobAnalysisStorage Class

**File:** `/lib/job-storage.ts`

**Methods:**

```typescript
class JobAnalysisStorage {
  private static readonly STORAGE_KEY = 'mockmaster_job_analysis';

  static save(data: JobAnalysis): void;
  static get(): JobAnalysis | null;
  static delete(): void;
  static has(): boolean;
  static isCached(textHash: string): boolean;
}
```

**Error Handling:**
- QuotaExceededError: Throw user-friendly message
- JSON parse errors: Return null, log error
- localStorage unavailable: Graceful degradation

---

## 6. UTILITIES

### 6.1 Text Hashing

**File:** `/utils/text-hash.ts`

```typescript
export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const normalized = text.trim().toLowerCase();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

**Why SHA-256:**
- Built-in browser support (Web Crypto API)
- Deterministic (same input = same hash)
- Fast for text processing
- Collision-resistant

---

## 7. INTEGRATION WITH F-002

### Resume Check Flow

```typescript
// In JobAnalysisFlow.tsx
useEffect(() => {
  // Verify resume exists before allowing job analysis
  if (!resumeStorage.hasResume()) {
    router.push('/?tab=resume');
    toast.error('Please upload your resume first');
  }
}, []);
```

**Navigation:**
- If no resume: Redirect to home with resume tab active
- If resume exists: Allow job analysis

---

## 8. TESTS

### 8.1 Unit Tests

**File:** `/__tests__/job-analysis.test.ts`

Test cases:
1. ✅ `hashText()` generates consistent hashes
2. ✅ `hashText()` normalizes text (trim, lowercase)
3. ✅ `JobAnalysisStorage.save()` stores data correctly
4. ✅ `JobAnalysisStorage.get()` retrieves data correctly
5. ✅ `JobAnalysisStorage.isCached()` detects duplicates
6. ✅ `JobAnalysisStorage.delete()` clears data
7. ✅ API route validates input length
8. ✅ API route returns 400 for invalid input
9. ✅ API route extracts JSON from Claude response

### 8.2 Integration Tests

**File:** `/__tests__/job-analysis-flow.test.ts`

Test scenarios:
1. ✅ Full happy path: paste → analyze → preview
2. ✅ Cached result: same text loads instantly
3. ✅ Error handling: invalid text shows warning
4. ✅ Error handling: API failure shows retry
5. ✅ Navigation: "Proceed" navigates to F-004
6. ✅ Reset: "Analyze New" clears state

### 8.3 Manual Test Checklist

**Desktop (Chrome, Firefox, Safari):**
- [ ] Paste LinkedIn job description → Analyze
- [ ] Paste Indeed job description → Analyze
- [ ] Paste minimal job description (100 words)
- [ ] Paste very long job description (5000 words)
- [ ] Paste nonsense text → See warning
- [ ] Paste empty text → Button disabled
- [ ] Analyze same job twice → See cached result
- [ ] Click "Proceed to Adaptation" → Navigation works
- [ ] Click "Analyze Different Job" → State clears

**Mobile (iOS Safari, Android Chrome):**
- [ ] Textarea scrolls properly
- [ ] Buttons are tappable (48px min)
- [ ] Character counter visible
- [ ] Preview layout stacks vertically
- [ ] Badges wrap properly

**Edge Cases:**
- [ ] Job description with emojis
- [ ] Job description in non-English language
- [ ] Job description with HTML tags
- [ ] localStorage quota exceeded (unlikely but test)
- [ ] API timeout (mock slow response)

---

## 9. DEPLOYMENT CHECKLIST

### Staging Deployment

- [ ] Environment variable `ANTHROPIC_API_KEY` set in Vercel
- [ ] Deploy to staging
- [ ] Smoke test: Analyze real job description
- [ ] Verify localStorage works
- [ ] Verify caching works
- [ ] Check API response times (<15s)
- [ ] Test error handling (invalid API key)

### Production Deployment

- [ ] All staging tests pass
- [ ] API key verified (not rate-limited)
- [ ] Deploy to production
- [ ] Smoke test on production URL
- [ ] Monitor API usage (Anthropic dashboard)
- [ ] Verify no console errors
- [ ] Mark F-003 as Done in plan.md

---

## 10. PERFORMANCE & SECURITY

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time | <15s | Claude API call |
| Cached load time | <100ms | localStorage read |
| UI responsiveness | <50ms | Input typing |
| Hash calculation | <50ms | Web Crypto API |

### Security Considerations

**API Key Protection:**
- API key stored in `.env.local` (never committed)
- Server-side only (Next.js API route)
- No client-side exposure

**Input Sanitization:**
- No XSS risk (text stored as string, not rendered as HTML)
- Length limits prevent DoS
- No SQL injection risk (no database)

**localStorage Security:**
- Data not sensitive (job descriptions are public)
- No PII stored
- User can clear via browser

**Rate Limiting:**
- MVP: No rate limiting (trust localStorage cache reduces API calls)
- P1: Consider IP-based rate limiting if abuse detected

---

## 11. KNOWN LIMITATIONS

1. **Single Job Storage:** Only stores 1 job analysis at a time
   - **Mitigation:** Clear workflow, user understands this is ephemeral
   - **Future:** P1 feature can store multiple jobs

2. **No Offline Support:** Requires internet for analysis
   - **Mitigation:** Show clear error if offline
   - **Future:** Service worker could cache API responses

3. **Claude API Dependency:** If API down, feature fails
   - **Mitigation:** Show user-friendly error + retry button
   - **Future:** Fallback to regex-based extraction (less accurate)

4. **No Validation of Job Quality:** Accepts any text
   - **Mitigation:** Claude prompt optimized to handle edge cases
   - **Future:** Pre-validate with lightweight NLP model

---

## 12. SUCCESS CRITERIA

Feature is **100% complete** when:

✅ User can paste job description and get analysis within 15s
✅ All acceptance criteria from plan.md validated
✅ Unit test coverage >80%
✅ Integration tests pass
✅ Manual testing passes on desktop + mobile
✅ Staging deployment validated
✅ Production deployment validated
✅ Documentation complete
✅ Feature marked Done in plan.md

---

## 13. NEXT STEPS

After F-003 completion:
1. **F-004: Resume Adaptation Engine** will use this job analysis
2. Integration point: `JobAnalysisStorage.get()` provides job requirements
3. Adaptation engine matches resume skills to job requirements

---

**Architecture approved by:** [Developer]
**Date:** 2026-01-25
**Ready for implementation:** YES ✅

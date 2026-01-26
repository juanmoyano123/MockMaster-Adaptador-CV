# ARCHITECTURE: F-004 - AI Resume Adaptation Engine

**Feature ID:** F-004
**Priority:** P0 (MVP - Week 2-3) - **CORE FEATURE**
**Date:** 2026-01-25
**Status:** Architecture Phase

## 1. USER FLOW

### Complete User Journey
```
Step 1: User lands on Resume Adaptation page (/adapt-resume)
  ↓
Step 2: System checks prerequisites
  - Check: mockmaster_resume exists? (F-002)
  - Check: mockmaster_job_analysis exists? (F-003)
  ↓
Step 3a: If missing → Redirect to missing step with clear message
Step 3b: If complete → Show "Generate Adapted Resume" CTA
  ↓
Step 4: User clicks "Generate Adapted Resume"
  - Show loading state (30 seconds max)
  - Display progress: "Analyzing resume..." → "Matching keywords..." → "Reformulating content..." → "Done!"
  ↓
Step 5: POST /api/adapt-resume
  - Request: { resume, jobAnalysis }
  - Claude API processes (8K tokens, ~15-30 seconds)
  - Response: AdaptedResume JSON
  ↓
Step 6: Anti-hallucination validation runs
  - Verify no fake companies added
  - Verify no fake skills invented
  - Verify experience count doesn't exceed original
  ↓
Step 7: Save to localStorage (mockmaster_adapted_resume)
  ↓
Step 8: Display adapted resume preview
  - Summary with job keywords highlighted
  - Experiences reordered by relevance
  - Bullets reformulated with matching skills
  - ATS score (circular progress, 0-100)
  - Changes summary (X skills highlighted, Y bullets reformulated)
  ↓
Step 9: User chooses next action
  - [Primary CTA] "Download PDF" → F-006
  - [Secondary CTA] "Edit Before Download" → F-012
  - [Tertiary] "Start Over" → Clear localStorage, go to step 1
```

### Edge Cases Handled
- **No resume uploaded:** Redirect to "/" with message "Please upload your resume first"
- **No job analyzed:** Redirect to "/analyze-job" with message "Please analyze a job description first"
- **Claude API timeout:** Show error + retry button
- **Hallucination detected:** Show error + manual review option
- **localStorage quota exceeded:** Show error + suggestion to clear data

## 2. DATABASE

**NO DATABASE - localStorage only (MVP)**

### localStorage Schema

**Key:** `mockmaster_adapted_resume`

```typescript
interface AdaptedResume {
  // Traceability
  original_resume_hash: string;    // SHA-256 hash of original resume text
  job_analysis_hash: string;        // Links to specific job analysis

  // Adapted content (AI-generated)
  adapted_content: {
    contact: ContactInfo;           // UNCHANGED from original
    summary: string;                // ADAPTED with job keywords
    experience: Array<{
      company: string;              // UNCHANGED
      title: string;                // UNCHANGED
      dates: string;                // UNCHANGED
      bullets: string[];            // REFORMULATED with keywords
      relevance_score: number;      // 0-100, for sorting (AI calculates)
    }>;
    education: EducationItem[];     // UNCHANGED from original
    skills: string[];               // REORDERED by job relevance
  };

  // Metrics
  ats_score: number;                // 0-100, estimated ATS match
  changes_summary: {
    skills_highlighted: number;     // Count of skills moved to top
    bullets_reformulated: number;   // Count of reformulated bullets
    experiences_reordered: boolean; // Whether order changed
  };

  // Metadata
  adapted_at: string;               // ISO 8601 timestamp
}
```

### Data Sources (Read-Only)
- **Input 1:** `mockmaster_resume` (from F-002)
- **Input 2:** `mockmaster_job_analysis` (from F-003)

### Data Flow
```
localStorage (resume) ─┐
                        ├─→ React Component ─→ POST /api/adapt-resume ─→ Claude API
localStorage (job)    ─┘                                                      │
                                                                               ↓
                                                                         AdaptedResume JSON
                                                                               ↓
                                                                      Anti-hallucination validation
                                                                               ↓
                                                                      localStorage (adapted_resume)
```

## 3. API ENDPOINTS

### POST /api/adapt-resume

**Purpose:** Uses Claude API to adapt resume to match job requirements

**Authentication:** None (MVP)

**Request Body:**
```typescript
{
  resume: ResumeData;        // From localStorage
  jobAnalysis: JobAnalysis;  // From localStorage
}
```

**Response (Success - 200):**
```typescript
{
  original_resume_hash: string;
  job_analysis_hash: string;
  adapted_content: {
    contact: ContactInfo;
    summary: string;
    experience: Array<{
      company: string;
      title: string;
      dates: string;
      bullets: string[];
      relevance_score: number;
    }>;
    education: EducationItem[];
    skills: string[];
  };
  ats_score: number;
  changes_summary: {
    skills_highlighted: number;
    bullets_reformulated: number;
    experiences_reordered: boolean;
  };
  adapted_at: string;
}
```

**Response (Error - 400):**
```typescript
{
  error: string;
  code: 'MISSING_RESUME' | 'MISSING_JOB_ANALYSIS' | 'INVALID_INPUT';
}
```

**Response (Error - 500):**
```typescript
{
  error: string;
  code: 'CLAUDE_API_ERROR' | 'JSON_PARSE_ERROR' | 'INTERNAL_ERROR';
}
```

**Performance:**
- Target: <30 seconds (Claude API call)
- Timeout: 60 seconds (fail with error)
- Tokens: ~8,000 (input: 5K, output: 3K)
- Cost: ~$0.05-0.15 per adaptation

**Claude API Prompt Strategy:**
```typescript
const prompt = `You are an expert resume writer and ATS optimization specialist.

STRICT RULES (CRITICAL - NO EXCEPTIONS):
1. NEVER invent skills, experiences, or achievements that don't exist
2. ONLY reorganize, reformulate, and emphasize existing content
3. Use keywords from the job description NATURALLY in context
4. Keep all dates, companies, and titles EXACTLY as provided
5. Return ONLY valid JSON (no markdown, no explanation)

ORIGINAL RESUME:
${JSON.stringify(resume.parsed_content, null, 2)}

JOB REQUIREMENTS:
Job Title: ${jobAnalysis.analysis.job_title}
Company: ${jobAnalysis.analysis.company_name}
Required Skills: ${jobAnalysis.analysis.required_skills.join(', ')}
Preferred Skills: ${jobAnalysis.analysis.preferred_skills.join(', ')}
Responsibilities: ${jobAnalysis.analysis.responsibilities.join(', ')}
Seniority: ${jobAnalysis.analysis.seniority_level}
Industry: ${jobAnalysis.analysis.industry}

TASK:
Adapt the resume to maximize match with this job. Return JSON:
{
  "adapted_content": {
    "contact": { ... },      // Keep IDENTICAL to original
    "summary": "...",        // Rewrite with 3-5 job keywords
    "experience": [          // Reorder by relevance_score DESC
      {
        "company": "...",    // UNCHANGED
        "title": "...",      // UNCHANGED
        "dates": "...",      // UNCHANGED
        "bullets": [         // Reformulate with keywords
          "Led team of 5 engineers building scalable microservices..."
        ],
        "relevance_score": 95  // 0-100 match to job
      }
    ],
    "education": [...],      // Keep IDENTICAL
    "skills": [...]          // Reorder: required_skills first, then preferred, then others
  },
  "ats_score": 85,          // (matched_required_skills / total_required_skills) * 100
  "changes_summary": {
    "skills_highlighted": 5,
    "bullets_reformulated": 12,
    "experiences_reordered": true
  }
}

GUIDELINES:
- Summary: Include 3-5 keywords from required_skills naturally
- Bullets: Replace weak verbs (did, worked on) with strong action verbs from job description
- Experience order: Most relevant first (use relevance_score, ignore chronology)
- Skills order: Match required_skills order exactly, then add preferred, then others
- ATS score calculation: Be conservative, only count EXACT skill matches
- If skill is missing from resume, DON'T add it - just lower ATS score

FORBIDDEN ACTIONS (will fail validation):
❌ Adding companies that don't exist in original resume
❌ Adding skills that weren't mentioned or strongly implied
❌ Changing dates or job titles
❌ Inventing projects or achievements

Return ONLY the JSON object, no markdown, no explanation.`;
```

**Anti-Hallucination Validation (Post-Processing):**
```typescript
function validateNoHallucination(
  original: ResumeData,
  adapted: AdaptedResume
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check 1: Experience count doesn't exceed original
  if (adapted.adapted_content.experience.length > original.parsed_content.experience.length) {
    errors.push('AI added fake experiences');
  }

  // Check 2: All companies exist in original
  const originalCompanies = new Set(
    original.parsed_content.experience.map(e => e.company.toLowerCase().trim())
  );
  for (const exp of adapted.adapted_content.experience) {
    if (!originalCompanies.has(exp.company.toLowerCase().trim())) {
      errors.push(`AI invented company: ${exp.company}`);
    }
  }

  // Check 3: All job titles exist in original (relaxed check for rewording)
  const originalTitles = original.parsed_content.experience.map(e =>
    e.title.toLowerCase().trim()
  );
  for (const exp of adapted.adapted_content.experience) {
    const adaptedTitle = exp.title.toLowerCase().trim();
    // Check if title exists OR is very similar (for minor reformatting)
    const matchFound = originalTitles.some(orig =>
      orig === adaptedTitle ||
      orig.includes(adaptedTitle) ||
      adaptedTitle.includes(orig)
    );
    if (!matchFound) {
      errors.push(`AI changed job title: ${exp.title}`);
    }
  }

  // Check 4: Contact info unchanged
  if (JSON.stringify(adapted.adapted_content.contact) !==
      JSON.stringify(original.parsed_content.contact)) {
    errors.push('AI modified contact information');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

## 4. REACT COMPONENTS

### Component Hierarchy
```
app/adapt-resume/page.tsx (Route)
  └─> ResumeAdaptationFlow (Container)
       ├─> PrerequisitesCheck (Guard)
       ├─> AdaptationCTA (Button + Loading)
       ├─> AdaptedResumePreview (Display)
       │    ├─> ATSScoreDisplay (Circular Progress)
       │    ├─> ChangesSummary (Stats)
       │    ├─> SummarySection (Highlighted keywords)
       │    ├─> ExperienceSection (Reordered, reformulated)
       │    └─> SkillsSection (Reordered)
       └─> ActionButtons (Next steps)
```

### Component Specifications

#### 1. `/app/adapt-resume/page.tsx` (Route)
**Purpose:** Next.js 15 App Router page component
**Responsibilities:**
- Metadata (title, description)
- Render ResumeAdaptationFlow
- No business logic (presentational wrapper)

**Code:**
```typescript
import ResumeAdaptationFlow from '@/components/ResumeAdaptationFlow';

export const metadata = {
  title: 'Adapt Resume - MockMaster',
  description: 'AI-powered resume adaptation to match job requirements',
};

export default function AdaptResumePage() {
  return <ResumeAdaptationFlow />;
}
```

#### 2. `ResumeAdaptationFlow.tsx` (Main Container)
**Purpose:** Orchestrates the entire adaptation flow
**State:**
```typescript
const [isAdapting, setIsAdapting] = useState(false);
const [progress, setProgress] = useState<string>('');
const [adaptedResume, setAdaptedResume] = useState<AdaptedResume | null>(null);
const [error, setError] = useState<string | null>(null);
```

**Key Functions:**
```typescript
const checkPrerequisites = (): { resume: ResumeData | null; jobAnalysis: JobAnalysis | null } => {
  const resume = resumeStorage.getResume();
  const jobAnalysis = jobAnalysisStorage.get();
  return { resume, jobAnalysis };
};

const handleAdaptResume = async () => {
  setIsAdapting(true);
  setError(null);
  setProgress('Analyzing resume...');

  try {
    const { resume, jobAnalysis } = checkPrerequisites();
    if (!resume || !jobAnalysis) {
      throw new Error('Missing prerequisites');
    }

    setProgress('Matching keywords...');
    const response = await fetch('/api/adapt-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobAnalysis }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to adapt resume');
    }

    setProgress('Reformulating content...');
    const data: AdaptedResume = await response.json();

    // Validate no hallucination
    const validation = validateNoHallucination(resume, data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    setProgress('Done!');
    adaptedResumeStorage.save(data);
    setAdaptedResume(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setIsAdapting(false);
    setProgress('');
  }
};
```

**Render Logic:**
```typescript
const { resume, jobAnalysis } = checkPrerequisites();

if (!resume) {
  return <PrerequisitesMissing type="resume" redirectTo="/" />;
}

if (!jobAnalysis) {
  return <PrerequisitesMissing type="job" redirectTo="/analyze-job" />;
}

if (adaptedResume) {
  return (
    <>
      <AdaptedResumePreview resume={adaptedResume} original={resume} />
      <ActionButtons />
    </>
  );
}

return (
  <>
    <AdaptationCTA onAdapt={handleAdaptResume} isLoading={isAdapting} progress={progress} />
    {error && <ErrorDisplay error={error} onRetry={handleAdaptResume} />}
  </>
);
```

#### 3. `AdaptedResumePreview.tsx` (Display Component)
**Purpose:** Shows adapted resume with highlights
**Props:**
```typescript
interface AdaptedResumePreviewProps {
  resume: AdaptedResume;
  original: ResumeData;
}
```

**Features:**
- Side-by-side comparison (optional, for large screens)
- Highlighted changes (keywords in bold, reformulated bullets in different color)
- Collapsible sections (Summary, Experience, Education, Skills)
- Responsive design (mobile stacks vertically)

#### 4. `ATSScoreDisplay.tsx` (Score Visualization)
**Purpose:** Circular progress bar for ATS score
**Props:**
```typescript
interface ATSScoreDisplayProps {
  score: number;  // 0-100
}
```

**Styling:**
- Green: score >= 70
- Yellow: 50 <= score < 70
- Red: score < 50
- Circular SVG progress bar
- Animated on mount (0 → final score, 1 second transition)

#### 5. `ActionButtons.tsx` (Next Steps)
**Purpose:** Navigation after adaptation
**Buttons:**
```typescript
<div className="action-buttons">
  <button onClick={handleDownloadPDF} className="btn-primary">
    Download PDF
  </button>
  <button onClick={handleEditFirst} className="btn-secondary">
    Edit Before Download
  </button>
  <button onClick={handleStartOver} className="btn-tertiary">
    Start Over
  </button>
</div>
```

**Handlers:**
```typescript
const handleDownloadPDF = () => {
  // Future: F-006 PDF export
  router.push('/export-pdf');
};

const handleEditFirst = () => {
  // Future: F-012 manual editing
  router.push('/edit-resume');
};

const handleStartOver = () => {
  if (confirm('This will delete all data. Are you sure?')) {
    resumeStorage.deleteResume();
    jobAnalysisStorage.delete();
    adaptedResumeStorage.delete();
    router.push('/');
  }
};
```

## 5. TESTS

### Unit Tests (`__tests__/adapted-resume-storage.test.ts`)

**Test Suite 1: localStorage Operations**
```typescript
describe('AdaptedResumeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves adapted resume to localStorage', () => {
    const mockData: AdaptedResume = { /* ... */ };
    adaptedResumeStorage.save(mockData);

    const retrieved = adaptedResumeStorage.get();
    expect(retrieved).toEqual(mockData);
  });

  test('returns null when no data exists', () => {
    const result = adaptedResumeStorage.get();
    expect(result).toBeNull();
  });

  test('deletes adapted resume', () => {
    const mockData: AdaptedResume = { /* ... */ };
    adaptedResumeStorage.save(mockData);
    adaptedResumeStorage.delete();

    expect(adaptedResumeStorage.has()).toBe(false);
  });

  test('handles corrupted data gracefully', () => {
    localStorage.setItem('mockmaster_adapted_resume', 'invalid json');
    const result = adaptedResumeStorage.get();
    expect(result).toBeNull();
  });
});
```

### Unit Tests (`__tests__/validation.test.ts`)

**Test Suite 2: Anti-Hallucination Validation**
```typescript
describe('validateNoHallucination', () => {
  const originalResume: ResumeData = {
    /* mock resume with 3 experiences */
  };

  test('passes validation for legitimate adaptation', () => {
    const adapted: AdaptedResume = {
      /* adapted with same companies, reordered */
    };

    const result = validateNoHallucination(originalResume, adapted);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('fails when AI adds fake company', () => {
    const adapted: AdaptedResume = {
      /* includes "FakeCompany Inc" not in original */
    };

    const result = validateNoHallucination(originalResume, adapted);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(expect.stringContaining('FakeCompany Inc'));
  });

  test('fails when experience count exceeds original', () => {
    const adapted: AdaptedResume = {
      /* 4 experiences vs 3 in original */
    };

    const result = validateNoHallucination(originalResume, adapted);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(expect.stringContaining('added fake experiences'));
  });

  test('fails when contact info is modified', () => {
    const adapted: AdaptedResume = {
      /* contact email changed */
    };

    const result = validateNoHallucination(originalResume, adapted);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(expect.stringContaining('contact information'));
  });
});
```

### Integration Tests (`__tests__/adapt-resume-api.test.ts`)

**Test Suite 3: API Endpoint**
```typescript
describe('POST /api/adapt-resume', () => {
  test('successfully adapts resume with valid inputs', async () => {
    const mockResume: ResumeData = { /* ... */ };
    const mockJobAnalysis: JobAnalysis = { /* ... */ };

    const response = await fetch('/api/adapt-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume: mockResume, jobAnalysis: mockJobAnalysis }),
    });

    expect(response.status).toBe(200);
    const data: AdaptedResume = await response.json();
    expect(data).toHaveProperty('adapted_content');
    expect(data).toHaveProperty('ats_score');
    expect(data.ats_score).toBeGreaterThanOrEqual(0);
    expect(data.ats_score).toBeLessThanOrEqual(100);
  });

  test('returns 400 when resume is missing', async () => {
    const response = await fetch('/api/adapt-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobAnalysis: {} }),
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.code).toBe('MISSING_RESUME');
  });

  test('returns 400 when job analysis is missing', async () => {
    const response = await fetch('/api/adapt-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume: {} }),
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.code).toBe('MISSING_JOB_ANALYSIS');
  });
});
```

### Integration Test (`__tests__/adapt-resume-flow.test.ts`)

**Test Suite 4: Complete User Flow**
```typescript
describe('Resume Adaptation Flow', () => {
  test('complete flow: upload → analyze → adapt → preview', async () => {
    // Step 1: Upload resume (F-002)
    const resume: ResumeData = { /* mock */ };
    resumeStorage.saveResume(resume);

    // Step 2: Analyze job (F-003)
    const jobAnalysis: JobAnalysis = { /* mock */ };
    jobAnalysisStorage.save(jobAnalysis);

    // Step 3: Adapt resume (F-004)
    const response = await fetch('/api/adapt-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobAnalysis }),
    });

    expect(response.status).toBe(200);
    const adapted: AdaptedResume = await response.json();

    // Step 4: Verify adapted content
    expect(adapted.adapted_content.summary).toBeTruthy();
    expect(adapted.adapted_content.experience.length).toBeGreaterThan(0);
    expect(adapted.ats_score).toBeGreaterThan(0);

    // Step 5: Save to localStorage
    adaptedResumeStorage.save(adapted);
    const retrieved = adaptedResumeStorage.get();
    expect(retrieved).toEqual(adapted);
  });
});
```

### Test Coverage Goals
- **Unit Tests:** >80% code coverage
- **Integration Tests:** All critical paths (happy path + 3 error scenarios)
- **Manual Tests:** Desktop (3 browsers) + Mobile (2 devices)

## 6. MANUAL TEST CHECKLIST

### Desktop Testing (Chrome, Firefox, Safari)

**Test Case 1: Happy Path - Complete Adaptation**
- [ ] Navigate to /adapt-resume
- [ ] Verify prerequisites check runs (resume + job analysis present)
- [ ] Click "Generate Adapted Resume"
- [ ] Verify loading state shows progress messages
- [ ] Verify API completes in <30 seconds
- [ ] Verify adapted resume displays with:
  - [ ] Summary includes job keywords
  - [ ] Experiences reordered by relevance
  - [ ] Bullets reformulated with matching skills
  - [ ] ATS score displayed (circular progress)
  - [ ] Changes summary shows stats
- [ ] Verify localStorage contains adapted resume
- [ ] Verify no console errors

**Test Case 2: Missing Prerequisites**
- [ ] Clear localStorage
- [ ] Navigate to /adapt-resume
- [ ] Verify redirect to "/" with "Upload resume first" message
- [ ] Upload resume, clear job analysis
- [ ] Navigate to /adapt-resume
- [ ] Verify redirect to "/analyze-job" with "Analyze job first" message

**Test Case 3: Error Handling**
- [ ] Simulate Claude API error (disconnect internet mid-request)
- [ ] Verify error message displays
- [ ] Verify "Retry" button appears
- [ ] Click retry, verify works when connection restored

**Test Case 4: Adaptation Quality**
- [ ] Use real resume + real job description
- [ ] Verify summary includes 3-5 job keywords
- [ ] Verify experience order makes sense (relevant first)
- [ ] Verify bullets are more compelling (action verbs)
- [ ] Verify ATS score is reasonable (±10 points expected)
- [ ] Verify NO information invented (manual review)

### Mobile Testing (iOS Safari, Android Chrome)

**Test Case 5: Mobile Responsive Design**
- [ ] Open /adapt-resume on mobile
- [ ] Verify layout stacks vertically
- [ ] Verify buttons are tappable (min 44px)
- [ ] Verify text is readable (min 16px font)
- [ ] Verify loading spinner displays correctly
- [ ] Verify ATS score circular progress scales properly
- [ ] Verify adapted resume sections are collapsible

**Test Case 6: Mobile Performance**
- [ ] Verify API call completes in <30 seconds on mobile
- [ ] Verify no UI jank during adaptation
- [ ] Verify localStorage saves/retrieves correctly
- [ ] Verify back button works (React Router navigation)

### Edge Cases

**Test Case 7: Long Resume (>2000 words)**
- [ ] Upload 3-page resume
- [ ] Verify adaptation doesn't timeout
- [ ] Verify localStorage doesn't exceed quota
- [ ] Verify adapted resume renders correctly

**Test Case 8: Skills Not Matching**
- [ ] Use resume with Python, GCP
- [ ] Use job requiring Java, AWS
- [ ] Verify ATS score is low (<30)
- [ ] Verify AI doesn't add Java/AWS to resume
- [ ] Verify changes summary is accurate

**Test Case 9: Re-adaptation (New Job)**
- [ ] Complete adaptation for Job A
- [ ] Analyze new job description (Job B)
- [ ] Navigate to /adapt-resume
- [ ] Verify warning: "Replace previous adaptation?"
- [ ] Click confirm, verify new adaptation overwrites old one
- [ ] Verify localStorage only contains latest adaptation

**Test Case 10: Concurrent Adaptations (Race Condition)**
- [ ] Click "Generate Adapted Resume" twice rapidly
- [ ] Verify only one API call is made
- [ ] Verify UI is disabled during processing
- [ ] Verify no duplicate entries in localStorage

## 7. DEPLOYMENT CHECKLIST

### Pre-Deployment (Local Environment)

**Code Quality:**
- [ ] All TypeScript types defined (no `any`)
- [ ] All functions have JSDoc comments
- [ ] No console.log (use proper error handling)
- [ ] No hardcoded values (use environment variables)
- [ ] All components use "use client" directive appropriately
- [ ] No unused imports or variables

**Testing:**
- [ ] All unit tests pass (`npm test`)
- [ ] Integration tests pass
- [ ] Manual tests complete (desktop + mobile)
- [ ] Test coverage >80%
- [ ] No TypeScript errors (`npm run build`)

**Environment Variables:**
- [ ] ANTHROPIC_API_KEY is set in .env.local
- [ ] .env.local.example updated with new variables
- [ ] .env.local is in .gitignore (security)

### Staging Deployment

**Vercel Deployment:**
- [ ] Push to `staging` branch
- [ ] Verify Vercel auto-deploys
- [ ] Set ANTHROPIC_API_KEY in Vercel environment variables
- [ ] Verify staging URL is accessible

**Staging Smoke Tests:**
- [ ] Upload resume on staging
- [ ] Analyze job on staging
- [ ] Adapt resume on staging
- [ ] Verify adapted resume displays correctly
- [ ] Verify localStorage persists across page reloads
- [ ] Verify API response time <30 seconds
- [ ] Check browser console for errors
- [ ] Check Vercel logs for API errors

**Performance Validation:**
- [ ] Lighthouse score >90 (Performance)
- [ ] Lighthouse score >95 (Accessibility)
- [ ] Lighthouse score >90 (Best Practices)
- [ ] Mobile performance acceptable

### Production Deployment

**Pre-Production:**
- [ ] All staging tests pass
- [ ] Code reviewed (if team exists)
- [ ] Product owner approval (if applicable)

**Production Deployment:**
- [ ] Merge to `main` branch
- [ ] Verify Vercel auto-deploys to production
- [ ] Verify ANTHROPIC_API_KEY set in production environment
- [ ] Verify production URL is accessible

**Production Smoke Tests:**
- [ ] Upload resume on production
- [ ] Analyze job on production
- [ ] Adapt resume on production
- [ ] Verify adapted resume displays correctly
- [ ] Verify all features work as expected
- [ ] Monitor Vercel logs for first 10 minutes

**Post-Deployment Monitoring:**
- [ ] Monitor Claude API costs (first day)
- [ ] Check error rate in Vercel logs
- [ ] Verify user feedback (if available)
- [ ] Update plan.md: Mark F-004 as DONE ✅

### Rollback Plan

**If Critical Issues Occur:**
1. Revert to previous Vercel deployment (instant rollback)
2. Fix issues locally
3. Re-test in staging
4. Re-deploy to production

**Rollback Triggers:**
- API error rate >10%
- Response time >60 seconds
- Claude API costs exceed budget
- Hallucination detection failing

## 8. DEPENDENCIES AND INTEGRATIONS

### Upstream Dependencies (Required)
- **F-002 (Resume Upload):** Reads `mockmaster_resume` from localStorage
- **F-003 (Job Analysis):** Reads `mockmaster_job_analysis` from localStorage

### Downstream Integrations (Future)
- **F-005 (ATS Score):** Will reuse ATS scoring logic from this feature
- **F-006 (PDF Export):** Will read `mockmaster_adapted_resume` from localStorage
- **F-012 (Manual Edit):** Will allow editing adapted resume before export

### External APIs
- **Claude API (Anthropic):**
  - Model: `claude-sonnet-4-5-20250929`
  - Max tokens: 8,000
  - Temperature: 0.3 (slight creativity for reformulation)
  - Expected cost: $0.05-0.15 per adaptation

### Browser APIs
- **localStorage:** For persisting adapted resume (5-10MB quota)
- **Fetch API:** For API calls

## 9. SECURITY CONSIDERATIONS

### Data Privacy
- **No server-side storage:** All data in localStorage (user's browser)
- **No tracking:** No analytics, no telemetry
- **No PII leakage:** Resume data never logged or persisted server-side

### API Security
- **Rate limiting:** None yet (MVP), but should be added in post-MVP
- **Input validation:** Validate resume + job analysis structure
- **Output validation:** Anti-hallucination checks prevent malicious AI outputs
- **API key security:** ANTHROPIC_API_KEY in environment variables (never in code)

### XSS Protection
- **React auto-escaping:** All user content rendered via React (automatic escaping)
- **No dangerouslySetInnerHTML:** Never used
- **Content Security Policy:** Consider adding in production

## 10. PERFORMANCE OPTIMIZATION

### API Optimization
- **Caching:** No caching (MVP) - each adaptation is unique
- **Token optimization:** Minimize prompt size, only send necessary data
- **Timeout handling:** 60 second timeout to prevent hanging requests

### Frontend Optimization
- **Code splitting:** Next.js automatic code splitting
- **Lazy loading:** Load AdaptedResumePreview only after adaptation
- **Memoization:** Use React.memo for expensive components
- **Debouncing:** N/A (no real-time inputs)

### localStorage Optimization
- **Size monitoring:** Check storage size before save
- **Compression:** Consider LZ-string compression if quota issues arise (post-MVP)
- **Cleanup:** Warn user if approaching quota

## 11. MONITORING AND LOGGING

### Error Tracking (Development)
- **Console errors:** Log all API errors with details
- **Validation errors:** Log hallucination detection failures
- **localStorage errors:** Log quota exceeded errors

### Metrics to Track (Post-MVP)
- **Adaptation success rate:** % of successful adaptations
- **API response time:** p50, p95, p99
- **ATS score distribution:** Histogram of scores
- **Claude API costs:** Daily/weekly spend
- **Hallucination detection rate:** % of validations that fail

### User Feedback (Future)
- **Thumbs up/down:** Did the adaptation help?
- **ATS score accuracy:** Was the score accurate?
- **Quality rating:** 1-5 stars for adaptation quality

## 12. KNOWN LIMITATIONS (MVP)

1. **Single resume per browser:** localStorage limited to 1 resume
2. **No version history:** Each new adaptation overwrites the previous
3. **No undo:** Can't revert to original after adaptation
4. **No manual skill addition:** AI won't add missing skills (by design)
5. **ATS score is estimate:** Not validated against real ATS systems
6. **30 second wait time:** Claude API is slow, no way to speed up
7. **No offline support:** Requires internet for Claude API
8. **No collaboration:** Can't share adaptations with others

## 13. POST-MVP ENHANCEMENTS

**Phase 2 (Week 4-6):**
- Multiple resume storage (database)
- Adaptation history (version control)
- Side-by-side comparison UI
- Manual override for AI changes
- Confidence score for each change

**Phase 3 (Week 7-9):**
- Real-time preview (streaming API)
- A/B testing (multiple adaptation strategies)
- ATS score validation (test against real ATS)
- Bulk adaptations (multiple jobs)
- Export to LinkedIn, Indeed, etc.

---

**Architecture Approved:** [Pending]
**Implementation Start Date:** 2026-01-25
**Estimated Completion:** 2026-01-27
**Feature Owner:** AI Resume Adaptation Team

# ARCHITECTURE: F-005 - ATS Compatibility Score with Detailed Breakdown

**Feature:** F-005 - ATS Compatibility Score with Detailed Breakdown
**Priority:** P0 (MVP - FINAL MVP FEATURE)
**RICE Score:** 200
**Effort:** 1 week (5 days)
**Dependencies:** F-003 (Job Analysis), F-004 (AI Resume Adaptation)

## 1. USER FLOW

### Happy Path - High Score (70-100)
1. User completes resume adaptation (F-004)
2. System displays adapted resume with basic ATS score (already exists)
3. User sees **circular gauge with score 85/100** and "Strong Match" label
4. User clicks **"See Details"** button
5. Breakdown panel expands showing:
   - Keyword Match: 85/100 (17/20 keywords found)
   - Skills Match: 90/100 (9/10 required skills present)
   - Experience Match: 85/100 (Relevant experience for seniority level)
   - Format Score: 100/100 (ATS-friendly formatting)
6. User sees **missing keywords** list: "Kubernetes", "CI/CD"
7. User sees **actionable suggestions**: "Consider adding 'Kubernetes' if you have container orchestration experience"
8. User feels confident and proceeds to download PDF

### Medium Score Path (50-69)
1. User sees score 62/100 with "Good Match" label (yellow)
2. Expands breakdown to see gaps
3. Sees 3-5 missing keywords with frequency from job description
4. Reads suggestions for improvement
5. Can optionally edit resume to add missing keywords (F-012)
6. Downloads PDF anyway (still usable)

### Low Score Path (<50)
1. User sees score 35/100 with "Needs Work" label (red)
2. Expands breakdown showing significant gaps
3. Sees many missing keywords (10+)
4. Sees warning: "Significant keyword gaps detected"
5. Understands this resume-job pairing has low match
6. Can still download but is informed of mismatch

## 2. DATABASE

**No new database tables required - localStorage only (MVP)**

### Updated Types in `lib/types.ts`

```typescript
/**
 * Detailed breakdown of ATS score components
 * Feature: F-005
 */
export interface ATSScoreBreakdown {
  // Component scores (0-100 each)
  total_score: number;           // Weighted average of all components
  keyword_score: number;         // How many job keywords appear in resume
  skills_score: number;          // Required skills match rate
  experience_score: number;      // Relevance of experience (AI-scored)
  format_score: number;          // Always 100 (our templates are ATS-friendly)

  // Keyword details
  keywords_matched: number;      // e.g., 17
  keywords_total: number;        // e.g., 20
  missing_keywords: string[];    // Top 10 missing keywords with frequency

  // Skills details
  skills_matched: string[];      // ["Python", "AWS", "Docker"]
  skills_missing: string[];      // ["Kubernetes", "Terraform"]

  // Actionable suggestions
  suggestions: string[];         // Max 5 suggestions for improvement
}

/**
 * Enhanced AdaptedResume type with breakdown
 */
export interface AdaptedResume {
  original_resume_hash: string;
  job_analysis_hash: string;
  adapted_content: AdaptedContent;
  ats_score: number;                    // Keep for backwards compatibility
  ats_breakdown?: ATSScoreBreakdown;    // NEW: Detailed breakdown (optional for migration)
  changes_summary: ChangesSummary;
  adapted_at: string;
}
```

### localStorage Schema Update

**Key:** `mockmaster_adapted_resume`

**Value (Enhanced):**
```json
{
  "original_resume_hash": "abc123",
  "job_analysis_hash": "def456",
  "adapted_content": { ... },
  "ats_score": 85,
  "ats_breakdown": {
    "total_score": 85,
    "keyword_score": 85,
    "skills_score": 90,
    "experience_score": 85,
    "format_score": 100,
    "keywords_matched": 17,
    "keywords_total": 20,
    "missing_keywords": ["Kubernetes", "CI/CD", "Docker"],
    "skills_matched": ["Python", "AWS", "React"],
    "skills_missing": ["Kubernetes", "Terraform"],
    "suggestions": [
      "Consider adding 'Kubernetes' if you have container orchestration experience",
      "Mention 'CI/CD pipeline' in your DevOps experience bullets"
    ]
  },
  "changes_summary": { ... },
  "adapted_at": "2026-01-26T..."
}
```

## 3. API ENDPOINTS

### NEW: POST /api/calculate-ats-breakdown

**Purpose:** Calculate detailed ATS score breakdown from adapted resume and job analysis.

**Request:**
```typescript
{
  adapted_content: AdaptedContent;
  job_analysis: JobAnalysis;
}
```

**Response (Success - 200):**
```typescript
{
  breakdown: ATSScoreBreakdown;
}
```

**Response (Error - 400/500):**
```typescript
{
  error: string;
  code: 'INVALID_INPUT' | 'MISSING_DATA' | 'CLAUDE_API_ERROR' | 'INTERNAL_ERROR';
}
```

**Implementation:** `app/api/calculate-ats-breakdown/route.ts`

### Algorithm Details

#### 1. Keyword Extraction and Matching (35% weight)

**Extract Keywords from Job Description:**
```typescript
function extractKeywords(jobAnalysis: JobAnalysis): string[] {
  // Combine job title, required skills, responsibilities
  const text = [
    jobAnalysis.analysis.job_title,
    ...jobAnalysis.analysis.required_skills,
    ...jobAnalysis.analysis.responsibilities,
    ...jobAnalysis.analysis.preferred_skills,
  ].join(' ');

  // Use simple frequency-based extraction
  // Filter out common words (stop words)
  // Return top 20 keywords by frequency

  return topKeywords; // e.g., ["Python", "AWS", "Docker", ...]
}
```

**Match Keywords in Resume:**
```typescript
function matchKeywords(
  keywords: string[],
  adaptedContent: AdaptedContent
): { matched: number; missing: string[] } {
  const resumeText = [
    adaptedContent.summary,
    ...adaptedContent.experience.flatMap(exp => exp.bullets),
    ...adaptedContent.skills,
  ].join(' ').toLowerCase();

  let matched = 0;
  const missing: string[] = [];

  keywords.forEach(keyword => {
    if (resumeText.includes(keyword.toLowerCase())) {
      matched++;
    } else {
      missing.push(keyword);
    }
  });

  return { matched, missing };
}
```

**Calculate Score:**
```typescript
const keyword_score = (matched / total_keywords) * 100;
```

#### 2. Skills Matching (35% weight)

**Match Required Skills:**
```typescript
function matchSkills(
  requiredSkills: string[],
  adaptedContent: AdaptedContent
): { matched: string[]; missing: string[] } {
  const resumeSkills = adaptedContent.skills.map(s => s.toLowerCase());

  // Also check experience bullets for skills
  const experienceText = adaptedContent.experience
    .flatMap(exp => exp.bullets)
    .join(' ')
    .toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (
      resumeSkills.includes(skillLower) ||
      experienceText.includes(skillLower)
    ) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  return { matched, missing };
}
```

**Calculate Score:**
```typescript
const skills_score = requiredSkills.length === 0
  ? 100
  : (matched.length / requiredSkills.length) * 100;
```

#### 3. Experience Scoring via Claude API (20% weight)

**Use Claude to Score Experience Relevance:**
```typescript
async function scoreExperience(
  adaptedContent: AdaptedContent,
  jobAnalysis: JobAnalysis
): Promise<number> {
  const prompt = `You are an ATS scoring expert. Rate the following resume experience for relevance to this job on a 0-100 scale.

JOB REQUIREMENTS:
Job Title: ${jobAnalysis.analysis.job_title}
Seniority: ${jobAnalysis.analysis.seniority_level}
Required Skills: ${jobAnalysis.analysis.required_skills.join(', ')}
Responsibilities: ${jobAnalysis.analysis.responsibilities.join(', ')}

RESUME EXPERIENCE:
${JSON.stringify(adaptedContent.experience, null, 2)}

Rate 0-100:
- 90-100: Perfect match (same role, same seniority, all key skills)
- 70-89: Strong match (related role, appropriate seniority, most skills)
- 50-69: Moderate match (transferable skills, some relevance)
- 30-49: Weak match (limited overlap)
- 0-29: Poor match (different field entirely)

Return ONLY a number between 0 and 100.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 50,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });

  const scoreText = message.content[0].text.trim();
  const score = parseInt(scoreText);
  return Math.max(0, Math.min(100, score)); // Clamp to 0-100
}
```

#### 4. Format Score (10% weight)

**Always 100 for Our Templates:**
```typescript
const format_score = 100;
// Our templates are always ATS-friendly:
// - Standard section headers
// - No tables, images, or columns
// - Plain text parsing-friendly
```

#### 5. Calculate Total Score

**Weighted Average:**
```typescript
const total_score = Math.round(
  keyword_score * 0.35 +
  skills_score * 0.35 +
  experience_score * 0.20 +
  format_score * 0.10
);
```

#### 6. Generate Suggestions

**Based on Missing Keywords/Skills:**
```typescript
function generateSuggestions(
  missingKeywords: string[],
  missingSkills: string[]
): string[] {
  const suggestions: string[] = [];

  // Top 3 missing keywords
  missingKeywords.slice(0, 3).forEach(keyword => {
    suggestions.push(
      `Consider adding "${keyword}" if you have relevant experience`
    );
  });

  // Top 2 missing skills
  missingSkills.slice(0, 2).forEach(skill => {
    suggestions.push(
      `Include "${skill}" in your skills section or experience bullets if applicable`
    );
  });

  return suggestions.slice(0, 5); // Max 5 suggestions
}
```

### Security Considerations

- No authentication required (client-side only)
- Rate limiting: Same as other API routes (Vercel default)
- Input validation: Check required fields exist
- Sanitize output: Prevent XSS in suggestions

## 4. REACT COMPONENTS

### Enhanced: `components/ATSScoreDisplay.tsx`

**Current State (F-004):**
- Shows circular gauge with animated score
- Color-coded (green/yellow/red)
- Shows label ("Strong Match" / "Good Match" / "Needs Work")

**Enhanced State (F-005):**
- Add collapsible breakdown panel below gauge
- Show 4 category scores with progress bars
- Display missing keywords (max 10)
- Display actionable suggestions (max 5)
- Add "See Details" / "Hide Details" toggle button

**Props Interface:**
```typescript
interface ATSScoreDisplayProps {
  score: number; // 0-100 (basic score, always shown)
  breakdown?: ATSScoreBreakdown; // Detailed breakdown (optional)
  size?: number; // Circle diameter (default: 150)
  strokeWidth?: number; // Progress bar thickness (default: 12)
}
```

**State Management:**
```typescript
const [isExpanded, setIsExpanded] = useState(false);
```

**Component Structure:**
```tsx
<div className="space-y-4">
  {/* Existing: Circular Gauge */}
  <div className="flex flex-col items-center gap-3">
    <CircularGauge score={score} />
    <Label score={score} />
  </div>

  {/* NEW: Toggle Button */}
  {breakdown && (
    <button onClick={() => setIsExpanded(!isExpanded)}>
      {isExpanded ? '▲ Hide Details' : '▼ See Details'}
    </button>
  )}

  {/* NEW: Breakdown Panel (Collapsible) */}
  {breakdown && isExpanded && (
    <div className="breakdown-panel">
      <h3>Score Breakdown</h3>

      {/* Category Scores */}
      <CategoryScore
        label="Keyword Match"
        score={breakdown.keyword_score}
        detail={`${breakdown.keywords_matched}/${breakdown.keywords_total} found`}
      />
      <CategoryScore
        label="Skills Match"
        score={breakdown.skills_score}
        detail={`${breakdown.skills_matched.length} matched`}
      />
      <CategoryScore
        label="Experience Match"
        score={breakdown.experience_score}
        detail="Relevant experience"
      />
      <CategoryScore
        label="Format Score"
        score={breakdown.format_score}
        detail="ATS-friendly"
      />

      {/* Missing Keywords */}
      {breakdown.missing_keywords.length > 0 && (
        <div className="missing-keywords">
          <h4>Missing Keywords</h4>
          <ul>
            {breakdown.missing_keywords.slice(0, 10).map(keyword => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {breakdown.suggestions.length > 0 && (
        <div className="suggestions">
          <h4>Suggestions</h4>
          <ul>
            {breakdown.suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )}
</div>
```

### Sub-Component: CategoryScore

**Purpose:** Display individual category score with progress bar

**Props:**
```typescript
interface CategoryScoreProps {
  label: string;
  score: number; // 0-100
  detail: string;
}
```

**Implementation:**
```tsx
<div className="category-score">
  <div className="flex justify-between mb-1">
    <span className="font-medium">{label}: {score}/100</span>
    <span className="text-sm text-gray-600">{detail}</span>
  </div>
  <div className="progress-bar-container">
    <div
      className="progress-bar"
      style={{ width: `${score}%`, backgroundColor: getColor(score) }}
    />
  </div>
</div>
```

### Integration: `components/AdaptedResumePreview.tsx`

**Update ATSScoreDisplay Usage:**
```tsx
<ATSScoreDisplay
  score={ats_score}
  breakdown={resume.ats_breakdown} // NEW: Pass breakdown if available
/>
```

## 5. TESTS

### Unit Tests: `__tests__/ats-breakdown.test.ts`

**Test Keyword Extraction:**
```typescript
describe('extractKeywords', () => {
  test('extracts top 20 keywords from job analysis', () => {
    const jobAnalysis = createMockJobAnalysis();
    const keywords = extractKeywords(jobAnalysis);

    expect(keywords).toHaveLength(20);
    expect(keywords[0]).toBe('Python'); // Most frequent
  });

  test('filters out stop words', () => {
    const keywords = extractKeywords(mockJobWithStopWords);

    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('and');
  });
});
```

**Test Keyword Matching:**
```typescript
describe('matchKeywords', () => {
  test('matches keywords case-insensitively', () => {
    const keywords = ['Python', 'AWS', 'Docker'];
    const content = createMockContent('python aws docker');

    const result = matchKeywords(keywords, content);

    expect(result.matched).toBe(3);
    expect(result.missing).toHaveLength(0);
  });

  test('identifies missing keywords', () => {
    const keywords = ['Python', 'AWS', 'Kubernetes'];
    const content = createMockContent('python aws');

    const result = matchKeywords(keywords, content);

    expect(result.matched).toBe(2);
    expect(result.missing).toEqual(['Kubernetes']);
  });
});
```

**Test Skills Matching:**
```typescript
describe('matchSkills', () => {
  test('matches skills from skills section', () => {
    const requiredSkills = ['Python', 'AWS'];
    const content = { skills: ['Python', 'AWS', 'React'] };

    const result = matchSkills(requiredSkills, content);

    expect(result.matched).toEqual(['Python', 'AWS']);
    expect(result.missing).toHaveLength(0);
  });

  test('matches skills mentioned in experience bullets', () => {
    const requiredSkills = ['Docker'];
    const content = {
      skills: ['Python'],
      experience: [{ bullets: ['Used Docker for containerization'] }]
    };

    const result = matchSkills(requiredSkills, content);

    expect(result.matched).toEqual(['Docker']);
  });

  test('handles empty required skills', () => {
    const result = matchSkills([], mockContent);

    expect(result.matched).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });
});
```

**Test Score Calculation:**
```typescript
describe('calculateTotalScore', () => {
  test('calculates weighted average correctly', () => {
    const scores = {
      keyword_score: 80,
      skills_score: 90,
      experience_score: 70,
      format_score: 100,
    };

    const total = calculateTotalScore(scores);

    // 80*0.35 + 90*0.35 + 70*0.20 + 100*0.10 = 83.5 -> 84
    expect(total).toBe(84);
  });
});
```

**Test Suggestion Generation:**
```typescript
describe('generateSuggestions', () => {
  test('generates suggestions for missing keywords', () => {
    const missing = ['Kubernetes', 'CI/CD'];

    const suggestions = generateSuggestions(missing, []);

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toContain('Kubernetes');
  });

  test('limits suggestions to 5', () => {
    const missing = ['K8s', 'Docker', 'Terraform', 'CI/CD', 'Jenkins', 'Ansible'];

    const suggestions = generateSuggestions(missing, []);

    expect(suggestions.length).toBeLessThanOrEqual(5);
  });
});
```

### Integration Tests: `__tests__/ats-breakdown-api.test.ts`

**Test API Endpoint:**
```typescript
describe('POST /api/calculate-ats-breakdown', () => {
  test('returns breakdown for valid input', async () => {
    const response = await fetch('/api/calculate-ats-breakdown', {
      method: 'POST',
      body: JSON.stringify({
        adapted_content: mockAdaptedContent,
        job_analysis: mockJobAnalysis,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.breakdown.total_score).toBeGreaterThanOrEqual(0);
    expect(data.breakdown.total_score).toBeLessThanOrEqual(100);
    expect(data.breakdown.keyword_score).toBeDefined();
    expect(data.breakdown.skills_score).toBeDefined();
  });

  test('returns 400 for missing input', async () => {
    const response = await fetch('/api/calculate-ats-breakdown', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
  });
});
```

### Component Tests: `__tests__/ATSScoreDisplay.test.tsx`

**Test Breakdown Panel Toggle:**
```typescript
describe('ATSScoreDisplay', () => {
  test('shows "See Details" button when breakdown provided', () => {
    render(<ATSScoreDisplay score={85} breakdown={mockBreakdown} />);

    expect(screen.getByText(/See Details/i)).toBeInTheDocument();
  });

  test('expands breakdown on button click', () => {
    render(<ATSScoreDisplay score={85} breakdown={mockBreakdown} />);

    const button = screen.getByText(/See Details/i);
    fireEvent.click(button);

    expect(screen.getByText(/Keyword Match/i)).toBeInTheDocument();
    expect(screen.getByText(/Missing Keywords/i)).toBeInTheDocument();
  });

  test('hides breakdown when no data provided', () => {
    render(<ATSScoreDisplay score={85} />);

    expect(screen.queryByText(/See Details/i)).not.toBeInTheDocument();
  });
});
```

## 6. MANUAL TEST CHECKLIST

### Desktop Testing (Chrome, Firefox, Safari)

**High Score Scenario (70-100):**
- [ ] Gauge displays green color
- [ ] Score animates from 0 to 85
- [ ] Label shows "Strong Match"
- [ ] "See Details" button is visible
- [ ] Click button expands breakdown panel smoothly
- [ ] All 4 category scores display correctly
- [ ] Progress bars are green and proportional
- [ ] Missing keywords section is hidden (if none missing)
- [ ] Suggestions display max 5 items
- [ ] Click "Hide Details" collapses panel

**Medium Score Scenario (50-69):**
- [ ] Gauge displays yellow color
- [ ] Label shows "Good Match"
- [ ] Breakdown shows some gaps
- [ ] Missing keywords section displays 3-5 items
- [ ] Suggestions are actionable and relevant
- [ ] Progress bars show yellow for medium scores

**Low Score Scenario (<50):**
- [ ] Gauge displays red color
- [ ] Label shows "Needs Work"
- [ ] Breakdown shows significant gaps
- [ ] Missing keywords section displays 10+ items (truncated)
- [ ] Warning message is clear
- [ ] Progress bars show red for low scores

### Mobile Testing (iOS Safari, Android Chrome)

**Responsive Layout:**
- [ ] Gauge scales correctly on small screens
- [ ] Breakdown panel is readable on mobile
- [ ] Progress bars render correctly
- [ ] Missing keywords list is scrollable if long
- [ ] Toggle button is tap-friendly (44px+ touch target)
- [ ] Text is legible at all screen sizes

### Edge Cases

**No Breakdown Data:**
- [ ] Component works with just score (backwards compatible)
- [ ] No "See Details" button shown

**Empty Missing Keywords:**
- [ ] Missing keywords section is hidden
- [ ] UI looks clean without empty section

**Empty Suggestions:**
- [ ] Suggestions section is hidden
- [ ] No awkward empty space

**Perfect Score (100):**
- [ ] All progress bars are full green
- [ ] No missing keywords
- [ ] Suggestions may say "Your resume is well-optimized"

**Zero Score (0):**
- [ ] All progress bars are empty red
- [ ] Many missing keywords
- [ ] Suggestions guide user to improve significantly

## 7. DEPLOYMENT CHECKLIST

### Pre-Deployment (Staging)

**Environment Variables:**
- [ ] `ANTHROPIC_API_KEY` is set in Vercel environment
- [ ] API key has sufficient quota for Claude API calls

**Code Quality:**
- [ ] All TypeScript types are defined
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive
- [ ] All tests pass (`npm test`)

**Build Verification:**
- [ ] `npm run build` succeeds
- [ ] No build warnings
- [ ] Bundle size is acceptable

### Deployment to Staging

**Vercel Deployment:**
```bash
# Deploy to staging
vercel --prod=false

# Note the staging URL (e.g., mockmaster-abc123.vercel.app)
```

**Staging Validation:**
- [ ] Upload a resume
- [ ] Analyze a job description
- [ ] Adapt resume
- [ ] Verify ATS score displays
- [ ] Click "See Details" - breakdown loads
- [ ] Verify all scores are calculated
- [ ] Verify keywords and suggestions display
- [ ] Test on mobile (responsive)
- [ ] Check browser console for errors

**Performance Check:**
- [ ] Breakdown calculation takes < 3 seconds
- [ ] UI is responsive during calculation
- [ ] localStorage saves breakdown correctly

### Deployment to Production

**Final Checks:**
- [ ] All staging tests passed
- [ ] No critical bugs discovered
- [ ] Documentation is complete

**Production Deployment:**
```bash
# Deploy to production
vercel --prod

# Monitor deployment
vercel logs
```

**Production Validation:**
- [ ] Repeat all staging tests on production URL
- [ ] Verify Anthropic API usage is within limits
- [ ] Check Vercel analytics for errors
- [ ] Test from different devices/browsers

**Monitoring:**
- [ ] Check Vercel logs for API errors
- [ ] Monitor Anthropic API usage
- [ ] Watch for user-reported issues

### Rollback Plan

**If Critical Bug Found:**
```bash
# Rollback to previous deployment
vercel rollback
```

**Fallback Behavior:**
- Component gracefully handles missing breakdown data
- Falls back to basic score display (F-004 behavior)
- No breaking changes to existing functionality

## 8. PERFORMANCE CONSIDERATIONS

**API Call Optimization:**
- Breakdown calculation happens once per adaptation
- Result is cached in localStorage
- No recalculation on page refresh

**Bundle Size:**
- Enhanced component adds ~5KB gzipped
- Acceptable for MVP

**User Experience:**
- Loading indicator while calculating breakdown
- Progressive disclosure (collapsed by default)
- Fast animations (<300ms)

## 9. SECURITY CONSIDERATIONS

**Input Validation:**
- Validate adapted_content structure
- Validate job_analysis structure
- Sanitize keywords before displaying

**XSS Prevention:**
- Escape all user-generated suggestions
- Use React's built-in XSS protection
- No `dangerouslySetInnerHTML`

**Rate Limiting:**
- Use Vercel's default rate limiting
- Breakdown calculation is not user-triggered (happens once)

## 10. FUTURE ENHANCEMENTS (Post-MVP)

**Real-Time Scoring:**
- Recalculate breakdown after user edits (F-012)
- Show live updates as keywords are added

**Keyword Highlighting:**
- Highlight matched keywords in green
- Highlight missing keywords in yellow
- Visual feedback in resume content

**Comparison Mode:**
- Compare scores before/after adaptation
- Show improvement metrics

**Export Breakdown:**
- Include breakdown in PDF export
- Add breakdown summary to cover letter

---

**End of Architecture Document**

This architecture provides a complete blueprint for implementing F-005. All components are designed to integrate seamlessly with existing features while maintaining backwards compatibility.

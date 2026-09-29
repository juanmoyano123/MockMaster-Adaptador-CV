# Manual Testing Guide: F-004 - AI Resume Adaptation Engine

**Feature:** AI Resume Adaptation Engine
**Date:** 2026-01-25
**Tester:** [Your Name]
**Environment:** Local Development (http://localhost:3000)

## Prerequisites

Before testing, ensure:
- [ ] Node.js is installed
- [ ] Dependencies are installed (`npm install`)
- [ ] `.env.local` contains valid `ANTHROPIC_API_KEY`
- [ ] Dev server is running (`npm run dev`)

## Test Setup

1. Clear browser localStorage (DevTools > Application > Local Storage > Clear All)
2. Prepare test files:
   - A resume PDF/DOCX (your own or sample)
   - A real job description (copy from LinkedIn, Indeed, etc.)

---

## Test Suite 1: Desktop Testing

### Test Case 1.1: Happy Path - Complete Adaptation

**Environment:** Chrome Desktop

**Steps:**
1. Navigate to `http://localhost:3000`
2. Upload your resume (PDF or DOCX)
3. Wait for parsing to complete
4. Navigate to `/analyze-job`
5. Paste a job description (at least 200 words)
6. Click "Analyze Job Description"
7. Wait for analysis to complete
8. Navigate to `/adapt-resume`
9. Click "Generate Adapted Resume"
10. Wait for adaptation (should take 15-30 seconds)

**Expected Results:**
- [ ] Page shows "Generate Adapted Resume" button
- [ ] Loading spinner appears with progress messages:
  - "Analyzing resume..."
  - "Matching keywords..."
  - "Reformulating content..."
- [ ] Adaptation completes in <30 seconds
- [ ] Adapted resume displays with:
  - [ ] ATS score (circular progress, 0-100)
  - [ ] Changes summary (skills highlighted, bullets reformulated, experiences reordered)
  - [ ] Professional summary with job keywords
  - [ ] Work experiences (may be reordered)
  - [ ] Each experience has relevance score badge
  - [ ] Reformulated bullets highlighted in green
  - [ ] Skills reordered (top skills in blue)
  - [ ] Education section unchanged
  - [ ] Contact info unchanged
- [ ] Three action buttons visible:
  - "Download PDF" (primary, blue)
  - "Edit Before Download" (secondary, gray)
  - "Start Over" (tertiary, red)
- [ ] No console errors in DevTools

**Pass/Fail:** ___________

**Notes:**
```
ATS Score: _____
Skills Highlighted: _____
Bullets Reformulated: _____
Experiences Reordered: Yes / No
Time to complete: _____ seconds
```

---

### Test Case 1.2: Missing Resume (Prerequisites Check)

**Steps:**
1. Clear localStorage
2. Navigate directly to `/adapt-resume`

**Expected Results:**
- [ ] Page shows yellow warning box
- [ ] Message: "Resume Required"
- [ ] Description: "You need to upload your resume before adapting it..."
- [ ] Button: "Upload Resume" (yellow)
- [ ] Clicking button redirects to `/`

**Pass/Fail:** ___________

---

### Test Case 1.3: Missing Job Analysis (Prerequisites Check)

**Steps:**
1. Clear localStorage
2. Upload a resume (complete F-002)
3. Navigate directly to `/adapt-resume` (skip F-003)

**Expected Results:**
- [ ] Page shows blue info box
- [ ] Message: "Job Analysis Required"
- [ ] Description: "You need to analyze a job description before adapting..."
- [ ] Button: "Analyze Job Description" (blue)
- [ ] Clicking button redirects to `/analyze-job`

**Pass/Fail:** ___________

---

### Test Case 1.4: API Error Handling

**Steps:**
1. Complete F-002 and F-003
2. Navigate to `/adapt-resume`
3. Disconnect internet
4. Click "Generate Adapted Resume"
5. Wait for error

**Expected Results:**
- [ ] Error message displays in red box
- [ ] Error mentions API or network issue
- [ ] "Retry" button appears
- [ ] Reconnect internet
- [ ] Click "Retry"
- [ ] Adaptation succeeds

**Pass/Fail:** ___________

**Error Message:**
```
[Copy exact error message here]
```

---

### Test Case 1.5: Adaptation Quality - Keyword Matching

**Setup:**
- Use a real resume
- Use a job description with clear required skills (e.g., "Python, AWS, Docker, Kubernetes")

**Steps:**
1. Complete adaptation
2. Review adapted summary
3. Review adapted experience bullets
4. Review skills order

**Expected Results:**
- [ ] Summary includes 3-5 keywords from job description
- [ ] Keywords appear naturally (not forced/awkward)
- [ ] Experience bullets emphasize relevant skills
- [ ] Skills list starts with required skills from job
- [ ] ATS score is reasonable (40-90 typically)

**Pass/Fail:** ___________

**Quality Assessment:**
- Summary quality: ⭐⭐⭐⭐⭐ (1-5 stars)
- Bullet quality: ⭐⭐⭐⭐⭐
- Skill ordering: ⭐⭐⭐⭐⭐
- Overall: ⭐⭐⭐⭐⭐

**Notes:**
```
Top 5 skills in adapted resume:
1. _____________
2. _____________
3. _____________
4. _____________
5. _____________

Did they match job requirements? Yes / No
```

---

### Test Case 1.6: Anti-Hallucination Validation

**Steps:**
1. Complete adaptation
2. Compare adapted resume with original
3. Verify contact info unchanged
4. Verify education unchanged
5. Verify company names unchanged
6. Verify dates unchanged
7. Verify job titles unchanged (or minor formatting only)
8. Verify no new experiences added

**Expected Results:**
- [ ] Contact info identical to original
- [ ] Education identical to original
- [ ] All companies exist in original resume
- [ ] All dates match original (no fabrication)
- [ ] Job titles match original (minor formatting OK)
- [ ] Experience count ≤ original count
- [ ] No fake projects or achievements

**Pass/Fail:** ___________

**Verification:**
```
Original companies: _______________________
Adapted companies: _______________________
Match: Yes / No

Original titles: _______________________
Adapted titles: _______________________
Match: Yes / No
```

---

### Test Case 1.7: Experience Reordering

**Setup:**
- Use resume with 3+ work experiences
- Use job requiring specific experience (e.g., "Backend Engineer")
- Ensure most recent job is NOT the most relevant

**Steps:**
1. Complete adaptation
2. Check experience order in adapted resume
3. Compare with original order

**Expected Results:**
- [ ] Experiences reordered by relevance (not chronology)
- [ ] Most relevant experience first
- [ ] Relevance scores displayed (0-100)
- [ ] Higher scores appear first
- [ ] Changes summary shows "Experiences Reordered: Yes"

**Pass/Fail:** ___________

**Order Comparison:**
```
Original order:
1. [Company] - [Title]
2. [Company] - [Title]
3. [Company] - [Title]

Adapted order:
1. [Company] - [Title] (Relevance: ___)
2. [Company] - [Title] (Relevance: ___)
3. [Company] - [Title] (Relevance: ___)

Reordering makes sense? Yes / No
```

---

### Test Case 1.8: Re-adaptation (Overwrite Warning)

**Steps:**
1. Complete first adaptation (for Job A)
2. Verify adapted resume displays
3. Navigate to `/analyze-job`
4. Analyze a DIFFERENT job description (Job B)
5. Navigate to `/adapt-resume`
6. Click "Re-adapt Resume" link at bottom
7. Confirm in dialog

**Expected Results:**
- [ ] Confirmation dialog appears: "This will replace your current adaptation. Continue?"
- [ ] After confirming, new adaptation starts
- [ ] New adapted resume overwrites previous
- [ ] localStorage contains only latest adaptation
- [ ] ATS score reflects new job (likely different from Job A)

**Pass/Fail:** ___________

---

### Test Case 1.9: Start Over (Clear All Data)

**Steps:**
1. Complete adaptation
2. Click "Start Over" button
3. Confirm in dialog

**Expected Results:**
- [ ] Confirmation dialog: "This will delete all your data... Are you sure?"
- [ ] After confirming, redirect to `/`
- [ ] localStorage cleared (all three keys):
  - `mockmaster_resume`
  - `mockmaster_job_analysis`
  - `mockmaster_adapted_resume`
- [ ] Landing page shows upload form (no cached resume)

**Pass/Fail:** ___________

---

### Test Case 1.10: localStorage Persistence

**Steps:**
1. Complete adaptation
2. Close browser tab
3. Reopen `http://localhost:3000/adapt-resume`

**Expected Results:**
- [ ] Adapted resume still displays (not lost)
- [ ] ATS score matches previous session
- [ ] All content identical to before closing tab

**Pass/Fail:** ___________

---

## Test Suite 2: Browser Compatibility

Test Case 1.1 (Happy Path) on each browser:

### Chrome Desktop
- [ ] Pass / Fail
- Issues: ___________

### Firefox Desktop
- [ ] Pass / Fail
- Issues: ___________

### Safari Desktop (macOS)
- [ ] Pass / Fail
- Issues: ___________

---

## Test Suite 3: Mobile Testing

### Test Case 3.1: Mobile Responsive Design

**Environment:** iPhone Safari OR Android Chrome

**Steps:**
1. Complete F-002 and F-003 on mobile
2. Navigate to `/adapt-resume`
3. Click "Generate Adapted Resume"
4. Wait for completion

**Expected Results:**
- [ ] Layout stacks vertically (no horizontal scroll)
- [ ] ATS score circular progress visible and properly sized
- [ ] Changes summary cards stack vertically
- [ ] Adapted resume sections readable (font ≥16px)
- [ ] All buttons tappable (min 44px height)
- [ ] No text overflow or cut-off
- [ ] Action buttons stack vertically on narrow screens

**Pass/Fail:** ___________

**Issues:**
```
[Note any layout issues]
```

---

### Test Case 3.2: Mobile Performance

**Environment:** Mobile device

**Steps:**
1. Complete adaptation on mobile
2. Time the process
3. Check for UI jank/freezing

**Expected Results:**
- [ ] Adaptation completes in <30 seconds
- [ ] UI remains responsive (no freezing)
- [ ] Loading spinner animates smoothly
- [ ] Progress messages update correctly

**Pass/Fail:** ___________

**Performance:**
- Time to complete: _____ seconds
- UI freezes: Yes / No
- Acceptable performance: Yes / No

---

## Test Suite 4: Edge Cases

### Test Case 4.1: Long Resume (3+ pages)

**Setup:**
- Use a long resume (2000+ words, 3+ pages)

**Steps:**
1. Upload long resume
2. Analyze job description
3. Adapt resume

**Expected Results:**
- [ ] Adaptation does not timeout
- [ ] localStorage does not exceed quota
- [ ] Adapted resume renders completely
- [ ] All experiences included

**Pass/Fail:** ___________

**Notes:**
```
Original resume length: _____ words
Adapted resume displayed completely? Yes / No
```

---

### Test Case 4.2: Skills Not Matching Job

**Setup:**
- Resume: Python, GCP, Docker
- Job: Java, AWS, Kubernetes (zero overlap)

**Steps:**
1. Complete adaptation

**Expected Results:**
- [ ] ATS score is LOW (<30)
- [ ] Summary still written professionally
- [ ] Skills NOT added from job (no hallucination)
- [ ] Resume still usable (not broken)
- [ ] Changes summary accurate

**Pass/Fail:** ___________

**Results:**
- ATS Score: _____
- Skills added from job? Yes / No (should be NO)

---

### Test Case 4.3: Resume with No Summary

**Setup:**
- Upload resume without a summary/objective section

**Steps:**
1. Complete adaptation

**Expected Results:**
- [ ] AI generates a NEW professional summary
- [ ] Summary includes job keywords
- [ ] Summary is 2-3 sentences
- [ ] Summary is professional and accurate

**Pass/Fail:** ___________

**Generated Summary:**
```
[Copy the AI-generated summary here]

Quality: ⭐⭐⭐⭐⭐
```

---

### Test Case 4.4: Concurrent Adaptations (Race Condition)

**Steps:**
1. Open `/adapt-resume`
2. Click "Generate Adapted Resume"
3. Immediately click button again (before first request completes)

**Expected Results:**
- [ ] Second click is ignored (button disabled)
- [ ] Only ONE API call is made (check Network tab)
- [ ] No duplicate entries in localStorage

**Pass/Fail:** ___________

---

### Test Case 4.5: Invalid API Response (Malformed JSON)

**Setup:**
- This requires mocking/intercepting the API response
- Skip if unable to mock

**Steps:**
1. Mock `/api/adapt-resume` to return invalid JSON
2. Trigger adaptation

**Expected Results:**
- [ ] Error message displays
- [ ] Error mentions JSON parsing issue
- [ ] Retry button available
- [ ] No crash/white screen

**Pass/Fail:** ___________ (or SKIP)

---

## Test Suite 5: Performance Testing

### Test Case 5.1: API Response Time

**Setup:**
- Use a typical resume (1-2 pages, 3 experiences)
- Use a typical job description (300-500 words)

**Test 3 adaptations and record times:**

| Attempt | Time (seconds) | Pass (<30s) |
|---------|----------------|-------------|
| 1       |                | Yes / No    |
| 2       |                | Yes / No    |
| 3       |                | Yes / No    |

**Average:** _____ seconds

**Target:** <30 seconds

**Pass/Fail:** ___________

---

### Test Case 5.2: localStorage Size Check

**Steps:**
1. Complete adaptation
2. Open DevTools > Application > Local Storage
3. Check size of `mockmaster_adapted_resume`

**Expected Results:**
- [ ] Size is reasonable (<500KB typical)
- [ ] No quota exceeded warnings

**Actual Size:** _____ KB

**Pass/Fail:** ___________

---

## Test Summary

**Total Tests:** 25+
**Passed:** _____
**Failed:** _____
**Skipped:** _____

**Pass Rate:** _____% (target: >95%)

**Critical Issues:**
```
[List any blocking issues]
```

**Non-Critical Issues:**
```
[List minor issues]
```

**Overall Assessment:**
- [ ] Ready for Production
- [ ] Needs Minor Fixes
- [ ] Needs Major Fixes
- [ ] Not Ready

**Tester Signature:** ___________
**Date:** ___________

---

## Notes for Developers

**Observed Issues:**
```
[Detailed notes on any bugs, UX issues, or suggestions]
```

**Recommendations:**
```
[Improvements for future iterations]
```

**Claude API Performance:**
```
Average response time: _____ seconds
Token usage (typical): _____ tokens
Cost per adaptation: $_____ (estimate)
Any API errors? Yes / No
```

---

## Acceptance Criteria Verification

From plan.md, verify ALL acceptance criteria:

**Scenario 1: Happy path - Complete adaptation**
- [ ] Within 30 seconds see adapted resume
- [ ] Professional summary rewritten with job keywords
- [ ] Work experiences reordered by relevance
- [ ] Bullet points reformulated with matching skills
- [ ] Skills section reordered (most relevant first)
- [ ] ATS compatibility score displayed
- [ ] NO information invented or hallucinated
- [ ] Adapted resume saved to localStorage
- [ ] Can proceed to download PDF

**Scenario 2: Keyword matching**
- [ ] Highlights exact matches
- [ ] Suggests missing skills (doesn't add them)
- [ ] Reformulates bullets to emphasize matched skills
- [ ] Reorders projects by skill match

**Scenario 3: Experience reordering**
- [ ] Experiences sorted by relevance, not chronology
- [ ] Dates preserved accurately

**Scenario 4: Hallucination prevention**
- [ ] Does NOT add fake projects
- [ ] Does NOT claim skills candidate doesn't have
- [ ] MAY reformulate related experience
- [ ] NEVER invents roles, companies, or skills

**Scenario 5: Summary adaptation**
- [ ] Uses keywords from job description
- [ ] Stays truthful to actual experience

**Scenario 6: Caching and re-adaptation**
- [ ] Creates NEW adaptation for new job
- [ ] Overwrites previous adaptation
- [ ] Shows warning before replacing

**All Criteria Met:** Yes / No

---

**END OF MANUAL TESTING GUIDE**

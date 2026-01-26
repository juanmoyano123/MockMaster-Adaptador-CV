# Manual Test Report: F-003 - Job Description Analysis

**Date:** 2026-01-25
**Tester:** Development Team
**Feature:** Job Description Analysis
**Status:** Ready for Testing

---

## Test Environment

- **URL:** http://localhost:3000/analyze-job
- **Browser:** Chrome, Firefox, Safari (Desktop), iOS Safari, Android Chrome (Mobile)
- **API:** Claude Sonnet 4.5 via Anthropic API
- **Storage:** Browser localStorage

---

## Prerequisites

- [ ] Resume must be uploaded first (F-002 complete)
- [ ] ANTHROPIC_API_KEY environment variable set
- [ ] Development server running (`npm run dev`)

---

## Test Scenarios

### Scenario 1: Happy Path - Full Job Description (LinkedIn)

**Steps:**
1. Navigate to http://localhost:3000
2. Upload resume (if not already uploaded)
3. Click "Analyze Job Description" button
4. Paste this LinkedIn job description:

```
Senior Full Stack Developer - Meta
Menlo Park, CA

We are seeking an experienced Senior Full Stack Developer to join our product engineering team. You will be responsible for building and scaling our next-generation social platform.

Requirements:
• 5+ years of professional software development experience
• Expert knowledge of React.js and modern JavaScript/TypeScript
• Strong backend experience with Node.js, Python, or Go
• Experience with AWS, Docker, and microservices architecture
• Bachelor's degree in Computer Science or equivalent experience
• Experience building RESTful APIs and GraphQL endpoints
• Strong understanding of database design (SQL and NoSQL)

Preferred Qualifications:
• Experience with React Native for mobile development
• Familiarity with CI/CD pipelines and DevOps practices
• Open source contributions
• Experience with machine learning or AI integration
• Knowledge of accessibility standards (WCAG)

Responsibilities:
• Design and implement scalable web applications and APIs
• Lead technical architecture decisions and code reviews
• Collaborate with product managers and designers
• Mentor junior engineers
• Participate in on-call rotation for production support
• Write comprehensive unit and integration tests

Salary: $180,000 - $250,000 + equity
```

5. Click "Analyze Job Description"

**Expected Results:**
- [ ] Loading spinner shows "Analyzing..." (10-15 seconds)
- [ ] Analysis displays with:
  - Job Title: "Senior Full Stack Developer"
  - Company: "Meta"
  - Seniority: "Senior (5+ years)"
  - Industry: "Social Media / Tech" or similar
  - Required Skills: React, JavaScript, TypeScript, Node.js, AWS, Docker, 5+ years
  - Preferred Skills: React Native, CI/CD, Open source, Machine Learning
  - Responsibilities: 5-8 key responsibilities extracted
- [ ] "Proceed to Adaptation" button enabled
- [ ] "Analyze Different Job" button enabled
- [ ] Toast: "Job description analyzed successfully"

---

### Scenario 2: Cached Analysis - Same Job Description

**Steps:**
1. Repeat Scenario 1 with the EXACT same job description
2. Click "Analyze Job Description"

**Expected Results:**
- [ ] Results load instantly (<100ms, no API call)
- [ ] Badge shows "Cached" in top-right
- [ ] Toast: "Using cached analysis"
- [ ] All data matches previous analysis

---

### Scenario 3: Minimal Job Description

**Steps:**
1. Click "Analyze Different Job"
2. Paste this minimal description:

```
We need a Junior Developer. Must know HTML, CSS, JavaScript. Send resume to jobs@example.com.
```

3. Click "Analyze Job Description"

**Expected Results:**
- [ ] Analysis completes successfully
- [ ] Job Title: "Junior Developer" or "Not specified"
- [ ] Company: "Not specified"
- [ ] Required Skills: HTML, CSS, JavaScript
- [ ] Preferred Skills: Empty or minimal
- [ ] Responsibilities: Empty or minimal
- [ ] Note: Results may be limited but no error

---

### Scenario 4: Invalid Input - Too Short

**Steps:**
1. Click "Analyze Different Job"
2. Paste: "Senior Developer"
3. Click "Analyze Job Description"

**Expected Results:**
- [ ] Button disabled (grayed out)
- [ ] Character counter shows "17 / 20,000 characters"
- [ ] If forced (via console), API returns 400 error
- [ ] Warning toast: "Job description too short..."

---

### Scenario 5: Invalid Input - Random Text

**Steps:**
1. Click "Analyze Different Job"
2. Paste this nonsense text (>50 chars):

```
asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf
```

3. Click "Analyze Job Description"

**Expected Results:**
- [ ] Analysis attempts to run
- [ ] Claude returns best-effort analysis (likely "Not specified" for most fields)
- [ ] No crash or error (graceful handling)
- [ ] User can proceed or try again

---

### Scenario 6: Very Long Job Description

**Steps:**
1. Click "Analyze Different Job"
2. Paste a 5,000-word job description (generate or use real posting with extensive company description)
3. Click "Analyze Job Description"

**Expected Results:**
- [ ] Analysis completes within 20 seconds
- [ ] Results focus on requirements section
- [ ] No truncation errors
- [ ] Character counter updates correctly

---

### Scenario 7: Job Description with HTML Tags

**Steps:**
1. Click "Analyze Different Job"
2. Paste this HTML-formatted job description:

```
<h1>Senior Backend Engineer</h1>
<p><strong>Company:</strong> TechCorp</p>
<ul>
<li>5+ years experience with Python</li>
<li>Django or Flask expertise</li>
<li>PostgreSQL knowledge</li>
</ul>
```

3. Click "Analyze Job Description"

**Expected Results:**
- [ ] HTML tags ignored/stripped by Claude
- [ ] Text content extracted correctly
- [ ] Job title: "Senior Backend Engineer"
- [ ] Company: "TechCorp"
- [ ] Skills extracted correctly

---

### Scenario 8: Job Description with Emojis

**Steps:**
1. Click "Analyze Different Job"
2. Paste:

```
🚀 Join Our Amazing Team! 🚀

We're hiring a Senior Developer 💻

Requirements:
✅ 5+ years experience
✅ React.js expert
✅ Team player 🤝

Perks:
🏖️ Unlimited PTO
🍕 Free lunch
💰 Competitive salary
```

3. Click "Analyze Job Description"

**Expected Results:**
- [ ] Emojis handled gracefully
- [ ] Text content extracted
- [ ] No errors or crashes

---

### Scenario 9: Non-English Job Description

**Steps:**
1. Click "Analyze Different Job"
2. Paste a job description in Spanish, French, or other language
3. Click "Analyze Job Description"

**Expected Results:**
- [ ] Claude processes non-English text
- [ ] Results may be in original language or English (Claude decides)
- [ ] No errors

---

### Scenario 10: Navigation - Proceed to Adaptation

**Steps:**
1. Complete Scenario 1 (get analysis)
2. Click "Proceed to Resume Adaptation"

**Expected Results:**
- [ ] Toast: "Resume adaptation feature coming soon!"
- [ ] No navigation (F-004 not implemented yet)
- [ ] Analysis remains in localStorage

---

### Scenario 11: Navigation - Analyze Different Job

**Steps:**
1. Complete Scenario 1 (get analysis)
2. Click "Analyze Different Job"

**Expected Results:**
- [ ] Returns to input screen
- [ ] Textarea is empty
- [ ] localStorage cleared (previous analysis deleted)
- [ ] Can paste new job description

---

### Scenario 12: Error Handling - API Failure

**Steps:**
1. Stop the dev server or set invalid ANTHROPIC_API_KEY
2. Paste valid job description
3. Click "Analyze Job Description"

**Expected Results:**
- [ ] Loading stops
- [ ] Error toast: "Failed to analyze job description"
- [ ] User can retry
- [ ] No crash

---

### Scenario 13: Error Handling - Network Timeout

**Steps:**
1. Throttle network to slow 3G
2. Paste valid job description
3. Click "Analyze Job Description"

**Expected Results:**
- [ ] Loading spinner persists
- [ ] Eventually completes (may take 30+ seconds)
- [ ] Or times out with error message

---

## Mobile Testing

### iOS Safari

**Scenario: Full flow on iPhone**
1. [ ] Navigate to /analyze-job
2. [ ] Paste job description (use iOS share sheet if available)
3. [ ] Character counter visible and readable
4. [ ] Analyze button tappable (48px+ touch target)
5. [ ] Loading spinner shows
6. [ ] Analysis preview layout stacks vertically
7. [ ] Skills badges wrap properly
8. [ ] Buttons are full-width on mobile
9. [ ] Toast notification visible and readable

### Android Chrome

**Scenario: Full flow on Android**
1. [ ] Same steps as iOS
2. [ ] Verify keyboard behavior (no obstruction)
3. [ ] Verify scroll behavior in textarea
4. [ ] Verify touch targets

---

## Edge Cases

### localStorage Full

**Steps:**
1. Fill localStorage to near-capacity (write large data to other keys)
2. Attempt to save job analysis

**Expected Results:**
- [ ] Error toast: "Storage quota exceeded..."
- [ ] Graceful failure (no crash)

### localStorage Disabled

**Steps:**
1. Disable cookies/site data in browser settings
2. Attempt to analyze job

**Expected Results:**
- [ ] Warning: "localStorage not available..."
- [ ] Feature may not work (acceptable for MVP)

### Resume Not Uploaded

**Steps:**
1. Clear localStorage
2. Navigate directly to /analyze-job

**Expected Results:**
- [ ] Redirect to home page (/)
- [ ] Toast: "Please upload your resume first"

---

## Performance Tests

### API Response Time

**Metric:** Analyze job description API call
- [ ] < 15 seconds for typical job description (500-1000 words)
- [ ] < 20 seconds for long job description (5000 words)

### Cached Load Time

**Metric:** Load cached analysis
- [ ] < 100ms to retrieve from localStorage
- [ ] Instant UI update

### Character Counter Performance

**Metric:** Typing responsiveness
- [ ] < 50ms update lag when typing
- [ ] No jank or freezing

---

## Accessibility Tests

### Keyboard Navigation

- [ ] Tab order is logical (textarea → buttons)
- [ ] Focus states visible on all elements
- [ ] Enter key submits form (if applicable)
- [ ] Escape key closes toast notifications

### Screen Reader

- [ ] Textarea has proper label
- [ ] Buttons have descriptive text
- [ ] Error messages announced
- [ ] Toast notifications announced (aria-live)

### Color Contrast

- [ ] All text meets WCAG AA (4.5:1 ratio)
- [ ] Button text readable
- [ ] Error messages readable

---

## Security Tests

### API Key Protection

- [ ] API key not exposed in client-side code
- [ ] API key not in browser DevTools Network tab
- [ ] API route is server-side only

### XSS Prevention

- [ ] Job description text stored as string (not rendered as HTML)
- [ ] No script injection possible via job description

### Input Sanitization

- [ ] No SQL injection risk (no database)
- [ ] Length limits enforced (50-20,000 chars)

---

## Test Results Summary

**Date Tested:** _____________

**Pass Rate:** _____% (_____ / _____ tests passed)

**Critical Issues:**
- [ ] None
- [ ] List any blocking issues

**Non-Critical Issues:**
- [ ] None
- [ ] List any minor issues

**Ready for Production:** [ ] YES [ ] NO

---

## Sign-off

**Developer:** _____________________ Date: __________

**QA Tester:** _____________________ Date: __________

**Product Owner:** _________________ Date: __________

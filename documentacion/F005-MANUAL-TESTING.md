# MANUAL TESTING GUIDE: F-005 - ATS Compatibility Score with Detailed Breakdown

**Feature:** F-005 - ATS Compatibility Score with Detailed Breakdown
**Test Date:** 2026-01-26
**Tester:** [Your Name]
**Environment:** [Development / Staging / Production]

---

## PREREQUISITES

Before testing F-005, ensure:
- [ ] F-002 (Resume Upload) is working
- [ ] F-003 (Job Analysis) is working
- [ ] F-004 (Resume Adaptation) is working
- [ ] You have a test resume uploaded
- [ ] You have analyzed a test job description
- [ ] `ANTHROPIC_API_KEY` is configured in environment

---

## TEST SCENARIO 1: HIGH SCORE (70-100)

**Objective:** Verify that a well-matched resume shows a high ATS score with green indicator and detailed breakdown.

### Setup
1. Use a Python/Backend developer resume with skills: Python, AWS, Docker, REST APIs
2. Analyze a Senior Python Developer job description requiring: Python, AWS, Docker, REST APIs

### Test Steps

#### 1.1 Basic Score Display
- [ ] Navigate to `/adapt-resume`
- [ ] Click "Generate Adapted Resume"
- [ ] Wait for adaptation to complete (30-60 seconds)
- [ ] **VERIFY:** Circular gauge appears
- [ ] **VERIFY:** Score is between 70-100
- [ ] **VERIFY:** Gauge color is green
- [ ] **VERIFY:** Label shows "Strong Match"
- [ ] **VERIFY:** Score animates from 0 to final value

#### 1.2 Breakdown Panel Toggle
- [ ] **VERIFY:** "See Details" button is visible below the gauge
- [ ] Click "See Details" button
- [ ] **VERIFY:** Breakdown panel expands smoothly (fade-in animation)
- [ ] **VERIFY:** Panel shows "Score Breakdown" heading
- [ ] Click "Hide Details" button
- [ ] **VERIFY:** Breakdown panel collapses
- [ ] Click "See Details" again to continue testing

#### 1.3 Category Scores
- [ ] **VERIFY:** Keyword Match score is shown (e.g., 85/100)
- [ ] **VERIFY:** Detail text shows "X/20 found" or similar
- [ ] **VERIFY:** Progress bar is displayed
- [ ] **VERIFY:** Progress bar is green (70+)
- [ ] **VERIFY:** Progress bar width matches score percentage

- [ ] **VERIFY:** Skills Match score is shown (e.g., 90/100)
- [ ] **VERIFY:** Detail text shows number of matched skills
- [ ] **VERIFY:** Progress bar is green

- [ ] **VERIFY:** Experience Match score is shown (e.g., 85/100)
- [ ] **VERIFY:** Detail text shows "Relevance score"
- [ ] **VERIFY:** Progress bar is green

- [ ] **VERIFY:** Format Score shows 100/100
- [ ] **VERIFY:** Detail text shows "ATS-friendly"
- [ ] **VERIFY:** Progress bar is full green

#### 1.4 Missing Keywords Section
- [ ] **VERIFY:** If score is 70+, missing keywords section may be hidden OR show 1-3 keywords
- [ ] **VERIFY:** Each missing keyword is displayed as a yellow badge
- [ ] **VERIFY:** Keywords are readable and properly capitalized

#### 1.5 Suggestions Section
- [ ] **VERIFY:** Suggestions section is visible
- [ ] **VERIFY:** At least 1 suggestion is displayed
- [ ] **VERIFY:** Suggestions are actionable (e.g., "Consider adding X if you have experience...")
- [ ] **VERIFY:** Green checkmark icon appears before each suggestion
- [ ] **VERIFY:** Max 5 suggestions are shown

### Expected Results
- All scores are 70+ (green)
- Breakdown displays all 4 categories correctly
- Missing keywords: 0-3
- Suggestions are helpful and relevant
- UI is smooth and responsive

---

## TEST SCENARIO 2: MEDIUM SCORE (50-69)

**Objective:** Verify that a moderately-matched resume shows yellow indicator with improvement suggestions.

### Setup
1. Use a Full-Stack developer resume with: JavaScript, React, Node.js, PostgreSQL
2. Analyze a DevOps Engineer job requiring: Kubernetes, Docker, Terraform, CI/CD, AWS

### Test Steps

#### 2.1 Basic Score Display
- [ ] Navigate to `/adapt-resume`
- [ ] Click "Generate Adapted Resume"
- [ ] **VERIFY:** Score is between 50-69
- [ ] **VERIFY:** Gauge color is yellow/orange
- [ ] **VERIFY:** Label shows "Good Match"

#### 2.2 Breakdown Panel
- [ ] Click "See Details"
- [ ] **VERIFY:** Breakdown panel expands

#### 2.3 Category Scores
- [ ] **VERIFY:** Keyword Match score is 50-69 (yellow/orange bar)
- [ ] **VERIFY:** Skills Match score shows some gaps
- [ ] **VERIFY:** Experience Match score is moderate (50-69)
- [ ] **VERIFY:** Format Score is still 100/100 (green)

#### 2.4 Missing Keywords Section
- [ ] **VERIFY:** Missing keywords section is visible
- [ ] **VERIFY:** 3-7 missing keywords are displayed
- [ ] **VERIFY:** Keywords are relevant to the job (e.g., "Kubernetes", "Docker", "Terraform")

#### 2.5 Suggestions Section
- [ ] **VERIFY:** 3-5 suggestions are displayed
- [ ] **VERIFY:** Suggestions address the missing keywords
- [ ] **VERIFY:** Suggestions are specific (e.g., "Include 'Kubernetes' in your skills section...")

### Expected Results
- Overall score is 50-69 (yellow)
- Breakdown shows gaps in keywords and skills
- Missing keywords: 3-7
- Suggestions are actionable
- User can still download resume

---

## TEST SCENARIO 3: LOW SCORE (<50)

**Objective:** Verify that a poorly-matched resume shows red indicator with warning.

### Setup
1. Use a UX Designer resume with: Figma, Adobe XD, User Research, Prototyping
2. Analyze a Backend Engineer job requiring: Java, Spring Boot, MySQL, Microservices

### Test Steps

#### 3.1 Basic Score Display
- [ ] Navigate to `/adapt-resume`
- [ ] Click "Generate Adapted Resume"
- [ ] **VERIFY:** Score is below 50
- [ ] **VERIFY:** Gauge color is red
- [ ] **VERIFY:** Label shows "Needs Work"
- [ ] **VERIFY:** Descriptive text mentions "Significant keyword gaps"

#### 3.2 Breakdown Panel
- [ ] Click "See Details"
- [ ] **VERIFY:** Breakdown panel expands

#### 3.3 Category Scores
- [ ] **VERIFY:** Keyword Match score is low (<50, red bar)
- [ ] **VERIFY:** Skills Match score is low (<50, red bar)
- [ ] **VERIFY:** Experience Match score is low (<50, red bar)
- [ ] **VERIFY:** Format Score is still 100/100 (green)

#### 3.4 Missing Keywords Section
- [ ] **VERIFY:** Missing keywords section is visible
- [ ] **VERIFY:** 10+ missing keywords are displayed (capped at 10)
- [ ] **VERIFY:** Keywords are core to the job (Java, Spring Boot, etc.)

#### 3.5 Suggestions Section
- [ ] **VERIFY:** 5 suggestions are displayed (max limit)
- [ ] **VERIFY:** Suggestions acknowledge the significant gaps
- [ ] **VERIFY:** Tone is constructive, not discouraging

### Expected Results
- Overall score is <50 (red)
- Breakdown clearly shows significant gaps
- Missing keywords: 10 (capped)
- Suggestions are realistic given the mismatch
- User understands this resume-job pairing is poor

---

## TEST SCENARIO 4: EDGE CASES

### 4.1 No Breakdown Data (Backwards Compatibility)
**Objective:** Verify component works without breakdown data.

- [ ] Manually remove `ats_breakdown` from localStorage
- [ ] Refresh page
- [ ] **VERIFY:** Basic score gauge still displays
- [ ] **VERIFY:** No "See Details" button appears
- [ ] **VERIFY:** No errors in browser console

### 4.2 Perfect Score (100)
**Objective:** Test perfect match scenario.

- [ ] Use a resume with ALL required skills and keywords
- [ ] **VERIFY:** Score is 95-100
- [ ] **VERIFY:** All category scores are 90-100
- [ ] **VERIFY:** Missing keywords section is hidden OR empty
- [ ] **VERIFY:** Suggestions say "Your resume is well-optimized"

### 4.3 Empty Missing Keywords
**Objective:** Verify UI when no keywords are missing.

- [ ] Achieve a scenario with no missing keywords
- [ ] Expand breakdown
- [ ] **VERIFY:** Missing keywords section is hidden (not shown)
- [ ] **VERIFY:** No awkward empty space

### 4.4 API Failure
**Objective:** Test graceful degradation when breakdown API fails.

- [ ] Temporarily break API (e.g., invalid API key)
- [ ] Generate adapted resume
- [ ] **VERIFY:** Adaptation still succeeds
- [ ] **VERIFY:** Basic score is shown
- [ ] **VERIFY:** Breakdown panel is not available (no "See Details" button)
- [ ] **VERIFY:** User can still download PDF

### 4.5 Very Long Suggestions
**Objective:** Test UI with long suggestion text.

- [ ] Check suggestions don't overflow
- [ ] **VERIFY:** Text wraps properly
- [ ] **VERIFY:** Suggestions are readable on mobile

---

## MOBILE TESTING (iOS Safari, Android Chrome)

### iPhone Testing (iOS Safari)
- [ ] Open app on iPhone (Safari)
- [ ] Complete adaptation flow
- [ ] **VERIFY:** Circular gauge displays correctly
- [ ] **VERIFY:** Score is readable
- [ ] **VERIFY:** "See Details" button is tap-friendly (44px+ touch target)
- [ ] Tap "See Details"
- [ ] **VERIFY:** Breakdown panel expands smoothly
- [ ] **VERIFY:** Progress bars render correctly
- [ ] **VERIFY:** Missing keywords are readable (not cut off)
- [ ] **VERIFY:** Suggestions text wraps properly
- [ ] Scroll through breakdown
- [ ] **VERIFY:** Content is fully accessible
- [ ] Tap "Hide Details"
- [ ] **VERIFY:** Panel collapses

### Android Testing (Chrome)
- [ ] Repeat all iPhone tests on Android device
- [ ] **VERIFY:** Layout is consistent with iOS
- [ ] **VERIFY:** Touch interactions work smoothly
- [ ] **VERIFY:** Fonts are legible
- [ ] **VERIFY:** Colors render correctly

### Tablet Testing (iPad / Android Tablet)
- [ ] Test on tablet in portrait mode
- [ ] **VERIFY:** Breakdown panel uses available width well
- [ ] Test on tablet in landscape mode
- [ ] **VERIFY:** Layout adapts to wider screen

---

## DESKTOP TESTING (Chrome, Firefox, Safari)

### Chrome (Latest)
- [ ] Complete adaptation flow
- [ ] Verify all elements from Scenario 1
- [ ] Check browser console for errors
- [ ] **VERIFY:** No console warnings or errors
- [ ] **VERIFY:** Animations are smooth (60fps)

### Firefox (Latest)
- [ ] Repeat all Chrome tests
- [ ] **VERIFY:** Progress bars render correctly
- [ ] **VERIFY:** Colors match Chrome
- [ ] **VERIFY:** Fonts render consistently

### Safari (Latest)
- [ ] Repeat all Chrome tests
- [ ] **VERIFY:** Circular gauge animation works
- [ ] **VERIFY:** Fade-in animation works
- [ ] **VERIFY:** No Safari-specific rendering issues

---

## PERFORMANCE TESTING

### Breakdown Calculation Speed
- [ ] Start timer when clicking "Generate Adapted Resume"
- [ ] Note when adaptation completes
- [ ] Note when breakdown appears
- [ ] **VERIFY:** Total time is <60 seconds
- [ ] **VERIFY:** Breakdown adds <5 seconds to total time
- [ ] **VERIFY:** UI remains responsive during calculation

### Large Resume Test
- [ ] Upload a resume with 10+ work experiences
- [ ] Upload 50+ skills
- [ ] Analyze job with detailed description
- [ ] **VERIFY:** Breakdown still calculates in <10 seconds
- [ ] **VERIFY:** UI doesn't freeze

### Network Delay Test
- [ ] Use browser DevTools to throttle network to "Slow 3G"
- [ ] Generate adapted resume
- [ ] **VERIFY:** Loading indicator is shown
- [ ] **VERIFY:** Progress messages update
- [ ] **VERIFY:** Breakdown eventually loads

---

## ACCESSIBILITY TESTING

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] **VERIFY:** "See Details" button is keyboard-accessible
- [ ] Press Enter on "See Details" button
- [ ] **VERIFY:** Breakdown expands
- [ ] Press Enter on "Hide Details" button
- [ ] **VERIFY:** Breakdown collapses

### Screen Reader Testing
- [ ] Enable VoiceOver (Mac) or NVDA (Windows)
- [ ] Navigate to ATS score section
- [ ] **VERIFY:** Score value is announced
- [ ] **VERIFY:** Label ("Strong Match") is announced
- [ ] **VERIFY:** "See Details" button purpose is clear
- [ ] Activate "See Details"
- [ ] **VERIFY:** Breakdown content is accessible
- [ ] **VERIFY:** Category scores are announced
- [ ] **VERIFY:** Suggestions are readable

### Color Contrast
- [ ] Use browser extension to check contrast
- [ ] **VERIFY:** Green score text meets WCAG AA (4.5:1)
- [ ] **VERIFY:** Yellow score text meets WCAG AA
- [ ] **VERIFY:** Red score text meets WCAG AA
- [ ] **VERIFY:** Gray text for details meets WCAG AA

---

## INTEGRATION TESTING

### With F-004 (Resume Adaptation)
- [ ] Complete resume adaptation
- [ ] **VERIFY:** Breakdown is automatically calculated
- [ ] **VERIFY:** Breakdown is saved to localStorage
- [ ] Refresh page
- [ ] **VERIFY:** Breakdown persists (loaded from localStorage)

### With F-006 (PDF Export)
- [ ] View breakdown
- [ ] Download PDF
- [ ] **VERIFY:** Download works normally (breakdown doesn't break PDF)
- [ ] **VERIFY:** PDF contains adapted resume content

### With F-012 (Edit Resume)
- [ ] View breakdown
- [ ] Enter edit mode
- [ ] Edit resume content
- [ ] **VERIFY:** Original breakdown still displays
- [ ] **NOTE:** Breakdown does NOT auto-recalculate on edit (expected behavior for MVP)

---

## REGRESSION TESTING

### Existing Features Still Work
- [ ] F-002: Resume upload works
- [ ] F-003: Job analysis works
- [ ] F-004: Resume adaptation works
- [ ] F-006: PDF export works
- [ ] F-012: Edit mode works
- [ ] **VERIFY:** No existing functionality is broken

---

## BUG TRACKING

Use this section to note any bugs found during testing:

| Bug ID | Severity | Description | Steps to Reproduce | Expected | Actual | Status |
|--------|----------|-------------|-------------------|----------|--------|--------|
| F005-B01 | High | | | | | Open |
| F005-B02 | Medium | | | | | Open |
| F005-B03 | Low | | | | | Open |

---

## SIGN-OFF

### Test Summary
- **Total Test Cases:** 100+
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___
- **Not Tested:** ___

### Critical Issues Found
- [ ] None
- [ ] List critical issues here

### Approval
- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] No critical bugs found
- [ ] Feature is ready for deployment

**Tester Signature:** _______________
**Date:** _______________
**Approved for Production:** [ ] Yes [ ] No

---

## NOTES

Use this section for any additional observations, feedback, or recommendations:

[Your notes here]

---

**End of Manual Testing Guide**

This comprehensive test plan covers all scenarios, edge cases, and device combinations. Execute tests methodically and document all findings.

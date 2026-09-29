# F-006 Manual Testing Guide

## PDF Export with Templates

**Feature:** F-006 - PDF Export with Templates
**Date:** 2026-01-26
**Tester:** [Your Name]

---

## Prerequisites

1. Ensure the development server is running: `npm run dev`
2. Have a test resume uploaded
3. Have a job description analyzed
4. Have an adapted resume generated

---

## Test Scenarios

### Scenario 1: Download PDF with Default Template

**Steps:**
1. Navigate to `/adapt-resume`
2. Verify adapted resume is displayed
3. Locate the "Ready to Download?" section at the top
4. Verify current template shows "modern" (default)
5. Click "Download PDF" button
6. Verify loading spinner appears
7. Wait for PDF download (should complete in <5 seconds)

**Expected Results:**
- [ ] PDF downloads automatically
- [ ] Filename format: `Resume_{CompanyName}_{YYYY-MM-DD}.pdf`
- [ ] File size under 500KB
- [ ] PDF opens in browser/Preview without errors
- [ ] All text is selectable and copyable
- [ ] Contact information displays correctly
- [ ] Professional summary included
- [ ] Work experience listed with bullets
- [ ] Education section present
- [ ] Skills section present
- [ ] Modern template styling (Helvetica font, navy blue headings)

---

### Scenario 2: Choose Template Before Download

**Steps:**
1. On adapted resume page, click "Choose Template" button
2. Verify modal opens showing 3 template options
3. Review each template card:
   - Clean: Traditional, black text, Georgia font
   - Modern: Contemporary, navy blue, Helvetica font
   - Compact: Maximum content, Arial Narrow, 10pt font
4. Click on "Clean" template card
5. Verify "Selected" badge appears on Clean template
6. Click "Apply Template" button
7. Verify modal closes
8. Verify "Current template: clean" appears in the download section
9. Click "Download PDF"
10. Download and open PDF

**Expected Results:**
- [ ] Modal displays correctly with 3 templates
- [ ] Template selection highlights chosen template
- [ ] Preference is saved (refresh page - should show "clean")
- [ ] Downloaded PDF uses Clean template styling
- [ ] Clean template features:
  - Georgia or Times New Roman font
  - Pure black text only (#000000)
  - Horizontal lines between sections
  - Traditional professional appearance

---

### Scenario 3: Test All Three Templates

**For each template (Clean, Modern, Compact):**

1. Click "Choose Template"
2. Select the template
3. Click "Apply Template"
4. Click "Download PDF"
5. Open PDF and verify styling

**Clean Template Checklist:**
- [ ] Georgia font family
- [ ] Black text only
- [ ] Horizontal rules between sections
- [ ] 11pt body font
- [ ] 14pt headings
- [ ] Traditional appearance

**Modern Template Checklist:**
- [ ] Helvetica font family
- [ ] Navy blue headings (#1E3A5F)
- [ ] Black body text
- [ ] Blue color bar accent
- [ ] 11pt body font
- [ ] 14pt headings
- [ ] Contemporary appearance

**Compact Template Checklist:**
- [ ] Arial Narrow font family
- [ ] Black text only
- [ ] Minimal whitespace
- [ ] 10pt body font
- [ ] 12pt headings
- [ ] Condensed spacing
- [ ] Maximum content per page

---

### Scenario 4: Long Resume (2 Pages)

**Setup:**
Create or use a resume with:
- 5+ work experiences
- Multiple bullet points per experience
- Extensive skills list

**Steps:**
1. Generate adapted resume with long content
2. Download PDF with each template
3. Open PDFs and verify page breaks

**Expected Results:**
- [ ] Content fits on 2 pages maximum
- [ ] Page breaks occur between sections (not mid-sentence)
- [ ] Contact header appears on page 1
- [ ] No text is cut off or hidden
- [ ] All content is readable
- [ ] Compact template fits more content per page than Clean

---

### Scenario 5: Special Characters Handling

**Setup:**
Create resume with:
- Accented characters (é, ñ, ü, ç)
- Ampersands (&)
- Quotes (")
- Less than/greater than signs (<>)

**Steps:**
1. Generate adapted resume with special characters
2. Download PDF
3. Open PDF and verify character rendering

**Expected Results:**
- [ ] All accented characters render correctly
- [ ] Special characters are escaped properly (no XSS)
- [ ] Text is selectable without character corruption
- [ ] Copy-paste preserves special characters

---

### Scenario 6: Error Handling

**Test 6.1: Network Timeout (Simulated)**

**Steps:**
1. Open browser DevTools > Network tab
2. Throttle network to "Slow 3G"
3. Click "Download PDF"
4. Wait for timeout (should fail after 10 seconds)

**Expected Results:**
- [ ] Error message appears: "PDF generation timed out"
- [ ] Retry button is shown
- [ ] Clicking retry attempts download again

**Test 6.2: Rapid Multiple Clicks**

**Steps:**
1. Click "Download PDF" button 3 times rapidly
2. Observe behavior

**Expected Results:**
- [ ] Button disabled during generation
- [ ] Only one download triggered
- [ ] No duplicate PDFs generated

---

### Scenario 7: Cross-Browser Compatibility

**Test on each browser:**

**Chrome (Latest):**
- [ ] Template modal renders correctly
- [ ] PDF downloads automatically
- [ ] PDF opens in Chrome PDF viewer
- [ ] All text selectable

**Firefox (Latest):**
- [ ] Template modal renders correctly
- [ ] PDF downloads automatically
- [ ] PDF opens in Firefox viewer
- [ ] All text selectable

**Safari (Latest, macOS):**
- [ ] Template modal renders correctly
- [ ] PDF downloads automatically
- [ ] PDF opens in Preview.app
- [ ] All text selectable

**Adobe Acrobat Reader:**
- [ ] PDF opens without errors
- [ ] All formatting preserved
- [ ] Text searchable
- [ ] No warnings about invalid PDF

---

### Scenario 8: Mobile Responsive Testing

**Test on Mobile Device (iOS Safari or Android Chrome):**

**Steps:**
1. Open adapted resume page on mobile
2. Tap "Choose Template" button
3. Verify modal is responsive
4. Select a template
5. Tap "Download PDF"
6. Verify PDF downloads to device

**Expected Results:**
- [ ] Template selector modal is responsive (scrollable)
- [ ] Template cards stack vertically on mobile
- [ ] Buttons are easily tappable (not too small)
- [ ] PDF downloads to Files/Downloads folder
- [ ] PDF opens in mobile viewer
- [ ] PDF is readable on mobile screen

---

### Scenario 9: ATS Compatibility Validation

**Steps:**
1. Download PDF with each template
2. Upload to ATS test tool (e.g., Jobscan, ResumeWorded)
3. Verify text extraction

**Expected Results:**
- [ ] All text is extracted correctly
- [ ] Section headers recognized: "Professional Summary", "Work Experience", "Education", "Skills"
- [ ] No parsing errors
- [ ] Skills list is readable
- [ ] Company names and job titles extracted
- [ ] Dates recognized
- [ ] No "unable to parse" warnings

**Specific ATS Checks:**
- [ ] No multi-column layouts detected
- [ ] No images or graphics (text only)
- [ ] Standard section headers
- [ ] Fonts embedded in PDF
- [ ] Text layer present (not scanned image)

---

### Scenario 10: File Size Validation

**Steps:**
1. Download PDF with short resume (1 page)
2. Check file size
3. Download PDF with long resume (2 pages)
4. Check file size

**Expected Results:**
- [ ] Short resume PDF: <200KB
- [ ] Long resume PDF: <500KB
- [ ] If > 500KB, warning logged in console (but download succeeds)

---

### Scenario 11: Template Preference Persistence

**Steps:**
1. Select "Compact" template
2. Download PDF
3. Refresh the page (F5)
4. Navigate back to `/adapt-resume`
5. Check "Current template" text

**Expected Results:**
- [ ] Template preference shows "compact"
- [ ] Preference persists across page refreshes
- [ ] Preference stored in localStorage

**Verify localStorage:**
```javascript
// In browser console:
JSON.parse(localStorage.getItem('mockmaster_preferences'))
// Should show: { preferred_template: "compact" }
```

---

### Scenario 12: PDF Metadata

**Steps:**
1. Download PDF
2. Open in Adobe Acrobat
3. View Document Properties (File > Properties)

**Expected Results:**
- [ ] Format: PDF
- [ ] PDF Version: 1.4 or higher
- [ ] Producer: Puppeteer (or similar)
- [ ] File is not encrypted
- [ ] File is not password-protected

---

## Performance Benchmarks

**Timing Measurements:**

| Action | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| PDF Generation (short resume) | <3s | _____s | _____ |
| PDF Generation (long resume) | <5s | _____s | _____ |
| Template modal open | <200ms | _____ms | _____ |
| Template selection update | <100ms | _____ms | _____ |

---

## Bug Report Template

**If you find a bug, document it here:**

### Bug #1

**Title:** _________________________

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**


**Actual Result:**


**Screenshots:**


**Environment:**
- Browser:
- OS:
- Screen size:

---

## Test Summary

**Date Completed:** _________________________

**Tester Name:** _________________________

**Total Tests:** 50+

**Tests Passed:** _____

**Tests Failed:** _____

**Bugs Found:** _____

**Overall Result:** PASS / FAIL

**Notes:**


---

## Sign-Off

- [ ] All critical tests passed
- [ ] PDF downloads work on all major browsers
- [ ] All 3 templates render correctly
- [ ] ATS compatibility verified
- [ ] Mobile responsive design works
- [ ] No critical bugs found

**Approved for Production:** YES / NO

**Signature:** _________________________

**Date:** _________________________

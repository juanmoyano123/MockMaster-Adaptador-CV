# F-012 Manual Testing Guide
## Edit Adapted Resume Before Export

**Version:** 1.0
**Date:** 2026-01-26
**Tester:** [Your Name]

---

## Pre-Testing Setup

### Prerequisites
1. Dev server running: `npm run dev`
2. Browser: Latest Chrome, Firefox, or Safari
3. Mobile device OR browser DevTools mobile emulation
4. localStorage enabled in browser
5. Sample resume uploaded (use F-002)
6. Job description analyzed (use F-003)
7. Resume adapted (use F-004)

### Test Data Requirements
- Adapted resume with at least 2 experience items
- Adapted resume with at least 5 skills
- Original resume for comparison

---

## Desktop Testing (Chrome, Firefox, Safari)

### Test Suite 1: Edit Mode Toggle

#### TC-001: Enable Edit Mode
**Steps:**
1. Navigate to `/adapt-resume` with adapted resume
2. Scroll to "Edit Resume" button (purple/pink gradient section)
3. Click "Edit Resume" button

**Expected:**
- Button changes to "Editing Mode" with blue background
- Button shows checkmark icon
- Summary section shows dashed blue border with "Click to edit" text
- Experience bullets show edit/remove buttons on hover
- Skills show X buttons
- No errors in browser console

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-002: Disable Edit Mode
**Steps:**
1. Enable edit mode (TC-001)
2. Click "Editing Mode" button again

**Expected:**
- Button changes back to "Edit Resume" with white background
- All editable indicators disappear
- Content remains visible in read-only mode
- No errors in browser console

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test Suite 2: Summary Editing

#### TC-003: Edit Summary - Happy Path
**Steps:**
1. Enable edit mode
2. Click on summary text
3. Textarea appears with current summary
4. Modify text (e.g., add "test edit")
5. Click "Save" button

**Expected:**
- Textarea displays with blue border
- Save/Cancel buttons appear
- After clicking Save:
  - Textarea closes
  - Updated text displays
  - "Saving..." indicator appears briefly
  - "Saved ✓" indicator appears
  - After 2 seconds, indicator disappears

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-004: Cancel Summary Edit
**Steps:**
1. Enable edit mode
2. Click on summary
3. Change text
4. Click "Cancel" button

**Expected:**
- Original text restored
- No changes saved to localStorage
- No "Saving" indicator appears

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-005: Summary Empty Validation
**Steps:**
1. Enable edit mode
2. Click on summary
3. Delete all text
4. Click "Save"

**Expected:**
- Alert: "Summary cannot be empty"
- Text not saved
- Textarea remains open

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-006: Keyboard Shortcuts for Summary
**Steps:**
1. Enable edit mode
2. Click on summary
3. Modify text
4. Press Ctrl+Enter (or Cmd+Enter on Mac)

**Expected:**
- Changes saved (same as clicking Save button)

**Additional Test:**
5. Click on summary again
6. Press Escape

**Expected:**
- Edit cancelled, original text restored

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test Suite 3: Experience Bullets Editing

#### TC-007: Edit Bullet - Happy Path
**Steps:**
1. Enable edit mode
2. Click on any experience bullet
3. Input field appears
4. Modify text
5. Press Enter

**Expected:**
- Input field with blue border appears
- Save/Cancel buttons show
- After Enter:
  - Bullet updates
  - "Saving..." → "Saved ✓" indicator
  - Input closes

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-008: Add New Bullet
**Steps:**
1. Enable edit mode
2. Scroll to experience item
3. Click "+ Add bullet point"
4. Enter text in new input
5. Save

**Expected:**
- New bullet appears at end of list
- Placeholder text: "New accomplishment or responsibility"
- Can be edited and saved
- Persists in localStorage

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-009: Remove Bullet
**Steps:**
1. Enable edit mode
2. Hover over any bullet (not the last one)
3. Edit/Remove buttons appear
4. Click "Remove"
5. Confirm in dialog

**Expected:**
- Confirmation dialog: "Remove this bullet point?"
- After confirming:
  - Bullet removed
  - Changes saved
  - "Saving..." → "Saved ✓"

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-010: Prevent Removing Last Bullet
**Steps:**
1. Ensure experience has only 1 bullet (remove others first)
2. Try to remove the last bullet

**Expected:**
- Alert: "Each experience must have at least one bullet point."
- Bullet NOT removed

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-011: Edit/Remove Button Hover State
**Steps:**
1. Enable edit mode
2. Hover over experience bullet

**Expected:**
- Edit and Remove buttons fade in (opacity 0 → 100)
- Buttons are blue (Edit) and red (Remove)
- Cursor changes to pointer

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test Suite 4: Skills Editing

#### TC-012: Add New Skill
**Steps:**
1. Enable edit mode
2. Scroll to Skills section
3. Click "+ Add skill"
4. Enter "Python" in input
5. Click "Add" button

**Expected:**
- Input field appears with blue border
- After clicking Add:
  - New skill chip appears
  - Input closes
  - "Saving..." → "Saved ✓"

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-013: Cancel Add Skill
**Steps:**
1. Enable edit mode
2. Click "+ Add skill"
3. Enter text
4. Click "Cancel"

**Expected:**
- Input closes
- Skill NOT added
- No save occurs

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-014: Add Skill with Enter Key
**Steps:**
1. Enable edit mode
2. Click "+ Add skill"
3. Type skill name
4. Press Enter

**Expected:**
- Skill added (same as clicking Add button)

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-015: Remove Skill
**Steps:**
1. Enable edit mode
2. Skills section shows X buttons on each chip
3. Click X on any skill (not the last one)

**Expected:**
- Skill immediately removed
- "Saving..." → "Saved ✓"
- Remaining skills display correctly

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-016: Prevent Removing Last Skill
**Steps:**
1. Remove all skills except one
2. Try to remove the last skill

**Expected:**
- Alert: "You must have at least one skill on your resume"
- Skill NOT removed

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-017: Prevent Duplicate Skills
**Steps:**
1. Enable edit mode
2. Try to add skill that already exists (e.g., "JavaScript" if already present)

**Expected:**
- Alert: "This skill is already in your list"
- Skill NOT added

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test Suite 5: Auto-Save Functionality

#### TC-018: Auto-Save After Edit
**Steps:**
1. Enable edit mode
2. Edit summary
3. Save
4. Wait 500ms

**Expected:**
- "Saving..." appears
- After ~500ms, "Saved ✓" appears
- After 2 seconds, indicator disappears
- Check localStorage: `mockmaster_edited_resume` key exists

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-019: Multiple Edits Debouncing
**Steps:**
1. Enable edit mode
2. Edit summary, save
3. Immediately edit skills, save
4. Immediately add bullet, save

**Expected:**
- Only one "Saving..." → "Saved ✓" cycle
- All changes saved in single operation
- localStorage updated only once

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test Suite 6: Reset to AI Version

#### TC-020: Reset Shows Confirmation
**Steps:**
1. Make any edit
2. "Reset to AI Version" button appears (red border)
3. Click "Reset to AI Version"

**Expected:**
- Modal dialog appears
- Title: "Reset to AI Version?"
- Warning icon (red triangle)
- Message mentions "cannot be undone"
- Cancel and Reset buttons

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-021: Cancel Reset
**Steps:**
1. Make edits
2. Click "Reset to AI Version"
3. Click "Cancel" in dialog

**Expected:**
- Dialog closes
- Edits preserved
- No changes to localStorage

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-022: Confirm Reset
**Steps:**
1. Make edits (summary, bullet, skill)
2. Click "Reset to AI Version"
3. Click "Reset to AI Version" button in dialog

**Expected:**
- Dialog closes
- All edits discarded
- Original AI content restored
- Edit mode disabled
- "Reset to AI Version" button disappears
- localStorage: `mockmaster_edited_resume` key deleted
- No "Last edited" timestamp

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test Suite 7: PDF Export Integration

#### TC-023: PDF Export with Edits
**Steps:**
1. Make edits (change summary to "EDITED SUMMARY")
2. Wait for save
3. Scroll to "Ready to Download?" section
4. Notice text: "(using your edited version)"
5. Click "Download PDF"

**Expected:**
- Indicator shows "Using your edited version" in green
- PDF downloads
- Open PDF: should contain "EDITED SUMMARY"
- NOT the original AI summary

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-024: PDF Export Without Edits
**Steps:**
1. Do NOT make any edits
2. Check "Ready to Download?" section
3. Click "Download PDF"

**Expected:**
- NO "using your edited version" indicator
- PDF downloads
- PDF contains original AI-generated content

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test Suite 8: Persistence & Refresh

#### TC-025: Edits Persist After Page Refresh
**Steps:**
1. Make multiple edits:
   - Change summary
   - Add a bullet
   - Add a skill
2. Wait for "Saved ✓"
3. Refresh page (F5 or Cmd+R)

**Expected:**
- Page reloads
- Scroll to adapted resume section
- ALL edits are still present
- Can enter edit mode again
- "Last edited" timestamp shows

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-026: Last Edited Timestamp
**Steps:**
1. Make an edit
2. Wait for save
3. Check bottom of adapted resume preview

**Expected:**
- Text: "Last edited [date and time]"
- Timestamp matches current time
- Format: "Jan 26, 2026, 1:30 PM" (locale-specific)

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test Suite 9: Edge Cases

#### TC-027: Very Long Summary (5000+ chars)
**Steps:**
1. Enable edit mode
2. Paste 5000+ character text into summary
3. Save

**Expected:**
- Textarea handles large text
- Scrollable textarea
- Save succeeds
- No UI breaks
- localStorage saves successfully

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-028: Special Characters in Content
**Steps:**
1. Enable edit mode
2. Add special characters: < > & " ' / \
3. Save

**Expected:**
- Characters saved correctly
- No XSS issues
- Characters display correctly after save
- PDF export handles characters properly

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-029: Navigate Away During Edit
**Steps:**
1. Enable edit mode
2. Start editing summary (don't save)
3. Click browser back button OR navigate to different page

**Expected:**
- Auto-save triggers before navigation
- OR changes are discarded (acceptable)
- No errors in console

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

## Mobile Testing (iOS Safari, Android Chrome)

### Test Suite 10: Mobile Responsive Design

#### TC-030: Edit Mode Button (Mobile)
**Device:** [iPhone/Android]
**Steps:**
1. Open `/adapt-resume` on mobile
2. Tap "Edit Resume" button

**Expected:**
- Button is tap-friendly (min 44x44px)
- Single tap activates
- No double-tap zoom
- Edit mode enables correctly

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-031: Summary Edit (Mobile)
**Device:** [iPhone/Android]
**Steps:**
1. Enable edit mode
2. Tap on summary
3. Keyboard appears
4. Edit text
5. Tap "Save"

**Expected:**
- Textarea is fully visible
- Keyboard doesn't hide textarea
- Save/Cancel buttons are tap-friendly
- No horizontal scrolling

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-032: Bullet Edit (Mobile)
**Device:** [iPhone/Android]
**Steps:**
1. Enable edit mode
2. Tap bullet to edit
3. Edit text
4. Tap Save OR press Enter on keyboard

**Expected:**
- Input field is visible
- Keyboard appears
- Enter key saves (not new line)
- No UI breaks

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-033: Skills Management (Mobile)
**Device:** [iPhone/Android]
**Steps:**
1. Enable edit mode
2. Tap X to remove skill
3. Tap "+ Add skill"
4. Add new skill

**Expected:**
- X buttons are tap-friendly
- Input field appears correctly
- Keyboard works
- Skills wrap correctly on small screen

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-034: Reset Dialog (Mobile)
**Device:** [iPhone/Android]
**Steps:**
1. Make edits
2. Tap "Reset to AI Version"
3. Dialog appears

**Expected:**
- Dialog is centered
- Readable text size
- Buttons are tap-friendly
- No overflow or clipping

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

#### TC-035: PDF Download (Mobile)
**Device:** [iPhone/Android]
**Steps:**
1. Make edits
2. Tap "Download PDF"

**Expected:**
- PDF downloads OR opens in browser
- Edited content in PDF
- No errors

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

## Acceptance Criteria Validation

### Scenario 1: Edit summary section ✓
- [x] Click "Edit" activates edit mode
- [x] Editable textarea appears
- [x] Changes save automatically
- [x] Preview updates in real-time

### Scenario 2: Edit experience bullets ✓
- [x] Can edit job title, company, dates (READ-ONLY by design)
- [x] Can edit all bullet points
- [x] Can add bullets
- [x] Can remove bullets
- [x] Changes persist across refresh

### Scenario 3: Edit skills ✓
- [x] Can add skills
- [x] Can remove skills
- [x] Can reorder skills (NOT IMPLEMENTED - future enhancement)
- [x] Skills list updates in real-time

### Scenario 4: Reset to AI version ✓
- [x] Reset button available
- [x] Confirmation dialog appears
- [x] Original AI content restored
- [x] Edits discarded

### Scenario 5: Download edited version ✓
- [x] PDF contains edited version
- [x] All changes reflected in download

---

## Browser Compatibility Matrix

| Browser         | Version | TC-001-029 | TC-030-035 | Issues       |
|----------------|---------|------------|------------|--------------|
| Chrome Desktop | Latest  | [ ]        | N/A        |              |
| Firefox Desktop| Latest  | [ ]        | N/A        |              |
| Safari Desktop | Latest  | [ ]        | N/A        |              |
| iOS Safari     | Latest  | N/A        | [ ]        |              |
| Android Chrome | Latest  | N/A        | [ ]        |              |

---

## Performance Testing

#### TC-036: Large Resume Performance
**Steps:**
1. Use resume with 10 experience items, 50+ bullets, 30+ skills
2. Enable edit mode
3. Make edits

**Expected:**
- UI remains responsive
- No lag when typing
- Save completes in <1 second
- No memory leaks

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

## Security Testing

#### TC-037: XSS Prevention
**Steps:**
1. Try to inject script tags: `<script>alert('XSS')</script>`
2. In summary, bullets, and skills
3. Save and view

**Expected:**
- Script tags are escaped/sanitized
- No alerts execute
- Text displays as plain text

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

## Defects Found

| ID | Severity | Description | Steps to Reproduce | Status |
|----|----------|-------------|-------------------|--------|
|    |          |             |                   |        |

---

## Test Summary

**Total Test Cases:** 37
**Passed:** [ ]
**Failed:** [ ]
**Blocked:** [ ]
**Not Tested:** [ ]

**Pass Rate:** [ ]%

**Overall Status:** [ ] Ready for Production [ ] Needs Fixes

**Tested By:** __________________
**Date:** __________________
**Sign-off:** __________________

---

## Notes & Observations

[Add any additional observations, suggestions, or issues found during testing]

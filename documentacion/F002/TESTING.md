# Feature F-002: Resume Upload & Parsing - Testing Guide

## Quick Start Testing

### 1. Environment Setup

```bash
# Make sure you have ANTHROPIC_API_KEY set in .env.local
cp .env.local.example .env.local
# Edit .env.local and add your actual API key
```

### 2. Start Development Server

```bash
npm run dev
```

Navigate to: http://localhost:3000

## Manual Test Scenarios

### Test 1: PDF Upload (Drag & Drop)
1. Open http://localhost:3000
2. Drag a PDF resume file and drop it on the upload zone
3. Expected: Loading indicator appears
4. Expected: After 5-10 seconds, resume preview appears
5. Expected: All sections populated (Contact, Experience, Education, Skills)
6. Edit any field (e.g., change email)
7. Click "Save Resume"
8. Expected: Success message appears
9. Reload the page
10. Expected: Resume still shows (loaded from localStorage)

### Test 2: PDF Upload (Click to Upload)
1. Open http://localhost:3000
2. Click "Upload New Resume" if resume exists
3. Click "Choose File" button
4. Select a PDF file
5. Expected: Same flow as Test 1

### Test 3: DOCX Upload
1. Click "Choose File"
2. Select a .docx file
3. Expected: File processes successfully
4. Expected: Preview shows with all sections
5. Verify bullet points are preserved

### Test 4: Text Paste
1. Click "Paste Text" tab
2. Paste resume text into textarea
3. Click "Parse Resume"
4. Expected: AI structures the text
5. Expected: Preview appears with extracted data
6. Save and reload to verify persistence

### Test 5: Error Handling - Invalid File Type
1. Try to upload a .jpg image
2. Expected: Error message "Unsupported file format. Please upload PDF or DOCX"
3. Expected: Link to "Try pasting text instead"

### Test 6: Error Handling - File Too Large
1. Try to upload a 15MB PDF
2. Expected: Error "File too large. Maximum size is 10MB"

### Test 7: Edit and Save
1. Upload a resume
2. Edit contact information (add phone, LinkedIn)
3. Add a new work experience entry
4. Remove an education entry
5. Update skills list
6. Click "Save Resume"
7. Reload page
8. Expected: All edits persisted

### Test 8: Delete Resume
1. With resume loaded
2. Click "Delete Resume" at bottom
3. Confirm deletion
4. Expected: Upload screen appears again
5. Reload page
6. Expected: No resume loaded (localStorage cleared)

### Test 9: Replace Resume
1. Upload resume A
2. Click "Upload New Resume"
3. Confirm replacement
4. Upload resume B
5. Save resume B
6. Expected: Only resume B in localStorage

## Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome

## API Testing

### Test Claude API Integration
```bash
# Test parse-resume endpoint
curl -X POST http://localhost:3000/api/parse-resume \
  -H "Content-Type: application/json" \
  -d '{
    "text": "John Doe\njohn@example.com\n(555) 123-4567\n\nWork Experience:\nSoftware Engineer at Tech Corp\n2020-Present\n- Built web applications\n- Led team of 5\n\nEducation:\nBS Computer Science, MIT, 2020\n\nSkills: JavaScript, Python, React"
  }'
```

Expected response:
```json
{
  "parsed_content": {
    "contact": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "(555) 123-4567"
    },
    "experience": [...],
    "education": [...],
    "skills": [...]
  }
}
```

## localStorage Inspection

Open browser DevTools > Application > Local Storage > localhost:3000

Check for key: `mockmaster_resume`

Value should be JSON with:
- name
- original_text
- parsed_content
- uploaded_at

## Performance Testing

- [ ] PDF parsing completes in <10 seconds
- [ ] DOCX parsing completes in <5 seconds
- [ ] Claude API responds in <5 seconds
- [ ] Page loads quickly with saved resume
- [ ] No memory leaks after 10 uploads

## Edge Cases

- [ ] Resume with no phone number (optional field)
- [ ] Resume with 10+ years of experience
- [ ] Resume with special characters (é, ñ, 中文)
- [ ] Very long resume (8 pages)
- [ ] Minimal resume (just name and email)
- [ ] Multi-column resume (may have jumbled text - acceptable)

## Known Issues / Limitations

1. Multi-column PDFs may have text extraction in wrong order (acceptable for MVP)
2. Scanned PDFs (images) will fail - no OCR implemented
3. Password-protected PDFs will fail
4. localStorage has ~5-10MB limit - very large resumes may fail
5. Claude API may occasionally return malformed JSON (retry logic implemented)

## Success Criteria

All acceptance criteria from ARCHITECTURE-F002.md must pass:
- ✓ User can upload PDF and see structured preview
- ✓ User can upload DOCX and see structured preview
- ✓ User can paste text and get structured resume
- ✓ Resume persists in localStorage across sessions
- ✓ Errors are handled gracefully
- ✓ User can edit parsed content before saving
- ✓ User can replace their resume

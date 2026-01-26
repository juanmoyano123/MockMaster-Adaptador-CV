# MockMaster - Quick Start Guide

## Get Running in 5 Minutes

### 1. Set Up API Key

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local and add your Anthropic API key
# Get your key from: https://console.anthropic.com/
```

Your `.env.local` should look like:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install & Run

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### 3. Test the Feature

1. Open http://localhost:3000 in your browser

2. **Upload a Resume**:
   - Drag & drop a PDF resume onto the upload zone, OR
   - Click "Choose File" and select a PDF/DOCX, OR
   - Click "Paste Text" tab and paste your resume text

3. **Wait for Parsing** (~5-10 seconds):
   - You'll see "Parsing your resume..." message
   - Claude AI extracts and structures your information

4. **Review & Edit**:
   - Check all sections: Contact, Summary, Experience, Education, Skills
   - Edit any field that needs correction
   - Add/remove entries as needed

5. **Save**:
   - Click "Save Resume"
   - See success message
   - Reload page - your resume should still be there!

6. **Test Persistence**:
   - Close browser
   - Reopen http://localhost:3000
   - Your resume should automatically load

## Quick Test Commands

```bash
# Check build works
npm run build

# Run linting
npm run lint

# Check TypeScript
npx tsc --noEmit
```

## Common Issues

### "ANTHROPIC_API_KEY not configured"
- Make sure `.env.local` exists
- Check the API key is correct
- Restart dev server after adding key

### "Could not read this PDF file"
- Try a different PDF
- Ensure PDF is not password-protected
- Ensure PDF is not scanned (image-only)
- Try "Paste Text" mode instead

### "File too large"
- PDFs must be under 10MB
- Try compressing your PDF
- Or use "Paste Text" mode

### Resume not persisting
- Check browser localStorage is enabled
- Check you're not in private/incognito mode
- Try a different browser

## Next Steps

- Read [ARCHITECTURE-F002.md](./ARCHITECTURE-F002.md) for technical details
- Read [TESTING-F002.md](./TESTING-F002.md) for comprehensive testing
- Read [README.md](./README.md) for full documentation

## File Structure Overview

```
/app
  /api                  # API routes (server-side)
    /parse-pdf          # PDF text extraction
    /parse-docx         # DOCX text extraction
    /parse-resume       # Claude AI structuring
  page.tsx              # Home page

/components             # React components
  ResumeUploadFlow.tsx  # Main orchestrator
  ResumeUpload.tsx      # File upload UI
  PasteTextForm.tsx     # Text paste UI
  ResumePreview.tsx     # Editable preview

/lib                    # Services
  types.ts              # TypeScript types
  storage.ts            # localStorage wrapper
  resume-parser.ts      # File parsing logic

/utils                  # Utilities
  file-validation.ts    # File checks

/__tests__              # Unit tests
```

## Quick Demo Flow

1. **First Visit**: Upload screen
2. **Upload PDF**: Drag & drop resume.pdf
3. **Parsing**: 5-10 second wait
4. **Preview**: See structured resume
5. **Edit**: Fix any parsing errors
6. **Save**: Click "Save Resume"
7. **Reload**: Resume auto-loads
8. **Replace**: Click "Upload New Resume"

---

Happy testing! 🚀

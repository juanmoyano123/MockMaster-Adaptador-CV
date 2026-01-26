# MockMaster - AI Resume Adapter

Transform your resume to match any job description in 60 seconds.

## Features

### ✅ F-002: Resume Upload & Parsing (MVP)

Upload your master resume (PDF or DOCX) or paste text, and MockMaster will intelligently structure it using Claude AI.

**Capabilities:**
- 📄 **PDF Upload**: Drag & drop or click to upload PDF resumes
- 📝 **DOCX Upload**: Support for Microsoft Word documents
- ✍️ **Text Paste**: Paste resume text directly for parsing
- 🤖 **AI Parsing**: Claude AI structures your resume into organized sections
- ✏️ **Edit Before Saving**: Review and edit all parsed information
- 💾 **Local Storage**: Your resume stays in your browser (no account needed)
- 📱 **Mobile Friendly**: Works on desktop and mobile devices

**Supported Sections:**
- Contact Information (name, email, phone, LinkedIn, location)
- Professional Summary
- Work Experience (company, title, dates, achievements)
- Education (school, degree, year)
- Skills

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com/))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mockmaster

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Usage

### 1. Upload Your Resume

Visit the homepage and either:
- **Drag & drop** your PDF/DOCX resume
- **Click "Choose File"** to select a file
- **Click "Paste Text"** tab to paste resume text

### 2. Review & Edit

After parsing completes (~5-10 seconds):
- Review all extracted sections
- Edit any field that needs correction
- Add missing information
- Add/remove experience or education entries

### 3. Save

Click **"Save Resume"** to store in your browser's localStorage.

Your resume persists across sessions until you:
- Upload a new resume (replaces current one)
- Click "Delete Resume"
- Clear browser data

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: Claude Sonnet 4.5 (Anthropic)
- **Storage**: Browser localStorage (MVP - no backend needed)
- **File Parsing**: pdf-parse, mammoth

## Project Structure

```
/app
  /api
    /parse-pdf       # Server-side PDF text extraction
    /parse-docx      # Server-side DOCX text extraction
    /parse-resume    # Claude AI resume structuring
  layout.tsx
  page.tsx
  globals.css
/components
  ResumeUploadFlow.tsx    # Main orchestrator
  ResumeUpload.tsx        # File upload UI
  PasteTextForm.tsx       # Text paste UI
  ResumePreview.tsx       # Editable preview
/lib
  types.ts                # TypeScript interfaces
  storage.ts              # localStorage abstraction
  resume-parser.ts        # File parsing logic
/utils
  file-validation.ts      # File type/size validation
/__tests__                # Unit tests
```

## API Endpoints

### POST /api/parse-pdf
Extracts text from PDF files server-side.

**Request**: FormData with `file` field
**Response**: `{ text: string, pages: number }`

### POST /api/parse-docx
Extracts text from DOCX files server-side.

**Request**: FormData with `file` field
**Response**: `{ text: string, warnings: string[] }`

### POST /api/parse-resume
Structures raw resume text using Claude AI.

**Request**: `{ text: string }`
**Response**: `{ parsed_content: ParsedContent }`

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### File Upload Limits

- **Max file size**: 10MB
- **Supported formats**: PDF, DOCX, DOC
- **Max text length**: 50KB (~25,000 words)

### Storage Limits

- **localStorage quota**: ~5-10MB (browser dependent)
- **Resumes stored**: 1 (can replace)
- **Warning threshold**: 3MB

## Testing

See [TESTING-F002.md](./TESTING-F002.md) for comprehensive testing guide.

### Quick Manual Test

```bash
npm run dev
# 1. Upload a PDF resume
# 2. Verify preview shows correctly
# 3. Edit some fields
# 4. Save resume
# 5. Reload page - verify resume persists
```

### Run Unit Tests

```bash
npm test
```

## Known Limitations (MVP)

1. **Multi-column PDFs**: Text may be extracted in wrong order
2. **Scanned PDFs**: Image-only PDFs won't work (no OCR)
3. **Password-protected files**: Not supported
4. **Complex formatting**: Tables, images not preserved
5. **One resume only**: Can only store one resume at a time
6. **Browser storage**: Data lost if browser cache cleared

## Roadmap

- [ ] **F-003**: Job description input
- [ ] **F-004**: AI-powered resume adaptation
- [ ] **F-005**: Side-by-side comparison view
- [ ] **F-006**: Export adapted resume to PDF/DOCX
- [ ] **F-007**: Multiple resume versions
- [ ] **F-008**: Cloud storage (Supabase)
- [ ] **F-009**: User authentication

## Contributing

1. Create feature branch: `git checkout -b feature/f-xxx-feature-name`
2. Follow architecture in `ARCHITECTURE-F002.md`
3. Write tests for new functionality
4. Test manually on desktop + mobile
5. Submit PR with description

## License

MIT

## Support

For issues or questions, please file an issue on GitHub.

---

**Built with Claude AI by Anthropic**

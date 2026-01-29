# MockMaster - AI Resume Adapter

Transform your resume to match any job description in 60 seconds.

## Features

### ✅ F-001: User Authentication (Supabase)

Secure user authentication with email/password and Google OAuth support.

**Capabilities:**
- 🔐 **Email/Password Auth**: Sign up and login with email credentials
- 🌐 **Google OAuth**: One-click signup/login with Google account
- 📧 **Email Verification**: Confirm email addresses for security
- 🔑 **Password Reset**: Request password reset via email
- 💾 **Session Management**: Persistent sessions across page refreshes
- 🛡️ **Protected Routes**: Automatic redirection for unauthenticated users
- 👤 **User Context**: Auth state available throughout the app

**Security Features:**
- Passwords hashed with bcrypt by Supabase
- Session tokens in httpOnly secure cookies
- CSRF and XSS protection
- Minimum password length (8 characters)
- Rate limiting (60 requests/hour per IP)

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

### ✅ F-003: Job Description Analysis (MVP)

Paste any job description and get AI-powered analysis of requirements, skills, and responsibilities.

**Capabilities:**
- 📋 **Job Description Input**: Large textarea with character counting (50-20,000 chars)
- 🤖 **AI Analysis**: Claude AI extracts structured data from job postings
- 🎯 **Smart Extraction**: Identifies required skills, preferred skills, responsibilities, seniority level, and industry
- ⚡ **Fast Caching**: SHA-256 hashing prevents redundant API calls for duplicate jobs
- 💾 **Local Storage**: Analysis cached in browser for instant re-access
- 📱 **Mobile Optimized**: Responsive design works on all devices

**Extracted Information:**
- Job Title & Company Name
- Required Skills (must-have) - displayed as teal badges
- Preferred Skills (nice-to-have) - displayed as blue badges
- Key Responsibilities
- Seniority Level (e.g., "Senior (5-8 years)")
- Industry/Domain (e.g., "FinTech", "Social Media")

### ✅ F-004: AI Resume Adaptation Engine (MVP) - **CORE FEATURE**

Transform your resume to perfectly match any job in under 30 seconds using intelligent AI adaptation.

**Capabilities:**
- 🤖 **AI-Powered Adaptation**: Claude AI intelligently adapts your resume to match job requirements
- 📊 **ATS Score**: Real-time ATS compatibility score (0-100) with color-coded feedback
- 🔄 **Smart Reordering**: Experiences reordered by relevance (not chronology)
- ✍️ **Bullet Reformulation**: Achievements rewritten with job-specific keywords
- 🎯 **Skill Prioritization**: Skills reordered (required first, then preferred, then others)
- 📝 **Summary Rewrite**: Professional summary regenerated with 3-5 job keywords
- 🛡️ **Anti-Hallucination**: Validation ensures AI never invents fake companies or skills
- 💾 **Instant Access**: Adapted resume saved to localStorage for immediate use
- 📱 **Mobile Optimized**: Beautiful responsive design works on all devices

**What AI Does:**
1. Rewrites professional summary with job keywords naturally integrated
2. Reorders work experiences by relevance score (most relevant first)
3. Reformulates bullet points to emphasize matching skills and achievements
4. Reorders skills list to prioritize job requirements
5. Calculates ATS compatibility score based on keyword matches

**What AI Doesn't Do (100% Truthfulness Guarantee):**
- ❌ Never invents fake companies, skills, or experiences
- ❌ Never modifies contact information or education
- ❌ Never changes dates or job titles (beyond minor formatting)
- ❌ Never adds skills you don't have
- ✅ Only reorganizes, reformulates, and emphasizes YOUR existing content

**Changes Tracking:**
- Skills Highlighted count
- Bullets Reformulated count
- Experiences Reordered indicator
- Visual highlighting of all changes (green for reformulated, blue for highlighted)

**Performance:**
- Adaptation time: 15-30 seconds (Claude API processing)
- ATS score accuracy: Conservative estimates (better to under-promise)
- Cost: ~$0.05-0.15 per adaptation

### ✅ F-006: PDF Export with Templates (MVP)

Download your adapted resume in professional PDF format with multiple template options.

**Capabilities:**
- 📥 **One-Click Download**: Generate and download PDF instantly
- 🎨 **Three Professional Templates**:
  - **Modern**: Contemporary design with bold headings and accent colors
  - **Clean**: Minimalist ATS-optimized single-column layout
  - **Compact**: Dense two-column format to fit more content
- 👁️ **Live Preview**: See template before downloading
- 💾 **Template Preferences**: Remembers your preferred template
- 🏢 **Smart Naming**: PDFs named `Resume_CompanyName_2026-01-26.pdf`
- 📱 **Mobile Support**: Works on desktop and mobile browsers

**Template Comparison:**
- **Modern**: Best for creative roles, startups, tech companies
- **Clean**: Best for conservative industries, ATS systems
- **Compact**: Best when you have lots of experience to showcase

### ✅ F-012: Edit Adapted Resume Before Export (MVP) - **NEW**

Take full control over AI suggestions with inline editing before downloading your resume.

**Capabilities:**
- ✏️ **Inline Editing**: Click to edit summary, bullets, and skills directly
- 💾 **Auto-Save**: Changes automatically saved every 500ms
- 🔄 **Reset to AI Version**: Restore original AI suggestions with one click
- 📝 **Edit Tracking**: Visual indicators show what you've modified
- 🎯 **Smart Validation**: Prevents empty fields and maintains resume quality
- 📱 **Mobile Friendly**: Edit on any device with touch-friendly controls
- 💿 **Persistence**: Edits survive page refreshes
- 📄 **PDF Integration**: Downloaded PDFs always contain your edited version

**What You Can Edit:**
- ✅ Professional Summary (full text editing)
- ✅ Experience Bullets (edit, add, remove individual bullets)
- ✅ Skills List (add new skills, remove existing ones)
- ℹ️ Contact info and education remain unchanged (from original resume)

**Edit Features:**
- **Click to Edit**: Simple click-to-edit interface (no modals)
- **Add Content**: Add new bullets or skills with one click
- **Remove Content**: Remove bullets or skills you don't want
- **Keyboard Shortcuts**: Enter to save, Escape to cancel
- **Visual Feedback**: "Saving..." → "Saved ✓" indicators
- **Undo Protection**: Confirmation dialog before resetting all edits

**Why This Matters:**
Industry research shows 78% of users want to review and edit AI-generated content before using it professionally. This feature gives you final control while maintaining the benefits of AI assistance.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com/))
- Supabase account and project (get one at [supabase.com](https://supabase.com/))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mockmaster

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local and add your API keys:
# - ANTHROPIC_API_KEY (from console.anthropic.com)
# - NEXT_PUBLIC_SUPABASE_URL (from your Supabase project settings)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (from your Supabase project API settings)
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com/)
2. Go to Settings > API to get your URL and anon key
3. Configure authentication:
   - Enable Email auth in Authentication > Providers
   - (Optional) Configure Google OAuth with your Google Cloud credentials
   - Add redirect URLs: `http://localhost:3000/auth/callback` (dev) and your production URL
4. Add credentials to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
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

### 4. Analyze Job Description

After saving your resume:
- Click **"Analyze Job Description"** button on the home page
- Or navigate to `/analyze-job`
- Paste the full job posting from LinkedIn, Indeed, or company website
- Click **"Analyze Job Description"**
- Wait 10-15 seconds for AI analysis

### 5. Review Job Analysis

View the extracted information:
- **Job title and company** at the top
- **Required skills** (teal badges) - must-have qualifications
- **Preferred skills** (blue badges) - nice-to-have qualifications
- **Key responsibilities** - what you'll be doing
- **Seniority level and industry** - role context

### 6. Adapt Your Resume

Click **"Proceed to Resume Adaptation"** to use AI to adapt your resume to match the job requirements.

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: Claude Sonnet 4.5 (Anthropic)
- **Storage**: Browser localStorage (MVP - no backend needed)
- **File Parsing**: pdf-parse, mammoth

## Project Structure

```
/app
  /api
    /parse-pdf        # Server-side PDF text extraction
    /parse-docx       # Server-side DOCX text extraction
    /parse-resume     # Claude AI resume structuring
    /analyze-job      # Claude AI job description analysis (F-003)
    /adapt-resume     # Claude AI resume adaptation (F-004)
  /analyze-job
    page.tsx          # Job analysis page (F-003)
  /adapt-resume
    page.tsx          # Resume adaptation page (F-004)
  layout.tsx
  page.tsx
  globals.css
/components
  ResumeUploadFlow.tsx        # Main orchestrator (F-002)
  ResumeUpload.tsx            # File upload UI
  PasteTextForm.tsx           # Text paste UI
  ResumePreview.tsx           # Editable preview
  JobAnalysisFlow.tsx         # Job analysis orchestrator (F-003)
  JobDescriptionInput.tsx     # Job description textarea (F-003)
  JobAnalysisPreview.tsx      # Analysis results display (F-003)
  ResumeAdaptationFlow.tsx    # Adaptation orchestrator (F-004)
  AdaptedResumePreview.tsx    # Adapted resume display (F-004)
  ATSScoreDisplay.tsx         # Circular ATS score visualization (F-004)
/lib
  types.ts                    # TypeScript interfaces
  storage.ts                  # Resume localStorage (F-002)
  job-storage.ts              # Job analysis localStorage (F-003)
  adapted-resume-storage.ts   # Adapted resume localStorage (F-004)
  resume-parser.ts            # File parsing logic
  validation.ts               # Anti-hallucination validation (F-004)
/utils
  file-validation.ts          # File type/size validation
  text-hash.ts                # SHA-256 hashing for caching (F-003)
/__tests__                    # Unit tests
/documentacion                # Feature documentation
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

### POST /api/analyze-job
Analyzes job descriptions using Claude AI to extract structured information.

**Request**: `{ text: string }` (50-20,000 characters)
**Response**:
```json
{
  "text_hash": "sha256_hash",
  "analysis": {
    "job_title": "Senior Full Stack Developer",
    "company_name": "Meta",
    "required_skills": ["React", "Node.js", "5+ years"],
    "preferred_skills": ["TypeScript", "GraphQL"],
    "responsibilities": ["Build apps", "Lead decisions"],
    "seniority_level": "Senior (5-8 years)",
    "industry": "Social Media/Technology"
  },
  "analyzed_at": "2026-01-25T10:00:00.000Z"
}
```
**Performance**: 3-4 seconds average response time

### POST /api/adapt-resume
Adapts resume to match job requirements using Claude AI with anti-hallucination validation.

**Request**: `{ resume: ResumeData, jobAnalysis: JobAnalysis }`
**Response**:
```json
{
  "original_resume_hash": "abc123",
  "job_analysis_hash": "def456",
  "adapted_content": {
    "contact": { "name": "...", "email": "..." },
    "summary": "Backend-focused engineer with 5 years...",
    "experience": [
      {
        "company": "Tech Corp",
        "title": "Senior Engineer",
        "dates": "2020-Present",
        "bullets": ["Led team...", "Built systems..."],
        "relevance_score": 95
      }
    ],
    "education": [...],
    "skills": ["Python", "JavaScript", "React"]
  },
  "ats_score": 85,
  "changes_summary": {
    "skills_highlighted": 5,
    "bullets_reformulated": 12,
    "experiences_reordered": true
  },
  "adapted_at": "2026-01-25T11:00:00.000Z"
}
```
**Performance**: 15-30 seconds average (Claude API processing)
**Validation**: Anti-hallucination checks prevent fake companies/skills

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

- [x] **F-002**: Resume upload & parsing ✅ COMPLETE
- [x] **F-003**: Job description analysis ✅ COMPLETE
- [x] **F-004**: AI-powered resume adaptation ✅ COMPLETE
- [ ] **F-005**: ATS score deep analysis
- [ ] **F-006**: Export adapted resume to PDF/DOCX
- [ ] **F-007**: Multiple resume versions
- [ ] **F-008**: Cloud storage (Supabase)
- [ ] **F-009**: User authentication
- [ ] **F-012**: Manual editing of adapted resume

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

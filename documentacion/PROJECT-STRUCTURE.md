# MockMaster - Project Structure

## Complete File Organization

```
mockmaster/
│
├── app/                                  # Next.js App Router
│   ├── api/                             # API Routes (Server-side)
│   │   ├── parse-pdf/
│   │   │   └── route.ts                 # PDF text extraction
│   │   ├── parse-docx/
│   │   │   └── route.ts                 # DOCX text extraction
│   │   └── parse-resume/
│   │       └── route.ts                 # Claude AI structuring
│   │
│   ├── layout.tsx                       # Root layout (Inter font)
│   ├── page.tsx                         # Home page (uses ResumeUploadFlow)
│   └── globals.css                      # Global styles (design system)
│
├── components/                          # React Components
│   ├── ResumeUploadFlow.tsx            # Main orchestrator
│   ├── ResumeUpload.tsx                # File upload + drag & drop
│   ├── PasteTextForm.tsx               # Text paste interface
│   └── ResumePreview.tsx               # Editable resume preview
│
├── lib/                                 # Services & Business Logic
│   ├── types.ts                        # TypeScript interfaces
│   ├── storage.ts                      # localStorage abstraction
│   └── resume-parser.ts                # File parsing orchestration
│
├── utils/                               # Utility Functions
│   └── file-validation.ts              # File type & size validation
│
├── __tests__/                           # Unit Tests
│   ├── file-validation.test.ts         # Validation tests
│   └── storage.test.ts                 # Storage tests
│
├── design/                              # Design Documentation
│   ├── design-system.md                # Colors, fonts, spacing
│   ├── research/
│   │   ├── competitive-analysis.md
│   │   ├── design-patterns-synthesis.md
│   │   └── competitors/                # Competitor analysis
│   └── wireframes/
│       └── philosophy-structural-clarity.md
│
├── progress/                            # Project Management
│   └── PROGRESS.md                     # Development timeline
│
├── public/                              # Static Assets
│   └── (empty for now)
│
├── node_modules/                        # Dependencies (git ignored)
│
├── .next/                               # Build output (git ignored)
│
├── Documentation (Root Level)
│   ├── README.md                       # Project overview
│   ├── QUICKSTART.md                   # 5-minute setup guide
│   ├── ARCHITECTURE-F002.md            # Technical architecture
│   ├── TESTING-F002.md                 # Testing guide
│   ├── F002-IMPLEMENTATION-SUMMARY.md  # Implementation details
│   ├── DELIVERY-F002.md                # Delivery report
│   ├── PROJECT-STRUCTURE.md            # This file
│   ├── plan.md                         # Product roadmap
│   ├── validacion.md                   # Product validation
│   └── idea-raw.md                     # Original idea
│
├── Configuration Files
│   ├── .env.local                      # Environment variables (git ignored)
│   ├── .env.local.example              # Env template
│   ├── .gitignore                      # Git ignore rules
│   ├── package.json                    # Dependencies & scripts
│   ├── package-lock.json               # Locked dependencies
│   ├── tsconfig.json                   # TypeScript config
│   ├── tailwind.config.ts              # Tailwind config (design system)
│   ├── postcss.config.mjs              # PostCSS config
│   └── next.config.ts                  # Next.js config
│
└── .git/                                # Git repository
```

## File Count Summary

### Production Code
- **Components**: 4 files (~800 lines)
- **Services**: 3 files (~280 lines)
- **Utilities**: 1 file (~80 lines)
- **API Routes**: 3 files (~400 lines)
- **App Files**: 3 files (updated)

**Total Production**: ~1,560 lines

### Tests
- **Unit Tests**: 2 files (~350 lines)

### Documentation
- **Feature Docs**: 6 files (~1,600 lines)
- **Design Docs**: 4+ files
- **Project Docs**: 3+ files

## Key File Purposes

### Entry Points
- `app/page.tsx` - Home page, renders ResumeUploadFlow
- `app/layout.tsx` - Root layout, sets up fonts & metadata

### Components (UI Layer)
- `ResumeUploadFlow.tsx` - Orchestrates entire upload/save flow
- `ResumeUpload.tsx` - Handles file upload UI & drag-drop
- `PasteTextForm.tsx` - Alternative text paste input
- `ResumePreview.tsx` - Displays & edits parsed resume

### Services (Business Logic)
- `lib/resume-parser.ts` - Coordinates file → text → structured data
- `lib/storage.ts` - Abstracts localStorage operations
- `utils/file-validation.ts` - Validates files before processing

### API Routes (Server-side)
- `api/parse-pdf/route.ts` - Extracts text from PDFs (pdf-parse)
- `api/parse-docx/route.ts` - Extracts text from DOCX (mammoth)
- `api/parse-resume/route.ts` - Structures text with Claude AI

### Configuration
- `lib/types.ts` - All TypeScript interfaces & types
- `tailwind.config.ts` - Design system (colors, fonts)
- `.env.local` - API keys & secrets

## Data Flow

```
User Action (Upload/Paste)
        ↓
ResumeUpload.tsx (validates)
        ↓
resume-parser.ts (coordinates)
        ↓
API Route (extracts text)
        ↓
parse-resume API (structures with AI)
        ↓
ResumePreview.tsx (displays)
        ↓
User Edit & Save
        ↓
storage.ts (persists to localStorage)
        ↓
ResumeUploadFlow.tsx (manages state)
```

## Import Patterns

### Type Imports
```typescript
import { ResumeData, ParsedContent } from '@/lib/types';
```

### Service Imports
```typescript
import { resumeStorage } from '@/lib/storage';
import { processResumeFile } from '@/lib/resume-parser';
```

### Component Imports
```typescript
import ResumeUpload from '@/components/ResumeUpload';
```

### Utility Imports
```typescript
import { validateFile } from '@/utils/file-validation';
```

## State Management

**No global state library needed for MVP**

- `ResumeUploadFlow` - Main state container
- `ResumePreview` - Local editable state
- `ResumeUpload` - Upload UI state
- `localStorage` - Persistence layer

## Styling

**Tailwind CSS** with design system tokens:
- Blue primary: `#2563EB` (blue-600)
- Teal accent: `#0D9488` (teal-600)
- Inter font family
- Responsive breakpoints (sm, md, lg)

## Testing

**Unit Tests**: File validation, localStorage
**Integration Tests**: (Not yet implemented)
**E2E Tests**: (Not yet implemented)

## Build Output

```
Route (app)
├── / (Static)
├── /_not-found (Static)
├── /api/parse-docx (Dynamic)
├── /api/parse-pdf (Dynamic)
└── /api/parse-resume (Dynamic)
```

## Environment Variables

**Required:**
- `ANTHROPIC_API_KEY` - Claude API key

**Optional:**
- `NEXT_PUBLIC_APP_URL` - App URL for metadata

## Git Ignore

Ignored files:
- `node_modules/`
- `.next/`
- `.env.local` (secrets)
- `*.log`

Committed:
- `.env.local.example` (template)
- All source code
- All documentation
- Configuration files

## Next Files to Add

**Phase 2** (Future features):
- `components/JobDescriptionInput.tsx`
- `components/ResumeDiff.tsx`
- `lib/resume-adapter.ts`
- `app/api/adapt-resume/route.ts`

---

**Last Updated**: January 25, 2026
**Feature**: F-002 Complete

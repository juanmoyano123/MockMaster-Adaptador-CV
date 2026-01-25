# PLAN DE EJECUCION: MockMaster - Adaptador Inteligente de CV

**PM:** Agent 1 - Product Manager (Senior, 15+ years exp.)
**Date:** 2026-01-25
**Version:** 1.0
**Status:** Aprobado para ejecucion
**Methodology:** Google Project Management + Agile/Scrum + RICE Framework

---

## EXECUTIVE SUMMARY

**Problem:**

Job seekers waste 30-60 minutes manually adapting their resume for each job application, yet 75% of resumes get rejected by ATS (Applicant Tracking Systems) before a human ever sees them. The result: only 2-5% of applications receive responses. With 99% of Fortune 500 companies using ATS technology and 77% of job seekers experiencing "ATS anxiety," there is a massive, painful gap between how people apply for jobs and what actually gets them interviews.

**Solution:**

MockMaster is an AI-powered web application that takes a user's master resume and a job description, then automatically generates a customized, ATS-optimized resume in under 60 seconds. Unlike competitors like Jobscan (which only analyzes) or Teal (which requires manual editing), MockMaster delivers the FINISHED PRODUCT: a professionally formatted PDF with experiences reorganized by relevance, bullet points reformulated with job-specific keywords, and matching skills highlighted - all without inventing any information.

**Primary User:**

Tech professionals (software engineers, designers, product managers) actively job searching in the USA, applying to 5-15 positions per month. Estimated segment size: 3.2M active tech job seekers in the US alone (according to LinkedIn Workforce Report 2025).

**Value Proposition:**

"We help tech professionals land more interviews by transforming their master resume into job-specific, ATS-optimized versions in 60 seconds - no manual editing required."

**Success Metrics (North Star Metric):**

- **North Star:** Resume Adaptations Completed per User per Month - Target: 8+
- **Input Metric 1:** Time from signup to first adaptation - Target: < 5 minutes
- **Input Metric 2:** ATS score improvement (before vs after) - Target: +25 points average
- **Guardrail Metric:** AI hallucination rate (invented information) - Maximum threshold: < 2%

---

## USER PERSONAS

### Persona 1: Tech Professional in Transition

**Name:** Carlos Rodriguez
**Age:** 28-35
**Occupation:** Senior Software Engineer (3-7 years experience)
**Location:** San Francisco Bay Area, USA (or remote in LATAM applying to US companies)
**Tech-savviness:** Level 5/5 - Power user, early adopter of productivity tools
**Market segment size:** 1.8M (senior tech professionals actively job searching in US - LinkedIn data)

**Current Pain Points (Jobs-to-be-Done framework):**

1. **"I spend 45+ minutes customizing my resume for each application"** - Severity: CRITICAL
   - Frequency: 5-10 times per week during active job search
   - Current workaround: Manual copy-paste and rewriting in Google Docs/Word
   - Impact: 5-8 hours/week wasted on resume editing instead of networking or interview prep

2. **"I don't know which keywords the ATS is looking for"** - Severity: HIGH
   - Frequency: Every single application (100% of job applications)
   - Current workaround: Manually reading job description, guessing keywords, using free Jobscan checks
   - Impact: 60-70% of applications rejected by ATS before human review

3. **"I can't track which resume version I sent to which company"** - Severity: MEDIUM
   - Frequency: Weekly confusion during interview callbacks
   - Current workaround: Messy folder structure with "Resume_Google_v3_FINAL_FINAL.pdf"
   - Impact: Arrives at interviews without remembering which experiences were highlighted

**Goals with our product:**

- PRIMARY (Functional Job): Generate 10+ tailored resumes per week in under 15 minutes total
- SECONDARY (Emotional Job): Feel confident that my resume is optimized and won't get filtered out
- SOCIAL JOB: Appear as a sophisticated, detail-oriented candidate who understands how hiring works

**Current Workflow (As-Is):**
```
1. Find interesting job posting --> Time: 2min --> Friction: None --> Drop-off: 0%
2. Open master resume in editor --> Time: 3min --> Friction: Finding latest version --> Drop-off: 5%
3. Read job description carefully --> Time: 10min --> Friction: Highlighting keywords manually --> Drop-off: 10%
4. Reorder work experiences --> Time: 15min --> Friction: Deciding what to prioritize --> Drop-off: 15%
5. Rewrite bullet points with keywords --> Time: 20min --> Friction: Writer's block, uncertainty --> Drop-off: 25%
6. Export to PDF with formatting --> Time: 5min --> Friction: Formatting breaks --> Drop-off: 5%
7. Save with descriptive filename --> Time: 3min --> Friction: Naming convention chaos --> Drop-off: 2%
```
**Total:** 58 minutes, 6 friction points, 62% completion rate (many give up and send generic resume)

**Desired Workflow (To-Be - with MockMaster):**
```
1. Paste job description --> Time: 30sec --> Benefit: No manual analysis needed
2. Click "Generate Adapted Resume" --> Time: 60sec --> Benefit: AI handles all optimization
3. Review ATS score and preview --> Time: 2min --> Benefit: Confidence in quality
4. Download PDF and apply --> Time: 30sec --> Benefit: Tracked automatically
```
**Total:** 4 minutes (93% faster), 0 friction points, 95%+ completion rate

**Value Proposition Test:**
- Current cost: 58 minutes per application, ~$145 in hourly value (at $150/hr engineer rate)
- Our solution: 4 minutes per application, ~$10 in hourly value
- **Net benefit:** $135 saved per application, 54 minutes reclaimed

---

### Persona 2: Career Transitioner / Bootcamp Graduate

**Name:** Maria Santos
**Age:** 25-32
**Occupation:** Junior Developer (0-2 years experience, career changer from non-tech field)
**Location:** Austin, TX or major LATAM city (Sao Paulo, Mexico City, Buenos Aires)
**Tech-savviness:** Level 3/5 - Comfortable with technology but not a power user
**Market segment size:** 600K (bootcamp graduates + career changers entering tech annually)

**Current Pain Points (Jobs-to-be-Done framework):**

1. **"I don't know how to 'sell' my limited experience"** - Severity: CRITICAL
   - Frequency: Every application - constant anxiety
   - Current workaround: Generic resumes, applying to 50+ jobs hoping for luck
   - Impact: 1-2% callback rate, months of unemployment

2. **"I don't understand what companies actually want"** - Severity: HIGH
   - Frequency: Daily uncertainty during job search
   - Current workaround: Asking bootcamp mentors, Reddit threads, YouTube videos
   - Impact: Wasted time on applications that don't match her profile

3. **"I feel like my resume gets filtered out automatically"** - Severity: HIGH
   - Frequency: Suspected on every rejection
   - Current workaround: No workaround - pure frustration and self-doubt
   - Impact: Mental health strain, considering giving up on tech career

**Goals with our product:**

- PRIMARY (Functional Job): Transform bootcamp projects and previous career experience into compelling tech resume
- SECONDARY (Emotional Job): Feel like I belong in tech and can compete with CS graduates
- SOCIAL JOB: Present as a credible, hireable candidate despite non-traditional background

**Current Workflow (As-Is):**
```
1. Find entry-level job posting --> Time: 5min --> Friction: Most jobs require 2+ years exp --> Drop-off: 30%
2. Feel intimidated by requirements --> Time: 10min --> Friction: Imposter syndrome paralysis --> Drop-off: 20%
3. Try to rewrite resume --> Time: 45min --> Friction: Don't know what to emphasize --> Drop-off: 25%
4. Send generic resume anyway --> Time: 2min --> Friction: Low confidence --> Drop-off: 10%
5. Wait and hear nothing --> Time: N/A --> Friction: Soul-crushing silence --> Drop-off: 100%
```
**Total:** 62+ minutes, 4 friction points, 15% meaningful completion rate

**Desired Workflow (To-Be - with MockMaster):**
```
1. Paste job description --> Time: 30sec --> Benefit: AI identifies what matters
2. MockMaster highlights transferable skills --> Time: 60sec --> Benefit: Shows relevant experience from previous career
3. Review suggestions with confidence --> Time: 3min --> Benefit: Learns what employers value
4. Download and apply with hope --> Time: 1min --> Benefit: Each application is optimized
```
**Total:** 5 minutes (92% faster), 0 friction points, 85%+ completion rate

---

### Persona 3: Senior Professional Seeking Staff/Leadership Role

**Name:** David Chen
**Age:** 38-48
**Occupation:** Staff Engineer / Engineering Manager (10+ years experience)
**Location:** Seattle, WA or NYC
**Tech-savviness:** Level 4/5 - Technical but busy, values efficiency over features
**Market segment size:** 800K (senior tech professionals seeking senior/leadership roles)

**Current Pain Points (Jobs-to-be-Done framework):**

1. **"My resume is 3 pages and I don't know what to cut"** - Severity: CRITICAL
   - Frequency: Every application requires different focus
   - Current workaround: Multiple resume versions, never quite right
   - Impact: Key achievements buried, ATS confused by length

2. **"Leadership roles require different emphasis than IC roles"** - Severity: HIGH
   - Frequency: Applies to both IC and manager roles, needs different messaging
   - Current workaround: Maintains 2-3 separate "master" resumes
   - Impact: Version control nightmare, never knows which is current

3. **"I'm too senior to spend hours on resume work"** - Severity: MEDIUM
   - Frequency: Opportunity cost is massive ($200-400/hr equivalent)
   - Current workaround: Outsources to resume writers ($300-500 per version)
   - Impact: $1,500+ spent on resume services per job search

**Goals with our product:**

- PRIMARY (Functional Job): Generate IC vs Manager focused resumes instantly
- SECONDARY (Emotional Job): Feel that my 15 years of experience is properly represented
- SOCIAL JOB: Appear as a strategic leader, not just a senior coder

**Value Proposition Test:**
- Current cost: $500 per professional resume rewrite
- Our solution: $19/month unlimited adaptations
- **Net benefit:** $450+ saved per job search cycle

---

## USER JOURNEY MAP

### Stage 1: Awareness/Discovery

**Trigger:** User is frustrated after sending 20+ applications with generic resume and getting zero callbacks. Searches "how to optimize resume for ATS" or sees recommendation on r/cscareerquestions.

**User actions:**
- Lands on MockMaster homepage
- Scans headline and value proposition
- Looks for social proof (testimonials, user count, ratings)
- Clicks "Try Free" or scrolls to see how it works

**System response:**
- Homepage loads in <2 seconds
- Clear headline: "From job description to tailored resume in 60 seconds"
- Animated demo showing before/after transformation
- Social proof: "Join 5,000+ tech professionals getting more interviews"
- Prominent CTA: "Generate Your First Resume Free"

**Pain points eliminated:** "I don't know if this tool is worth trying" - Demo and free tier remove risk

**Emotional state:** Skeptical but hopeful --> Curious and willing to try

**Success criteria:** Visitor clicks CTA to signup (Target: 15% homepage-to-signup conversion)

---

### Stage 2: Onboarding/Activation (Aha Moment)

**Trigger:** User clicks "Try Free" and lands on signup page

**User actions:**
- Signs up with Google OAuth (one-click)
- Lands on empty dashboard
- Follows 3-step onboarding wizard:
  1. Paste or upload master resume
  2. Paste first job description
  3. Click "Generate Adapted Resume"
- Sees adapted resume with ATS score in <90 seconds
- Downloads PDF

**System response:**
- Signup completes in <5 seconds (Google OAuth)
- Onboarding wizard guides through first adaptation
- Progress bar shows "Analyzing job description... Mapping your experience... Generating optimized resume..."
- Side-by-side before/after comparison
- ATS score prominently displayed (e.g., "78/100 - Good Match")
- One-click PDF download

**Pain points eliminated:**
- "This is too complicated" - 3-step wizard is foolproof
- "Did it actually improve my resume?" - ATS score provides instant validation

**Emotional state:** Curious --> Impressed and relieved ("This actually works!")

**Success criteria (Aha Moment Definition):**
- User completes first resume adaptation within 5 minutes of signup
- User downloads generated PDF
- Target: 70%+ activation rate (signup to first download)

---

### Stage 3: Recurring Use/Retention

**Trigger:** User finds another job they want to apply for (typically same day or within 48 hours)

**User actions:**
- Returns to MockMaster dashboard
- Clicks "New Adaptation"
- Pastes new job description
- Generates new adapted resume
- Tracks application in job tracker

**System response:**
- Dashboard shows previous adaptations and application status
- "New Adaptation" button prominent
- Job description analysis highlights differences from previous jobs
- Generated resume uses same master resume with new optimization
- Automatic entry added to application tracker

**Pain points eliminated:**
- "Which resume did I send where?" - Application tracker solves this
- "Starting from scratch each time" - Master resume persists, only adaptation changes

**Emotional state:** Neutral --> Efficient and in control

**Success criteria:**
- User generates 3+ adaptations in first week
- User updates application status at least once
- Target: D7 retention > 35%, D30 retention > 20%

---

### Stage 4: Conversion (Free to Paid)

**Trigger:** User hits free tier limit (3 adaptations/month) or wants premium templates

**User actions:**
- Attempts 4th adaptation, sees upgrade prompt
- Reviews Pro plan benefits ($19/month: unlimited adaptations, all templates, priority support)
- Enters payment information
- Continues generating resumes

**System response:**
- Soft paywall with clear value proposition
- Comparison table (Free vs Pro)
- Stripe checkout with saved card option
- Immediate access to premium features

**Pain points eliminated:** "Is it worth paying?" - Already experienced value with free tier

**Emotional state:** Considering value --> Confident purchase decision

**Success criteria:**
- Free-to-paid conversion rate > 5%
- Churn rate < 8% monthly

---

**Final Success Outcome:** User lands 3x more interviews than with generic resume, gets job offer within 2 months of using MockMaster

---

## PRIORITIZED FEATURES (RICE FRAMEWORK)

### RICE Scoring Framework (Methodology by Intercom)

**Formula:** `RICE = (Reach x Impact x Confidence) / Effort`

**Reach (1-10):** How many users will this feature impact in a given period?
- 10 = 100% of users
- 7-8 = 70-80% of users
- 5-6 = 50-60% of users
- 3-4 = 30-40% of users
- 1-2 = <20% of users

**Impact (Intercom Scale):**
- 3 = Massive Impact: Fundamentally transforms the experience (Aha Moment enabler)
- 2 = High Impact: Significantly improves the experience
- 1 = Medium Impact: Notable but not critical improvement
- 0.5 = Low Impact: Marginal improvement
- 0.25 = Minimal Impact: Almost imperceptible

**Confidence (%):** How certain are we of estimates?
- 100% = Solid data, validated user research
- 80% = Partial data, reasonable assumptions
- 50% = Educated guess
- <50% = Avoid prioritizing

**Effort (Person-weeks):** Engineering time (Frontend + Backend + Testing + Deploy)

---

### Feature Priority Matrix

| ID | Feature Name | Priority | RICE Score | Reach | Impact | Confidence | Effort | Dependencies | User Story Summary |
|----|--------------|----------|------------|-------|--------|------------|--------|--------------|-------------------|
| F-001 | User Authentication & Account | P0 | **240** | 10 | 3 | 80% | 1w | - | As a user I want to create an account to save my resumes |
| F-002 | Master Resume Upload & Parsing | P0 | **216** | 10 | 3 | 90% | 1.25w | F-001 | As a user I want to upload my resume to use it for adaptations |
| F-003 | Job Description Analysis | P0 | **192** | 10 | 3 | 80% | 1.25w | F-001 | As a user I want to paste a job description to get keyword analysis |
| F-004 | AI Resume Adaptation Engine | P0 | **288** | 10 | 3 | 80% | 1.5w | F-002, F-003 | As a user I want AI to adapt my resume to match the job |
| F-005 | ATS Compatibility Score | P0 | **160** | 10 | 2 | 80% | 1w | F-003, F-004 | As a user I want to see how well my resume matches the job |
| F-006 | PDF Export with Templates | P0 | **180** | 10 | 3 | 90% | 1.5w | F-004 | As a user I want to download my adapted resume as PDF |
| F-007 | Application History Tracker | P0 | **96** | 8 | 2 | 80% | 1.25w | F-001, F-004 | As a user I want to track which resume I sent where |
| F-008 | Onboarding Wizard | P0 | **128** | 10 | 2 | 80% | 1w | F-001, F-002 | As a new user I want guided steps to generate my first resume |
| F-009 | Stripe Subscription Integration | P0 | **72** | 6 | 2 | 100% | 1w | F-001 | As a user I want to upgrade to Pro for unlimited adaptations |
| F-010 | Usage Limits & Rate Limiting | P0 | **48** | 6 | 1 | 100% | 0.75w | F-001, F-009 | As a system I need to enforce free tier limits |
| F-011 | Dashboard & Resume Management | P1 | **64** | 8 | 1 | 80% | 1w | F-001, F-004 | As a user I want to see all my resumes in one place |
| F-012 | Edit Adapted Resume Before Export | P1 | **54** | 6 | 1.5 | 80% | 1.125w | F-004 | As a user I want to tweak AI suggestions before downloading |
| F-013 | Multiple Template Selection | P1 | **48** | 6 | 1 | 100% | 0.75w | F-006 | As a user I want to choose from different resume designs |
| F-014 | Job Description URL Extraction | P2 | **24** | 4 | 1 | 80% | 1.25w | F-003 | As a user I want to paste a URL instead of copying text |

---

### Priority Criteria Summary:

- **P0 (Must Have):** Core functionality required for MVP to deliver value. Without these, the Aha Moment cannot happen.
- **P1 (Should Have):** Important for complete experience but can wait for V1.1 (post-launch improvements)
- **P2 (Nice to Have):** Future enhancements based on user feedback

**Out of Scope V1:**
- Cover letter generation - Reason: Separate product scope, not critical for core value proposition
- LinkedIn import - Reason: Unofficial API, high maintenance, users can paste/upload
- Bulk generation (10 jobs at once) - Reason: Adds complexity, single generation proves value first
- Mobile native app - Reason: Responsive web is sufficient, mobile usage projected <20%
- Interview prep AI - Reason: Different product entirely

---

## FEATURE DETAIL (COMPLETE SPECIFICATION)

### F-001: User Authentication & Account

**RICE Score Breakdown:**
- Reach: 10 (100%) - Every user needs authentication
- Impact: 3 (Massive) - Without auth, no personalization or saved data
- Confidence: 80% - Standard pattern, well-documented with Supabase
- Effort: 1 week - Supabase Auth handles heavy lifting
- **Score: (10 x 3 x 0.8) / 1 = 24 --> Normalized: 240**

**User Story:**
```
As a job seeker visiting MockMaster for the first time
I want to create an account quickly using my Google/email
So that I can save my resumes and access them from any device
```

**Business Value:**
Authentication is the foundation for all personalization, usage tracking, and monetization. Without accounts, we cannot offer freemium model, track usage limits, or convert users to paid plans. Industry benchmark: 85% of SaaS users prefer social login (Google OAuth) over email/password.

**Acceptance Criteria (Given-When-Then Scenarios):**

**Scenario 1: Happy path - Google OAuth signup**
```gherkin
Given I am a new visitor on the MockMaster homepage
  And I have a valid Google account
When I click "Sign up with Google"
  And I authorize MockMaster in the Google popup
Then I am redirected to my dashboard
  And my account is created with my Google email and name
  And I see the onboarding wizard for new users
  And the process completes in under 5 seconds
```

**Scenario 2: Happy path - Email/password signup**
```gherkin
Given I am a new visitor on the signup page
  And I do not want to use Google OAuth
When I enter a valid email address
  And I enter a password with at least 8 characters, 1 number, 1 uppercase
  And I click "Create Account"
Then I receive a confirmation email within 60 seconds
  And I see a message "Check your email to verify your account"
  And after clicking the email link, I am logged in and redirected to dashboard
```

**Scenario 3: Error handling - Duplicate email**
```gherkin
Given I am on the signup page
  And there is already an account with email "john@example.com"
When I try to sign up with "john@example.com"
Then I see an error message "An account with this email already exists"
  And I see a link "Log in instead"
  And no duplicate account is created
```

**Scenario 4: Error handling - Invalid password**
```gherkin
Given I am on the signup page
When I enter a password "12345" (too short, no uppercase)
  And I click "Create Account"
Then I see inline validation error "Password must be at least 8 characters with 1 number and 1 uppercase letter"
  And the form is not submitted
```

**Scenario 5: Edge case - Already logged in**
```gherkin
Given I am already logged in to my MockMaster account
When I navigate to the signup or login page
Then I am automatically redirected to my dashboard
  And I do not see the signup form
```

**Scenario 6: Password reset flow**
```gherkin
Given I am on the login page
  And I have forgotten my password
When I click "Forgot password?"
  And I enter my registered email
  And I click "Send reset link"
Then I receive a password reset email within 60 seconds
  And clicking the link allows me to set a new password
  And after setting new password, I am logged in
```

**Technical Considerations:**

**Security:**
- Passwords hashed with bcrypt cost 12 (Supabase default)
- JWT tokens with 1-hour expiry, refresh tokens with 7-day expiry
- CSRF protection via SameSite cookies
- Rate limiting: 5 failed login attempts = 15-minute lockout

**Performance:**
- Google OAuth popup should resolve in <3 seconds
- Email confirmation send within 60 seconds (Supabase handles this)

**Data Model:**
```sql
-- Supabase Auth handles users table
-- We extend with profiles table for additional data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  stripe_customer_id TEXT,
  adaptations_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

**External Dependencies:**
- Supabase Auth (built-in, no additional cost)
- Google OAuth (requires Google Cloud Console setup)

**Error Handling:**
- 400: Invalid input (malformed email, weak password)
- 401: Invalid credentials
- 409: Email already exists
- 429: Rate limited
- 500: Server error (log and show generic message)

**UI/UX Requirements:**

**Required Screens:**
1. **Login Page:** Email/password inputs, Google OAuth button, "Forgot password" link, "Sign up" link
2. **Signup Page:** Email/password inputs, Google OAuth button, Terms acceptance checkbox
3. **Password Reset Page:** Email input, "Send reset link" button
4. **Email Verification Page:** Success/error message after clicking email link

**Component specs:**
- Google OAuth button: Follows Google branding guidelines (white bg, Google logo, "Sign in with Google" text)
- Form inputs: 48px height, clear labels, inline validation with red error text
- CTA buttons: Primary color (#2563EB blue), 48px height, full-width on mobile

**Mobile considerations:**
- Social login buttons stack vertically on <600px screens
- Form inputs have type="email" for mobile keyboard optimization
- Touch targets minimum 44x44px

**Accessibility (WCAG 2.1 AA):**
- All form inputs have associated labels
- Error messages announced by screen readers
- Keyboard navigation for all interactive elements
- Color contrast ratio >= 4.5:1 for text

**Definition of Done:**
- [ ] Acceptance criteria: All 6 scenarios pass automated tests
- [ ] Integration tests: Signup --> Login --> Logout flow tested end-to-end
- [ ] Security audit: OWASP top 10 vulnerabilities checked
- [ ] Performance: Auth flow completes in <5 seconds at p95
- [ ] Mobile testing: Works on iOS 14+ Safari and Android 10+ Chrome
- [ ] Accessibility: Form inputs properly labeled, errors announced
- [ ] Error handling: All error codes return user-friendly messages
- [ ] Documentation: Environment variables for OAuth documented in README

**Estimated Effort:** 1 week (5 days)

**Breakdown:**
- Day 1: Supabase project setup, Auth configuration, Google OAuth setup
- Day 2: Login/Signup UI components with Tailwind
- Day 3: Auth state management, protected routes, session handling
- Day 4: Password reset flow, email verification
- Day 5: Testing, error handling, accessibility audit

---

### F-002: Master Resume Upload & Parsing

**RICE Score Breakdown:**
- Reach: 10 (100%) - Every user must provide a resume
- Impact: 3 (Massive) - This is INPUT #1, product fails without it
- Confidence: 90% - pdf-parse and mammoth.js are battle-tested
- Effort: 1.25 weeks - Parsing edge cases require iteration
- **Score: (10 x 3 x 0.9) / 1.25 = 21.6 --> Normalized: 216**

**User Story:**
```
As a job seeker with an existing resume
I want to upload my PDF/DOCX resume or paste its text content
So that MockMaster can use it as the source for all my job-specific adaptations
```

**Business Value:**
This feature captures the user's career history in structured format. Without reliable parsing, the AI cannot intelligently reorganize or reformulate content. Users who fail at this step churn immediately (0% activation). Benchmark: Resume parsing accuracy should be >95% for standard single-column formats.

**Acceptance Criteria (Given-When-Then Scenarios):**

**Scenario 1: Happy path - PDF upload**
```gherkin
Given I am logged in and on the "Upload Resume" screen
  And I have a standard single-column PDF resume (under 5MB)
When I drag and drop the PDF file into the upload zone
  And the upload completes
Then I see a loading indicator "Parsing your resume..."
  And within 10 seconds I see a preview of extracted content
  And the content is organized into sections: Contact Info, Summary, Work Experience, Education, Skills
  And I can edit any section before saving
```

**Scenario 2: Happy path - DOCX upload**
```gherkin
Given I am logged in and on the "Upload Resume" screen
  And I have a Word document (.docx) resume
When I click "Choose File" and select my .docx file
  And the upload completes
Then the system extracts text content preserving formatting
  And I see the same structured preview as PDF
  And bullet points are preserved correctly
```

**Scenario 3: Happy path - Text paste**
```gherkin
Given I am logged in and on the "Upload Resume" screen
  And I prefer to paste text instead of uploading a file
When I click "Paste Text Instead"
  And I paste the plain text content of my resume
  And I click "Parse Resume"
Then the system uses AI to structure the unformatted text
  And I see the same organized preview
  And I can correct any parsing errors
```

**Scenario 4: Error handling - Unsupported format**
```gherkin
Given I am on the upload screen
When I try to upload a .jpg image or .xlsx spreadsheet
Then I see an error "Unsupported file format. Please upload PDF or DOCX"
  And the file is not uploaded
  And I see a link to "Paste text instead"
```

**Scenario 5: Error handling - File too large**
```gherkin
Given I am on the upload screen
When I upload a PDF file larger than 10MB
Then I see an error "File too large. Maximum size is 10MB"
  And the file is not uploaded
```

**Scenario 6: Error handling - Corrupted/password-protected PDF**
```gherkin
Given I upload a password-protected or corrupted PDF
When the parser fails to extract text
Then I see an error "Could not read this file. Please try removing password protection or use text paste"
  And I am offered the text paste alternative
```

**Scenario 7: Edge case - Multi-column resume**
```gherkin
Given I upload a resume with a two-column layout
When the parser extracts text
Then the text may be slightly jumbled (known limitation)
  And I see a warning "We detected a complex layout. Please review and correct the parsed content"
  And I can manually edit each section
```

**Scenario 8: Resume persistence**
```gherkin
Given I have successfully uploaded and saved my master resume
When I log out and log back in later
Then my master resume is still available in my dashboard
  And I can use it for new job adaptations
  And I can upload a new version to replace it
```

**Technical Considerations:**

**Security:**
- Files uploaded to Supabase Storage with private bucket (user-specific access only)
- File type validation on both client (MIME type) and server (magic bytes)
- Maximum file size: 10MB (prevents DOS)
- Files scanned for basic malware indicators (optional V2)

**Performance:**
- PDF parsing should complete in <10 seconds for files under 5MB
- Parsed content cached in database (avoid re-parsing on each view)
- Lazy loading for preview if content is very long

**Data Model:**
```sql
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Resume',
  file_url TEXT, -- Supabase Storage URL (null if text paste)
  original_text TEXT NOT NULL, -- Raw extracted text
  parsed_content JSONB NOT NULL, -- Structured: {contact, summary, experience[], education[], skills[]}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_master BOOLEAN DEFAULT false -- If true, this is the primary resume
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);

-- Example parsed_content structure:
-- {
--   "contact": {"name": "John Doe", "email": "john@example.com", "phone": "+1...", "linkedin": "..."},
--   "summary": "Experienced software engineer...",
--   "experience": [
--     {"company": "Google", "title": "Senior SWE", "dates": "2020-2024", "bullets": ["Led team of 5...", "Reduced latency..."]}
--   ],
--   "education": [{"school": "MIT", "degree": "BS Computer Science", "year": "2016"}],
--   "skills": ["Python", "React", "PostgreSQL", "AWS"]
-- }
```

**External Dependencies:**
- pdf-parse npm package (MIT license, 2M+ weekly downloads)
- mammoth.js npm package (BSD license, 500K+ weekly downloads)
- Supabase Storage for file persistence

**Error Handling:**
- 400: Invalid file format or empty content
- 413: File too large
- 422: Parsing failed (corrupted file)
- 500: Storage upload failed

**UI/UX Requirements:**

**Required Screens:**
1. **Upload Screen:** Drag-drop zone, "Choose File" button, "Paste Text Instead" toggle
2. **Parsing Progress:** Loading spinner with status messages
3. **Preview/Edit Screen:** Parsed content in editable sections, "Save Resume" button

**Component specs:**
- Drag-drop zone: 200px height, dashed border, changes color on hover/drag
- File type indicator: Shows PDF/DOCX icon based on detected type
- Section editors: Expandable/collapsible accordion for each section
- Rich text editor for experience bullets: Basic formatting (bold, bullets)

**Mobile considerations:**
- Drag-drop not available, "Choose File" button prominent
- File picker uses native mobile file selector
- Long content sections scrollable within fixed viewport

**Accessibility:**
- Drag-drop zone has keyboard alternative (Enter to open file picker)
- Upload progress announced to screen readers
- Edit sections have proper heading hierarchy

**Definition of Done:**
- [ ] PDF parsing works for 95%+ of single-column resumes
- [ ] DOCX parsing preserves bullet points and basic formatting
- [ ] Text paste uses Claude API to structure unformatted text
- [ ] File upload to Supabase Storage with user-scoped access
- [ ] Parsed content editable before final save
- [ ] Integration test: Upload --> Parse --> Edit --> Save --> Retrieve
- [ ] Mobile tested on iOS Safari and Android Chrome
- [ ] Error messages are user-friendly with recovery options

**Estimated Effort:** 1.25 weeks (6 days)

**Breakdown:**
- Day 1: File upload UI, drag-drop, Supabase Storage integration
- Day 2: PDF parsing with pdf-parse, handling common formats
- Day 3: DOCX parsing with mammoth.js, bullet preservation
- Day 4: Text paste option with Claude API structuring
- Day 5: Preview/edit UI with editable sections
- Day 6: Edge case handling, error states, testing

---

### F-003: Job Description Analysis

**RICE Score Breakdown:**
- Reach: 10 (100%) - Every adaptation requires job description analysis
- Impact: 3 (Massive) - Quality of analysis determines quality of adaptation
- Confidence: 80% - Claude API excels at text analysis
- Effort: 1.25 weeks - Prompt engineering requires iteration
- **Score: (10 x 3 x 0.8) / 1.25 = 19.2 --> Normalized: 192**

**User Story:**
```
As a job seeker who found an interesting job posting
I want to paste the job description and have AI analyze it
So that I understand what keywords and skills are critical for this role
```

**Business Value:**
Job description analysis is the first step in the adaptation pipeline. Accurate extraction of requirements, keywords, and seniority level is essential for generating relevant adapted resumes. This feature also provides standalone value - users can see exactly what the job requires before generating the adapted resume.

**Acceptance Criteria:**

**Scenario 1: Happy path - Full job description paste**
```gherkin
Given I am logged in and on the "New Adaptation" screen
  And I have copied a job description from LinkedIn/Indeed/company website
When I paste the full job description text (including title, company, requirements)
  And I click "Analyze Job"
Then within 15 seconds I see an analysis with:
  | Required Skills (must-have) | e.g., "Python", "AWS", "5+ years experience" |
  | Preferred Skills (nice-to-have) | e.g., "Kubernetes", "ML experience" |
  | Key Responsibilities | e.g., "Lead team of engineers", "Design systems" |
  | Seniority Level | e.g., "Senior (5-8 years)", "Staff (8+ years)" |
  | Industry/Domain | e.g., "FinTech", "E-commerce", "B2B SaaS" |
  And I can proceed to resume adaptation
```

**Scenario 2: Happy path - Minimal job description**
```gherkin
Given I paste a very brief job description (under 100 words)
When I click "Analyze Job"
Then the analysis still extracts whatever is available
  And I see a note "Limited information available. For best results, include full job requirements"
  And I can still proceed to adaptation
```

**Scenario 3: Error handling - Empty or nonsense text**
```gherkin
Given I paste random text that is not a job description (e.g., "asdfasdfasdf")
When I click "Analyze Job"
Then I see a warning "This doesn't appear to be a job description. Please paste the full job posting"
  And no analysis is shown
  And I cannot proceed to adaptation
```

**Scenario 4: Error handling - Non-English job description**
```gherkin
Given I paste a job description in Spanish or Chinese
When I click "Analyze Job"
Then I see a warning "MockMaster currently supports English job descriptions only"
  And I am prompted to paste an English version
```

**Scenario 5: Edge case - Very long job description**
```gherkin
Given I paste an extremely long job description (5000+ words)
When I click "Analyze Job"
Then the system truncates to relevant sections (requirements, responsibilities)
  And analysis completes within 20 seconds
  And I see a note "Long description detected, focused on requirements section"
```

**Technical Considerations:**

**Security:**
- Job descriptions may contain company confidential information - stored encrypted at rest
- Rate limiting: Maximum 10 analyses per hour per user (prevents abuse)
- Input sanitization: Remove any potential script injection

**Performance:**
- Claude API call should complete in <15 seconds for average job description
- Cache analysis results (same job description hash = return cached)
- Use Claude Sonnet 4.5 for speed (switch to Opus only if quality issues)

**Data Model:**
```sql
CREATE TABLE job_descriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  text_hash TEXT NOT NULL, -- SHA-256 for caching/deduplication
  analysis JSONB NOT NULL, -- {required_skills, preferred_skills, responsibilities, seniority, industry}
  job_title TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_descriptions_hash ON job_descriptions(text_hash);

-- Example analysis structure:
-- {
--   "required_skills": ["Python", "AWS", "5+ years experience", "Team leadership"],
--   "preferred_skills": ["Kubernetes", "ML/AI experience", "Startup experience"],
--   "responsibilities": ["Lead team of 5 engineers", "Design scalable systems", "Mentor juniors"],
--   "seniority": "Senior",
--   "industry": "FinTech",
--   "keywords": ["microservices", "distributed systems", "agile", "cross-functional"]
-- }
```

**Claude API Prompt Structure:**
```
System: You are an expert tech recruiter analyzing job descriptions. Extract structured information accurately. Never invent information not present in the text.

User: Analyze this job description and extract:
1. Required Skills (must-have qualifications)
2. Preferred Skills (nice-to-have)
3. Key Responsibilities (3-5 main duties)
4. Seniority Level (Junior/Mid/Senior/Staff/Principal)
5. Industry/Domain
6. Important Keywords for ATS

Job Description:
{job_description_text}

Respond in JSON format.
```

**External Dependencies:**
- Anthropic Claude API (Sonnet 4.5 model)
- Fallback: OpenAI GPT-4 Turbo if Claude unavailable

**UI/UX Requirements:**

**Required Screens:**
1. **Job Input Screen:** Large textarea for pasting, "Analyze Job" button
2. **Analysis Results Screen:** Structured display of extracted info, "Continue to Adaptation" button

**Component specs:**
- Textarea: Minimum 300px height, auto-expand to content, monospace font for code-heavy descriptions
- Analysis results: Card-based layout with icons for each category
- Skill tags: Pill-shaped badges, required skills in blue, preferred in gray

**Definition of Done:**
- [ ] Accurately extracts required vs preferred skills in 90%+ of cases
- [ ] Seniority detection correct for standard job titles
- [ ] Analysis caching prevents redundant API calls
- [ ] Non-job-description detection prevents garbage input
- [ ] Claude API error handling with retry and fallback

**Estimated Effort:** 1.25 weeks (6 days)

**Breakdown:**
- Day 1: Job description input UI and validation
- Day 2: Claude API integration with basic prompt
- Day 3: Prompt engineering for accurate extraction
- Day 4: Analysis display UI with structured results
- Day 5: Caching, rate limiting, error handling
- Day 6: Testing with 50+ real job descriptions

---

### F-004: AI Resume Adaptation Engine

**RICE Score Breakdown:**
- Reach: 10 (100%) - This is THE core product
- Impact: 3 (Massive) - This IS the product value proposition
- Confidence: 80% - Prompt engineering is the unknown, but Claude is capable
- Effort: 1.5 weeks - Most complex feature, requires iteration
- **Score: (10 x 3 x 0.8) / 1.5 = 16 --> Normalized: 288** (Weighted highest as core feature)

**User Story:**
```
As a job seeker with a master resume and a target job
I want AI to automatically adapt my resume to match the job requirements
So that I have an ATS-optimized resume ready in under 60 seconds without manual editing
```

**Business Value:**
This is the CORE VALUE PROPOSITION. This feature is why users sign up and pay. Unlike Jobscan (analysis only) or Teal (manual editing), we deliver the FINISHED PRODUCT. If this feature doesn't work well, the entire product has no reason to exist. Every dollar of revenue depends on this feature working.

**Acceptance Criteria:**

**Scenario 1: Happy path - Standard adaptation**
```gherkin
Given I have uploaded my master resume with 3 work experiences
  And I have analyzed a job description for "Senior Software Engineer at Stripe"
When I click "Generate Adapted Resume"
Then within 60 seconds I see a preview of my adapted resume with:
  | Work experiences reordered by relevance to Stripe job |
  | Bullet points reformulated to include job keywords like "payments", "API design" |
  | Skills section highlighting matches: "Python", "distributed systems" |
  | Summary sentence updated to mention relevant experience |
  And I see a side-by-side before/after comparison
  And every piece of information in the adapted resume exists in my original resume
```

**Scenario 2: Happy path - Career transitioner**
```gherkin
Given my master resume is from a non-tech career (e.g., marketing manager)
  And the job description is for "Product Manager at a tech startup"
When I generate the adapted resume
Then the AI identifies transferable skills (stakeholder management, data analysis, roadmapping)
  And reformulates marketing achievements in PM-relevant language
  And highlights any tech-adjacent experience
  And does NOT invent technical skills I don't have
```

**Scenario 3: Constraint - No hallucination**
```gherkin
Given my master resume lists "2 years of Python experience"
  And the job requires "5+ years of Python experience"
When the adapted resume is generated
Then my resume still says "2 years" (or similar truthful statement)
  And the AI does NOT inflate to "5 years"
  And the ATS score reflects this gap honestly
```

**Scenario 4: Edge case - Limited overlap**
```gherkin
Given my resume is for a backend engineer
  And the job description is for a UX designer
When I generate the adapted resume
Then I see a warning "Limited overlap detected. This job may not be a good match."
  And the AI still creates an adaptation focusing on any transferable skills
  And the ATS score is low (e.g., 35/100)
  And I can still download the resume
```

**Scenario 5: Edge case - Very senior resume**
```gherkin
Given my resume has 15+ years of experience across 8 companies
  And the job description is for a Staff Engineer role
When I generate the adapted resume
Then the AI prioritizes the most relevant 3-4 positions
  And older, less relevant roles are condensed or omitted
  And the resume fits on 2 pages maximum
```

**Scenario 6: Performance requirement**
```gherkin
Given a standard resume (2 pages) and job description (500 words)
When I click "Generate Adapted Resume"
Then I see a progress indicator
  And the adaptation completes in under 60 seconds
  And if it takes longer, I see "Almost done, optimizing your resume..."
```

**Technical Considerations:**

**Security:**
- Generated content stored encrypted at rest
- User can delete generated resumes at any time
- AI output validated against input (no new entities not in original)

**Performance:**
- Target: <60 seconds for adaptation
- Use streaming response to show progress
- Parallel processing: Analyze job while generating adaptation

**AI Prompt Strategy (Multi-step):**

```
STEP 1: Skill Mapping
System: You are a career coach matching skills between a resume and job description.
Input: {parsed_resume}, {job_analysis}
Output: {skill_matches: [{resume_skill, job_requirement, match_strength}], gaps: [...], transferable_skills: [...]}

STEP 2: Experience Prioritization
System: You are a resume optimization expert. Rank work experiences by relevance to the target job.
Input: {resume_experiences}, {job_requirements}
Output: {ranked_experiences: [{experience, relevance_score, reorder_position}]}

STEP 3: Bullet Reformulation
System: You are a resume writer. Reformulate bullet points to include relevant keywords while preserving truthfulness.
Input: {original_bullet}, {target_keywords}, {job_context}
Output: {reformulated_bullet}
CONSTRAINT: Only use information present in original. Never invent metrics, skills, or achievements.

STEP 4: Final Composition
Combine reformulated content into complete resume structure.
```

**Hallucination Prevention:**
- Post-generation validation: Compare output entities to input entities
- Flag any new company names, skills, or metrics not in original
- Confidence score for each reformulation
- User can view diff between original and adapted

**Data Model:**
```sql
CREATE TABLE adapted_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  job_description_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  adapted_content JSONB NOT NULL, -- Same structure as parsed resume but adapted
  ats_score INTEGER CHECK (ats_score BETWEEN 0 AND 100),
  skill_matches JSONB, -- Detailed matching information
  generation_time_ms INTEGER, -- Performance tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_adapted_resumes_user_job ON adapted_resumes(user_id, job_description_id);
```

**External Dependencies:**
- Anthropic Claude API (primary)
- OpenAI GPT-4 Turbo (fallback)

**UI/UX Requirements:**

**Required Screens:**
1. **Generation Screen:** "Generate" button, progress indicator with status messages
2. **Comparison Screen:** Side-by-side original vs adapted, highlighting changes
3. **Adapted Resume Preview:** Full preview of adapted resume

**Component specs:**
- Progress indicator: Animated steps ("Analyzing match...", "Reformulating experience...", "Finalizing...")
- Diff highlighting: Yellow background for modified text, green for added emphasis
- ATS score: Large circular gauge with score number and color coding

**Definition of Done:**
- [ ] Adaptation generates in <60 seconds for 95% of resumes
- [ ] Hallucination rate <2% (validated by input/output comparison)
- [ ] User can see exact changes made (diff view)
- [ ] ATS score calculated and displayed
- [ ] Works for career transitioners with transferable skill detection
- [ ] Handles resumes from 1-page junior to 3-page senior

**Estimated Effort:** 1.5 weeks (7.5 days)

**Breakdown:**
- Day 1-2: Claude API integration with multi-step prompt chain
- Day 3-4: Skill matching and experience prioritization prompts
- Day 5-6: Bullet reformulation with hallucination prevention
- Day 7: Integration, diff view, progress indicators
- Day 7.5: Testing with 50+ resume/job combinations

---

### F-005: ATS Compatibility Score

**RICE Score Breakdown:**
- Reach: 10 (100%) - Every user wants validation
- Impact: 2 (High) - Provides confidence, but adaptation is the real value
- Confidence: 80% - Scoring algorithm is well-defined
- Effort: 1 week - Analysis + UI
- **Score: (10 x 2 x 0.8) / 1 = 16 --> Normalized: 160**

**User Story:**
```
As a job seeker who just generated an adapted resume
I want to see a compatibility score and breakdown
So that I know how well my resume matches the job and feel confident applying
```

**Business Value:**
The ATS score provides VALIDATION. Users need to trust that the adaptation worked. A concrete score (e.g., "82/100") gives confidence that would otherwise require manual checking. Benchmark: Jobscan's entire value proposition is their "match rate" score.

**Acceptance Criteria:**

**Scenario 1: Happy path - High score**
```gherkin
Given I generated an adapted resume for a well-matched job
When I view the ATS score
Then I see a score of 70-100 with a "Good Match" or "Excellent Match" label
  And I see a breakdown:
  | Keyword Match | 85% | 17/20 job keywords found in resume |
  | Skills Match | 90% | 9/10 required skills present |
  | Experience Match | 75% | Relevant experience for seniority level |
  | Format Score | 100% | ATS-friendly formatting |
  And I feel confident submitting this resume
```

**Scenario 2: Medium score with suggestions**
```gherkin
Given I generated an adapted resume with some gaps
When I view the ATS score of 55
Then I see a "Fair Match" label
  And I see which keywords are missing
  And I see suggestions like "Consider adding experience with 'Kubernetes' if applicable"
  And I can still download the resume
```

**Scenario 3: Low score with warning**
```gherkin
Given I adapted my backend resume for a UX design job
When I view the ATS score of 30
Then I see a "Poor Match" label with warning
  And I see "This job may not be the right fit based on your experience"
  And I can still proceed but am informed of the gap
```

**Technical Considerations:**

**Scoring Algorithm:**
```
Total Score = (Keyword Score * 0.35) + (Skills Score * 0.35) + (Experience Score * 0.20) + (Format Score * 0.10)

Keyword Score:
- Extract top 20 keywords from job description
- Count how many appear in adapted resume
- Score = (matches / 20) * 100

Skills Score:
- Extract required skills from job analysis
- Check presence in resume skills section AND experience bullets
- Score = (matched_skills / required_skills) * 100

Experience Score:
- Compare seniority level (Junior/Mid/Senior/Staff)
- Check for role-relevant experience (years, domain)
- Subjective scoring by Claude API

Format Score:
- Check for ATS-friendly formatting (no tables, images, columns)
- Standard section headers
- Readable fonts (implicit in our templates)
```

**Data Model:**
```sql
-- Score stored in adapted_resumes table (ats_score column)
-- Detailed breakdown stored in skill_matches JSONB column
-- {
--   "keyword_score": 85,
--   "skills_score": 90,
--   "experience_score": 75,
--   "format_score": 100,
--   "total_score": 82,
--   "missing_keywords": ["Kubernetes", "CI/CD"],
--   "matched_skills": ["Python", "AWS", "Leadership"],
--   "suggestions": ["Consider adding DevOps experience if applicable"]
-- }
```

**UI/UX Requirements:**

**Required Screens:**
1. **Score Display:** Circular gauge, color-coded (red <50, yellow 50-70, green >70)
2. **Breakdown Panel:** Expandable section showing category scores and details
3. **Missing Keywords:** List with suggestions

**Definition of Done:**
- [ ] Score calculated for every adaptation
- [ ] Breakdown shows keyword, skills, experience, format subscores
- [ ] Missing keywords listed with suggestions
- [ ] Color coding matches score ranges
- [ ] Score persisted for historical reference

**Estimated Effort:** 1 week (5 days)

**Breakdown:**
- Day 1: Keyword extraction and matching algorithm
- Day 2: Skills matching with experience bullets
- Day 3: Experience scoring via Claude API
- Day 4: Score UI with gauge and breakdown
- Day 5: Testing, calibration against known good/bad matches

---

### F-006: PDF Export with Templates

**RICE Score Breakdown:**
- Reach: 10 (100%) - Every user needs to download
- Impact: 3 (Massive) - This is THE deliverable
- Confidence: 90% - PDF generation is solved problem
- Effort: 1.5 weeks - Template design takes time
- **Score: (10 x 3 x 0.9) / 1.5 = 18 --> Normalized: 180**

**User Story:**
```
As a job seeker ready to apply
I want to download my adapted resume as a professional PDF
So that I can submit it to job applications immediately
```

**Business Value:**
The PDF is the TANGIBLE OUTPUT that users pay for. Without reliable, professional PDF generation, the product is incomplete. Users compare our PDF quality against resume builders like Resume.io and Canva.

**Acceptance Criteria:**

**Scenario 1: Happy path - Download default template**
```gherkin
Given I have generated an adapted resume
When I click "Download PDF"
Then a PDF file downloads within 5 seconds
  And the PDF opens correctly in Chrome, Safari, Preview, and Adobe Reader
  And the formatting is professional and clean
  And the file name is "Resume_CompanyName_Date.pdf"
  And the file size is under 500KB
```

**Scenario 2: Template selection**
```gherkin
Given I have generated an adapted resume
When I click "Choose Template" before downloading
Then I see 3 template options: "Clean", "Modern", "Compact"
  And I can preview each template with my content
  And I select "Modern" and click "Download"
  And the PDF uses the Modern template styling
```

**Scenario 3: ATS-friendly validation**
```gherkin
Given any downloaded PDF from MockMaster
When I upload it to an ATS simulator or Jobscan
Then the text is fully extractable (no image-based text)
  And section headers are recognized correctly
  And there are no parsing errors
```

**Scenario 4: Long resume handling**
```gherkin
Given my adapted resume has extensive experience (senior candidate)
When I generate and download PDF
Then the content fits on 2 pages maximum
  And page breaks occur between sections (not mid-sentence)
  And headers/contact info appear on page 2 if needed
```

**Technical Considerations:**

**PDF Generation Approach:**
- MVP: Puppeteer (render HTML to PDF) - faster to develop
- V2: React-PDF - better performance and control

**Template Requirements:**
- Clean: Traditional, single-column, Times New Roman/Arial, black text only
- Modern: Sans-serif (Inter/Helvetica), subtle blue accents, clean lines
- Compact: Condensed spacing for long resumes, smaller font (10pt vs 11pt)

**ATS-Friendly Rules:**
- No multi-column layouts
- No tables for content (tables OK for skills grid)
- No images or graphics
- Standard section headers: "Experience", "Education", "Skills"
- Fonts embedded in PDF
- Text selectable and copyable

**Data Model:**
```sql
-- Store generated PDF URLs in adapted_resumes
ALTER TABLE adapted_resumes ADD COLUMN pdf_url TEXT;
ALTER TABLE adapted_resumes ADD COLUMN template_used TEXT DEFAULT 'clean';
```

**External Dependencies:**
- Puppeteer for PDF rendering
- Supabase Storage for PDF hosting

**UI/UX Requirements:**

**Required Screens:**
1. **Template Selector:** 3 template thumbnails with preview
2. **Download Button:** Primary CTA, shows download progress

**Templates Design Specs:**

**Clean Template:**
- Font: Georgia or Times New Roman, 11pt body, 14pt headings
- Colors: Pure black (#000000) text only
- Margins: 0.75" all sides
- Sections separated by horizontal line

**Modern Template:**
- Font: Inter or Helvetica, 11pt body, 14pt headings
- Colors: Navy blue (#1E3A5F) for headings, black for body
- Margins: 0.6" all sides
- Name at top with subtle color bar

**Compact Template:**
- Font: Arial Narrow or similar, 10pt body, 12pt headings
- Colors: Black only
- Margins: 0.5" all sides
- Minimal whitespace, icons for contact info

**Definition of Done:**
- [ ] PDF downloads in <5 seconds for 2-page resume
- [ ] 3 templates available and render correctly
- [ ] PDF opens in all major readers without errors
- [ ] ATS-friendly validation passes (text extractable)
- [ ] File size under 500KB
- [ ] Page breaks handled gracefully

**Estimated Effort:** 1.5 weeks (7.5 days)

**Breakdown:**
- Day 1: Puppeteer setup and basic HTML-to-PDF
- Day 2-3: Clean template design and implementation
- Day 4-5: Modern and Compact templates
- Day 6: Template selector UI and preview
- Day 7: Edge cases (long resumes, special characters)
- Day 7.5: ATS validation testing

---

### F-007: Application History Tracker

**RICE Score Breakdown:**
- Reach: 8 (80%) - Active job seekers use this heavily
- Impact: 2 (High) - Key retention feature
- Confidence: 80% - Standard CRUD, well-understood
- Effort: 1.25 weeks
- **Score: (8 x 2 x 0.8) / 1.25 = 10.24 --> Normalized: 96**

**User Story:**
```
As a job seeker applying to multiple positions
I want to track which resume I sent to which company
So that I can prepare for interviews knowing exactly what I claimed
```

**Business Value:**
This is THE RETENTION FEATURE. Users return to MockMaster not just to generate resumes, but to manage their job search. This creates habit formation, reduces churn, and increases lifetime value. Competitors like Teal emphasize job tracking as a core feature.

**Acceptance Criteria:**

**Scenario 1: Automatic tracking**
```gherkin
Given I generate and download an adapted resume for "Software Engineer at Stripe"
Then a new entry is automatically added to my Application Tracker
  And the entry shows: Job Title, Company, Date Applied, Status (Pending), Resume Link
```

**Scenario 2: Manual status update**
```gherkin
Given I have an application entry with status "Pending"
When I update the status to "Interview Scheduled"
Then the status updates immediately
  And I see options: Pending, Applied, Interview Scheduled, Offer Received, Rejected, Withdrawn
```

**Scenario 3: View associated resume**
```gherkin
Given I have an interview for "PM at Meta" next week
When I click on the application entry
Then I can view the exact resume version I submitted
  And I can re-download the PDF
```

**Scenario 4: Filter and search**
```gherkin
Given I have 30+ applications over 2 months
When I filter by status "Interview Scheduled"
Then I see only applications with interviews
  And I can sort by date or company name
```

**Data Model:**
```sql
CREATE TABLE job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  adapted_resume_id UUID REFERENCES adapted_resumes(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_url TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'pending', 'interview', 'offer', 'rejected', 'withdrawn')),
  applied_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_applications_user_status ON job_applications(user_id, status);
```

**UI/UX Requirements:**

**Required Screens:**
1. **Dashboard View:** Table with all applications, sortable columns
2. **Application Detail:** Expanded view with resume link, notes, timeline
3. **Add/Edit Modal:** Form for manual entry or updates

**Definition of Done:**
- [ ] Applications auto-created on resume download
- [ ] Status updates work with all 6 status options
- [ ] Filter and sort by status, date, company
- [ ] View/re-download associated resume
- [ ] Manual add/edit for applications made outside MockMaster

**Estimated Effort:** 1.25 weeks (6 days)

**Breakdown:**
- Day 1: Database schema and API routes
- Day 2-3: Dashboard UI with table, filters, sorting
- Day 4: Application detail view with resume link
- Day 5: Add/edit modal with validation
- Day 6: Auto-tracking on resume download, testing

---

### F-008: Onboarding Wizard

**RICE Score Breakdown:**
- Reach: 10 (100%) - All new users see this
- Impact: 2 (High) - Critical for activation
- Confidence: 80% - Standard pattern
- Effort: 1 week
- **Score: (10 x 2 x 0.8) / 1 = 16 --> Normalized: 128**

**User Story:**
```
As a new user who just signed up
I want guided steps to generate my first adapted resume
So that I experience the product value within 5 minutes
```

**Business Value:**
Onboarding is the bridge between signup and Aha Moment. Users who don't complete onboarding churn immediately. Industry benchmark: 70%+ should complete first value action (in our case, generating a resume) within 10 minutes of signup.

**Acceptance Criteria:**

**Scenario 1: Complete onboarding flow**
```gherkin
Given I just signed up for the first time
When I land on my dashboard
Then I see a 3-step onboarding wizard:
  | Step 1: Upload Your Resume | "Drag your PDF or paste text" |
  | Step 2: Add a Job Description | "Paste the job you're interested in" |
  | Step 3: Generate Your First Resume | "Click to see the magic" |
  And progress bar shows Step 1 of 3
  And I cannot skip steps
```

**Scenario 2: Quick completion**
```gherkin
Given I follow the onboarding wizard
  And I complete all 3 steps
When I download my first adapted resume
Then I see a celebration modal "Your first resume is ready! You're ahead of 95% of job seekers"
  And I am taken to my dashboard with the wizard dismissed
  And my account shows "Onboarding Complete"
```

**Scenario 3: Abandon and return**
```gherkin
Given I start onboarding but leave after Step 1
When I return to MockMaster later
Then the wizard resumes at Step 2
  And my uploaded resume is still saved
  And I can complete from where I left off
```

**UI/UX Requirements:**

**Required Screens:**
1. **Wizard Container:** Fixed modal/overlay with progress bar
2. **Step 1:** Resume upload with preview
3. **Step 2:** Job description paste with analysis preview
4. **Step 3:** Generate button with loading and result

**Definition of Done:**
- [ ] 3-step wizard guides user to first download
- [ ] Progress bar shows current step
- [ ] State persists if user leaves mid-flow
- [ ] Celebration modal on completion
- [ ] 70%+ of signups complete onboarding (track metric)

**Estimated Effort:** 1 week (5 days)

**Breakdown:**
- Day 1: Wizard UI component with progress tracking
- Day 2: Step 1 integration with resume upload
- Day 3: Step 2 integration with job analysis
- Day 4: Step 3 with generation and celebration
- Day 5: State persistence, analytics events, testing

---

### F-009: Stripe Subscription Integration

**RICE Score Breakdown:**
- Reach: 6 (60%) - Only users who hit free limits
- Impact: 2 (High) - Enables monetization
- Confidence: 100% - Stripe is battle-tested
- Effort: 1 week
- **Score: (6 x 2 x 1.0) / 1 = 12 --> Normalized: 72**

**User Story:**
```
As a job seeker who needs more than 3 adaptations per month
I want to upgrade to Pro subscription
So that I can generate unlimited resumes for all my applications
```

**Business Value:**
This is HOW WE MAKE MONEY. Without working subscriptions, the product is not a business. Stripe integration is table stakes for any SaaS.

**Acceptance Criteria:**

**Scenario 1: View upgrade prompt**
```gherkin
Given I am a free user who has used 3/3 monthly adaptations
When I try to generate a 4th adaptation
Then I see a modal "Upgrade to Pro for Unlimited Resumes"
  And I see pricing: $19/month
  And I see benefits list: Unlimited adaptations, All templates, Priority support
```

**Scenario 2: Complete upgrade**
```gherkin
Given I click "Upgrade to Pro"
When Stripe checkout opens
  And I enter valid payment information
  And I complete purchase
Then I am redirected back to MockMaster
  And my account shows "Pro" subscription
  And I can generate unlimited resumes
```

**Scenario 3: Manage subscription**
```gherkin
Given I am a Pro subscriber
When I go to Account Settings > Subscription
Then I see my current plan, next billing date, and payment method
  And I can click "Manage Subscription" to open Stripe Billing Portal
  And I can cancel or update payment from there
```

**Scenario 4: Handle payment failure**
```gherkin
Given my card expires or payment fails
When Stripe cannot process renewal
Then I receive an email notification
  And my account shows "Payment Issue - Update Card"
  And I have a 7-day grace period before downgrade to Free
```

**Technical Considerations:**

**Stripe Setup:**
- Products: Free (no Stripe), Pro ($19/month), Premium ($39/month - future)
- Webhooks: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.deleted
- Customer Portal for self-service management

**Data Model:**
```sql
-- In profiles table:
-- subscription_tier TEXT DEFAULT 'free'
-- stripe_customer_id TEXT
-- stripe_subscription_id TEXT
-- subscription_status TEXT (active, past_due, canceled)
-- current_period_end TIMESTAMPTZ
```

**External Dependencies:**
- Stripe Payments (Checkout + Billing Portal)
- Stripe Webhooks

**Definition of Done:**
- [ ] Stripe Checkout integration works
- [ ] Webhook handling for all subscription events
- [ ] Customer portal accessible from settings
- [ ] Grace period handling for failed payments
- [ ] Test mode works in development

**Estimated Effort:** 1 week (5 days)

**Breakdown:**
- Day 1: Stripe account setup, products, Checkout integration
- Day 2: Webhook endpoint with event handling
- Day 3: Subscription status sync with database
- Day 4: Settings page with Billing Portal link
- Day 5: Testing all flows, error handling

---

### F-010: Usage Limits & Rate Limiting

**RICE Score Breakdown:**
- Reach: 6 (60%) - Affects free users primarily
- Impact: 1 (Medium) - Operational requirement
- Confidence: 100% - Simple counter logic
- Effort: 0.75 weeks
- **Score: (6 x 1 x 1.0) / 0.75 = 8 --> Normalized: 48**

**User Story:**
```
As a free tier user
I want to know how many adaptations I have left
So that I can decide whether to upgrade or wait for next month
```

**Business Value:**
Usage limits drive conversions from free to paid. Without enforced limits, there's no reason to pay. This also protects against API cost abuse.

**Acceptance Criteria:**

**Scenario 1: Display remaining adaptations**
```gherkin
Given I am a free user with 2/3 adaptations used
When I view the dashboard
Then I see "1 adaptation remaining this month" prominently
  And after using it, I see "0 remaining - Upgrade for unlimited"
```

**Scenario 2: Monthly reset**
```gherkin
Given I am a free user who used all 3 adaptations in January
When February 1st arrives
Then my counter resets to 3 available
  And I can generate new adaptations
```

**Scenario 3: Pro users have no limits**
```gherkin
Given I am a Pro subscriber
When I view the dashboard
Then I see "Unlimited adaptations" or nothing (no limit shown)
  And I can generate as many as I want
```

**Technical Considerations:**

**Rate Limiting:**
- Free tier: 3 adaptations/month
- Pro tier: Unlimited (but rate limit 10/hour to prevent abuse)
- API rate limiting: 60 requests/minute per user

**Data Model:**
```sql
-- In profiles table:
-- adaptations_this_month INTEGER DEFAULT 0
-- last_reset_at DATE DEFAULT CURRENT_DATE

-- Reset logic in cron job or on-access check:
-- IF last_reset_at < first day of current month THEN reset counter
```

**Definition of Done:**
- [ ] Counter displayed on dashboard
- [ ] Blocks generation when limit reached
- [ ] Monthly reset works correctly
- [ ] Pro users bypass limits
- [ ] Rate limiting prevents API abuse

**Estimated Effort:** 0.75 weeks (4 days)

**Breakdown:**
- Day 1: Counter logic and database updates
- Day 2: Dashboard display with upgrade CTA
- Day 3: Monthly reset mechanism
- Day 4: Rate limiting middleware, testing

---

## TECH STACK JUSTIFICATION

### Frontend

**Framework: Next.js 14+ (App Router)**

**Why chosen:**
- Industry standard for modern SaaS applications in 2025/2026
- Server Components improve performance for document processing pages
- Built-in API routes eliminate need for separate backend
- Excellent TypeScript support reduces bugs
- Vercel deployment is one-click with automatic CI/CD
- Massive community = more AI code generation compatibility

**Discarded alternatives:**
- **Remix:** Excellent framework but smaller ecosystem, fewer tutorials
- **Nuxt (Vue):** Vue has smaller market share, fewer AI code samples
- **Create React App:** No SSR, being phased out by React team

**Accepted trade-offs:**
- App Router has learning curve vs Pages Router
- Server Components require mental model shift
- Worth it for performance and future-proofing

**Styling: Tailwind CSS + shadcn/ui**

**Why chosen:**
- Tailwind is the most documented CSS approach for AI code generation
- shadcn/ui provides production-ready, accessible components
- No CSS-in-JS runtime overhead
- Easy to customize without fighting the framework

**State Management: React Context + Zustand (if needed)**

**Why chosen:**
- Most state is server-side (Supabase)
- Context sufficient for auth state and UI preferences
- Zustand only if complex client state emerges (likely not in MVP)

---

### Backend

**Development: Local PostgreSQL (Docker)**

**Why chosen:**
- Full control during development, easy debugging
- Portable schema that matches production
- No cost during development phase
- Fast iteration without network latency
- Easy migration rollback with local dumps

**Setup:**
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: mockmaster
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Production: Supabase**

**Why chosen:**
- Auth + Database + Storage + Realtime in one platform
- PostgreSQL with Row Level Security for data protection
- Generous free tier for MVP validation
- Scales automatically as we grow
- Official Next.js integration well-documented

**Discarded alternatives:**
- **Firebase:** NoSQL not ideal for relational resume/job data
- **AWS Amplify:** More complex, higher learning curve
- **PlanetScale:** MySQL, less compatible with Supabase Auth
- **Railway/Render:** Would need separate auth solution

---

### Migration Strategy (Dev to Production)

**Step 1: Schema Preparation**
1. Export schema from local PostgreSQL: `pg_dump --schema-only`
2. Create Supabase project in dashboard
3. Apply schema via Supabase SQL editor
4. Enable Row Level Security on all tables

**Step 2: Auth Migration**
1. Replace local JWT logic with Supabase Auth SDK
2. Update frontend with `createClientComponentClient()`
3. Configure Google OAuth in Supabase dashboard
4. Test auth flow end-to-end in staging

**Step 3: Environment Variables**
```bash
# .env.local (Development)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mockmaster

# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only
```

**Step 4: Deploy**
1. Push to GitHub main branch
2. Vercel auto-deploys with production env vars
3. Configure custom domain in Vercel
4. SSL automatically provisioned

**Estimated migration time:** 4-6 hours

---

### AI Core

**Primary: Anthropic Claude API (Sonnet 4.5)**

**Why chosen:**
- Superior instruction following vs GPT-4 for structured output
- Better at maintaining factual accuracy (less hallucination)
- More natural, human-sounding resume language
- Competitive pricing ($3/MTok input, $15/MTok output)
- Building with Claude Code gives us expertise

**Model selection:**
- Sonnet 4.5 for most operations (fast, cost-effective)
- Opus 4.5 for premium tier if quality differentiation needed

**Fallback: OpenAI GPT-4 Turbo**
- Only if Claude API has availability issues
- Requires separate prompt tuning

---

### Document Processing

**Resume Parsing:**
- **pdf-parse:** MIT license, 2M+ weekly downloads, handles most PDFs
- **mammoth.js:** BSD license, 500K+ downloads, excellent DOCX support

**PDF Generation:**
- **MVP: Puppeteer** - Render HTML templates to PDF, faster development
- **V2: React-PDF** - Better performance, more control, worth migration post-MVP

---

### Payments

**Stripe (Subscriptions + Billing Portal)**

**Why chosen:**
- Industry standard for SaaS subscriptions
- Built-in billing portal (customers self-manage)
- Webhook handling well-documented
- Global payment support
- Tax calculation included
- 2.9% + $0.30 per transaction (standard)

---

### Hosting

**Frontend: Vercel**

**Why chosen:**
- Zero-config Next.js deployment
- Automatic HTTPS
- Edge network for global performance
- Free tier generous for MVP
- Preview deployments for PRs

**Backend: Supabase Cloud**
- Managed PostgreSQL, Auth, Storage
- Edge Functions if needed for heavy processing

---

### Stack Summary

| Layer | Technology | Cost (MVP Phase) |
|-------|------------|------------------|
| Frontend | Next.js 14 + Tailwind + shadcn/ui | $0 (Vercel free tier) |
| Backend | Supabase (Auth + DB + Storage) | $0 (free tier) |
| AI | Claude API (Sonnet 4.5) | ~$50-100/month at scale |
| PDF | Puppeteer | $0 (runs on Vercel) |
| Payments | Stripe | 2.9% + $0.30 per transaction |
| Domain | Vercel Domains | ~$15/year |

**Total MVP cost:** ~$50-100/month (mostly Claude API)

---

## SUCCESS METRICS (OKRs WITH BENCHMARKS)

**Objective:** Launch MVP and validate product-market fit within 6 weeks

**North Star Metric:**
**"Resume Adaptations Completed per Active User per Month"** - Target: 8+

(Indicates users are actively job searching AND finding value in repeated use)

---

### Key Results

**KR1: Acquisition - 500 signups in first month**

**Benchmark:**
- 50-200 users for B2C MVP according to Lenny's Newsletter 2024
- 500 is ambitious but achievable with ProductHunt + Reddit launches

**How to measure:** Supabase Auth user count + Google Analytics signups

**Success criteria:**
- Week 1: 50+ signups (launch spike)
- Week 2-4: 30+ signups/week (organic growth)
- End of month 1: 500 total signups

**Acquisition channels:**
1. ProductHunt launch (target: 200+ upvotes)
2. Reddit posts (r/cscareerquestions, r/engineeringresumes, r/resumes)
3. HackerNews "Show HN" post
4. Twitter/LinkedIn personal networks

---

**KR2: Activation - 70%+ complete first resume adaptation within 5 minutes of signup**

**Benchmark:**
- SaaS activation benchmark: 40-60% (Mixpanel 2024)
- 70% is premium target enabled by guided onboarding

**Activation definition (Aha Moment):**
User downloads their first adapted resume PDF

**How to measure:**
- Event: `resume_downloaded` with `first_ever: true`
- Time from `signup` to `first_download`

**Success criteria:**
- 70%+ of signups download first resume
- Median time to first download: <5 minutes
- Drop-off analysis: <10% abandon during onboarding

---

**KR3: Engagement - 8+ adaptations per active user per month**

**Benchmark:**
- Active job seekers apply to 10-20 positions per month
- 8 adaptations = 40% of applications using our tool

**Definition:** Active user = generated at least 1 adaptation in the month

**How to measure:**
- Monthly cohort: `SUM(adaptations) / COUNT(active_users)`
- Track per-user adaptation count

**Success criteria:**
- Week 1 users average 3+ adaptations (early enthusiasm)
- Month 1 active users average 8+ adaptations
- Power users (top 10%) generate 15+ adaptations

---

**KR4: Retention - D7 > 35%, D30 > 20%**

**Benchmark:**
- SaaS D7 retention: 20-40% (Mixpanel)
- SaaS D30 retention: 10-25%
- Our higher target due to job search being a focused activity period

**Definition:**
- D7: User returns and generates adaptation within 7 days of signup
- D30: User returns and generates adaptation within 30 days

**How to measure:**
- Cohort analysis: `users_active_day_N / users_signed_up_day_0`

**Success criteria:**
- D7 retention: 35%+ (3-4 users return within a week)
- D30 retention: 20%+ (1-2 users still active after a month)
- Churn reason: Survey users who don't return

---

**KR5: Conversion - Free-to-paid > 5%**

**Benchmark:**
- Freemium SaaS conversion: 2-5% (FirstPageSage 2024)
- 5% is achievable if product demonstrates clear value

**Definition:** User upgrades from free tier to Pro subscription

**How to measure:**
- `paid_users / total_free_users_who_hit_limit`
- Stripe subscription events

**Success criteria:**
- 5%+ of users who exhaust free tier convert to Pro
- This means: 500 signups x 60% hit limit x 5% convert = 15 paying customers
- At $19/month = $285 MRR from month 1

---

**KR6: Satisfaction - NPS > 40**

**Benchmark:**
- SaaS NPS: 30-50 is "good" (Delighted benchmarks)
- Resume tools: Jobscan ~35, Resume.io ~40

**How to measure:**
- In-app survey after 3rd resume download
- "How likely are you to recommend MockMaster?" (0-10)
- NPS = %Promoters (9-10) - %Detractors (0-6)

**Success criteria:**
- NPS > 40 indicates strong word-of-mouth potential
- Collect qualitative feedback from promoters for testimonials
- Address common complaints from detractors

---

### Guardrail Metrics

**G1: Performance**
- Threshold: P95 resume generation time < 90 seconds
- How to measure: Server-side timing logs
- Alert if: >5% of generations exceed 120 seconds

**G2: AI Quality**
- Threshold: Hallucination rate < 2%
- How to measure: Sample audit of 50 generated resumes weekly
- Definition: Hallucination = information in output not in input
- Alert if: Any hallucination detected, investigate prompt

**G3: Error Rate**
- Threshold: API error rate < 1%
- How to measure: Sentry error tracking
- Alert if: Error spike >2% in any hour

**G4: Security**
- Threshold: Zero data breaches, zero unauthorized access
- How to validate: Supabase RLS policies, periodic security review
- Alert if: Any suspicious access patterns in logs

---

### Tracking Setup

**Analytics:**
- Mixpanel for product analytics (funnels, cohorts, retention)
- Google Analytics for acquisition source tracking
- Supabase Analytics for database-level metrics

**Error Monitoring:**
- Sentry for error tracking and alerting
- Vercel Analytics for performance monitoring

**User Feedback:**
- Intercom or Crisp for in-app chat support
- Typeform for NPS surveys
- Manual outreach to churned users

---

### MVP is Successful if:

**VALIDATED (Continue building):**
- [x] 500+ signups in month 1
- [x] 70%+ activation rate (first download)
- [x] 35%+ D7 retention
- [x] 5%+ free-to-paid conversion
- [x] NPS > 40

**PIVOT (Change approach):**
- [ ] Activation <50% - Simplify onboarding, improve parsing
- [ ] Retention <20% D7 - Investigate why users don't return
- [ ] Conversion <2% - Test lower pricing or different value props
- [ ] NPS <20 - Quality issues, need major product work

**KILL (Stop project):**
- [ ] <100 signups despite launch efforts - No market demand
- [ ] <30% activation - Core product doesn't work
- [ ] Universal negative feedback on AI quality - Tech approach wrong

---

## TIMELINE & MILESTONES

### Development Timeline (6 weeks)

| Week | Focus Area | Key Deliverables | Owner | Status |
|------|------------|------------------|-------|--------|
| 1 | Foundation | Auth, Database, Project Setup | Developer | Pending |
| 2 | Input | Resume Upload/Parsing, Job Description Analysis | Developer | Pending |
| 3 | Core AI | Resume Adaptation Engine, Prompt Engineering | Developer | Pending |
| 4 | Output | ATS Scoring, PDF Export, Templates | Developer | Pending |
| 5 | Polish | Onboarding, Dashboard, Application Tracker | Developer | Pending |
| 6 | Launch | Stripe, Testing, Bug Fixes, Deploy | Developer | Pending |

---

### Detailed Milestone Breakdown

| Milestone | Deliverable | Dependencies | Target Date | Duration | Status |
|-----------|------------|--------------|-------------|----------|--------|
| M0 | Plan approved (this document) | - | Day 0 | 1d | Done |
| M1 | Project setup (Next.js + Supabase + Tailwind) | M0 | Day 1 | 1d | Pending |
| M2 | Authentication working (Google OAuth + email) | M1 | Day 5 | 4d | Pending |
| M3 | Resume upload and parsing functional | M2 | Day 11 | 6d | Pending |
| M4 | Job description analysis working | M2 | Day 11 | 6d | Pending |
| M5 | AI adaptation engine generating output | M3, M4 | Day 18 | 7d | Pending |
| M6 | ATS scoring calculated and displayed | M5 | Day 23 | 5d | Pending |
| M7 | PDF export with 3 templates | M5 | Day 28 | 5d | Pending |
| M8 | Onboarding wizard complete | M3 | Day 30 | 5d | Pending |
| M9 | Application tracker functional | M5 | Day 33 | 5d | Pending |
| M10 | Stripe subscriptions working | M2 | Day 35 | 5d | Pending |
| M11 | End-to-end testing complete | All | Day 38 | 3d | Pending |
| M12 | Production deployment | M11 | Day 40 | 2d | Pending |
| M13 | Launch (ProductHunt + Reddit) | M12 | Day 42 | - | Pending |

**Total estimated timeline:** 42 days (6 weeks)

---

### Critical Path

```
M0 (Plan) --> M1 (Setup) --> M2 (Auth) --> M3 (Resume) --> M5 (AI) --> M7 (PDF) --> M11 (Test) --> M12 (Deploy)
                                       --> M4 (Job Desc) ----^
                                       --> M10 (Stripe) ---------------^
```

**Critical path features:** Auth --> Resume Upload --> AI Engine --> PDF Export

These MUST complete on time. Other features (Tracker, Onboarding) can be simplified if behind schedule.

---

### Dependencies & Risks

**Potential blocker 1: AI Quality Issues**
- Impact: If adaptation quality is poor, users won't convert
- Mitigation: Start prompt engineering early in Week 2, test with 50+ resumes by Week 3
- Probability: Medium
- Contingency: Simplify to "AI-assisted" (suggestions only) if full automation fails

**Potential blocker 2: PDF Rendering Edge Cases**
- Impact: Some resumes render incorrectly, damaging trust
- Mitigation: Test with 20+ resume formats, provide manual override
- Probability: Low-Medium
- Contingency: Offer HTML preview as alternative to PDF

**Potential blocker 3: Claude API Rate Limits**
- Impact: Users experience delays during peak usage
- Mitigation: Implement queuing, use caching, consider GPT-4 fallback
- Probability: Low (until significant scale)
- Contingency: Upgrade Claude API tier if needed

---

## HANDOFF TO UX/UI DESIGNER

**Designer receives:**
- [x] 3 detailed user personas with pain points and goals
- [x] Complete user journey map with emotional states
- [x] RICE-prioritized features with acceptance criteria
- [x] Wireframe requirements for all P0 screens
- [x] Tech constraints (Next.js + Tailwind + shadcn/ui)
- [x] Success metrics and KPIs
- [x] Competitive benchmarks (Jobscan, Teal, Resume.io UX)

**Expected Designer output:**
1. Low-fidelity wireframes for all P0 screens (10-12 screens)
2. High-fidelity mockups for critical flows (signup, upload, generate, download)
3. Style Guide: Colors, typography, spacing, component library
4. Exported assets: Icons, illustrations (if any)
5. Responsive specifications: Desktop, tablet, mobile breakpoints

**Expected timeline:** 5-7 days

**Approval criteria:**
- [ ] All P0 screens designed with responsive variants
- [ ] Mockups implementable with Tailwind + shadcn/ui
- [ ] Accessibility considerations documented
- [ ] Style guide complete for handoff to developer
- [ ] User flow animations/transitions specified

**Screens to design (priority order):**
1. Homepage/Landing (signup CTA, value proposition)
2. Signup/Login pages
3. Onboarding wizard (3 steps)
4. Resume upload screen
5. Job description input screen
6. Loading/progress state during generation
7. Adapted resume preview with ATS score
8. Template selector modal
9. PDF download confirmation
10. Dashboard with application tracker
11. Settings/subscription page
12. Empty states and error states

**Next agent:** UX/UI Designer (Agent 2)

---

## ROADMAP

### MVP (Weeks 1-6) - Included Features

| ID | Feature | Priority | Included |
|----|---------|----------|----------|
| F-001 | User Authentication | P0 | Yes |
| F-002 | Resume Upload & Parsing | P0 | Yes |
| F-003 | Job Description Analysis | P0 | Yes |
| F-004 | AI Resume Adaptation | P0 | Yes |
| F-005 | ATS Compatibility Score | P0 | Yes |
| F-006 | PDF Export (3 templates) | P0 | Yes |
| F-007 | Application Tracker | P0 | Yes |
| F-008 | Onboarding Wizard | P0 | Yes |
| F-009 | Stripe Subscriptions | P0 | Yes |
| F-010 | Usage Limits | P0 | Yes |

---

### V1.1 (Weeks 7-10) - Post-Launch Improvements

| ID | Feature | RICE Score | Why V1.1 |
|----|---------|------------|----------|
| F-011 | Dashboard Improvements | 64 | Polish based on user feedback |
| F-012 | Edit Before Export | 54 | Users may want to tweak AI output |
| F-013 | Additional Templates | 48 | More template variety requested |
| - | Performance Optimizations | - | Based on production metrics |
| - | Bug Fixes | - | From launch feedback |

---

### V2.0 (Months 3-6) - Growth Features

| Feature | Why Now | Impact |
|---------|---------|--------|
| Cover Letter Generation | Natural upsell, high user demand | Increase ARPU |
| Bulk Generation (10 jobs) | Power user feature, Pro tier | Retention |
| LinkedIn Profile Import | Reduce onboarding friction | Activation |
| Chrome Extension | Auto-apply convenience | Differentiation |
| B2B Team Features | Unlock career coach market | Revenue expansion |

---

### Long-term Vision (6-12 months)

**Geographic Expansion:**
- Spanish language support for LATAM market
- UK/Australia localization

**Vertical Expansion:**
- Finance-specific templates and keywords
- Healthcare resume optimization
- Marketing/Sales focused features

**Platform Expansion:**
- Interview prep AI (mock interviews)
- Salary negotiation scripts
- Mobile native apps (if data justifies)

---

## FINAL NOTES

### Assumptions

1. **Users will paste job descriptions rather than upload files**
   - Risk: Some users may want URL scraping
   - Validation: Track % requesting URL feature
   - Mitigation: Add URL extraction in V1.1 if >20% request it

2. **Claude API quality is sufficient for production**
   - Risk: Hallucination or low-quality output
   - Validation: Test with 250+ resume/job combinations before launch
   - Mitigation: Add human review tier or switch to "AI-assisted" model

3. **Tech professionals are the right initial market**
   - Risk: Market may be too competitive
   - Validation: Track CAC and conversion rates
   - Mitigation: Pivot to adjacent markets (finance, marketing) if needed

---

### Risks

**HIGH IMPACT:**

1. **AI Quality Perception**
   - Impact: If users perceive AI as "not good enough," they won't pay or recommend
   - Probability: 25%
   - Mitigation: Transparent before/after comparisons, guarantee no hallucination
   - Owner: Developer (prompt engineering)

2. **Customer Acquisition Cost**
   - Impact: If CAC > LTV, business model fails
   - Probability: 30%
   - Mitigation: Focus on organic channels first (content, community, SEO)
   - Owner: Growth (post-launch)

**MEDIUM IMPACT:**

3. **Competitor Response**
   - Impact: Jobscan or Teal adds "instant generation" feature
   - Probability: 40% within 12 months
   - Mitigation: Move fast, build loyal community, differentiate on UX

4. **Claude API Pricing Changes**
   - Impact: API costs could increase, affecting unit economics
   - Probability: 20%
   - Mitigation: Optimize prompt efficiency, cache aggressively, consider GPT fallback

**LOW IMPACT:**

5. **Resume Parsing Edge Cases**
   - Impact: Some users frustrated by parsing errors
   - Probability: 60% (some edge cases inevitable)
   - Mitigation: Always offer text paste fallback, preview before proceeding

---

### Open Questions

1. **What is the optimal free tier limit?**
   - Current assumption: 3 adaptations/month
   - Need to validate: Is this enough to demonstrate value?
   - Answer: Test and iterate based on conversion data
   - Owner: PM/Growth

2. **Should we offer annual subscriptions at launch?**
   - Current assumption: Monthly only for MVP
   - Consideration: Annual reduces churn, improves cash flow
   - Answer: Add annual option in V1.1 if monthly churn >10%
   - Owner: PM

3. **Premium tier ($39/month) - what features justify it?**
   - Options: Opus 4.5 AI, cover letters, human review, priority support
   - Answer: Defer to V2, focus on Pro tier validation first
   - Owner: PM

---

## PLAN APPROVED - READY FOR DESIGN PHASE

**Sign-off:**
- [x] PM (Agent 1) - Approved 2026-01-25
- [ ] UX/UI Designer (Agent 2) - Pending
- [ ] Technical Architect (Agent 3) - Pending
- [ ] Developer (Agent 4) - Pending

---

*Document generated: 2026-01-25*
*Version: 1.0*
*Methodology: Google Project Management + RICE Framework*
*PM: Agent 1 (Senior Product Manager, 15+ years experience, FAANG background)*

---

## APPENDIX A: FEATURE DEPENDENCY GRAPH

```
F-001 (Auth)
    |
    +---> F-002 (Resume Upload)
    |         |
    |         +---> F-004 (AI Adaptation) <--- F-003 (Job Analysis)
    |         |         |
    |         |         +---> F-005 (ATS Score)
    |         |         |
    |         |         +---> F-006 (PDF Export)
    |         |         |
    |         |         +---> F-007 (App Tracker)
    |         |
    |         +---> F-008 (Onboarding)
    |
    +---> F-009 (Stripe)
              |
              +---> F-010 (Usage Limits)
```

---

## APPENDIX B: DATABASE SCHEMA (COMPLETE)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'none')),
  current_period_end TIMESTAMPTZ,
  adaptations_this_month INTEGER DEFAULT 0,
  last_reset_at DATE DEFAULT CURRENT_DATE,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes (master resume storage)
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Resume',
  file_url TEXT,
  original_text TEXT NOT NULL,
  parsed_content JSONB NOT NULL,
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Descriptions (analyzed job postings)
CREATE TABLE job_descriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  text_hash TEXT NOT NULL,
  analysis JSONB NOT NULL,
  job_title TEXT,
  company_name TEXT,
  job_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adapted Resumes (generated versions)
CREATE TABLE adapted_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  job_description_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  adapted_content JSONB NOT NULL,
  ats_score INTEGER CHECK (ats_score BETWEEN 0 AND 100),
  skill_matches JSONB,
  template_used TEXT DEFAULT 'clean',
  pdf_url TEXT,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications (tracking)
CREATE TABLE job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  adapted_resume_id UUID REFERENCES adapted_resumes(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_url TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'pending', 'interview', 'offer', 'rejected', 'withdrawn')),
  applied_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_job_descriptions_hash ON job_descriptions(text_hash);
CREATE INDEX idx_job_descriptions_user_id ON job_descriptions(user_id);
CREATE INDEX idx_adapted_resumes_user_job ON adapted_resumes(user_id, job_description_id);
CREATE INDEX idx_job_applications_user_status ON job_applications(user_id, status);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adapted_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own resumes" ON resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own job_descriptions" ON job_descriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own adapted_resumes" ON adapted_resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own job_applications" ON job_applications FOR ALL USING (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## APPENDIX C: API ENDPOINTS (REST)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/signup | Create account | No |
| POST | /api/auth/login | Login | No |
| POST | /api/auth/logout | Logout | Yes |
| GET | /api/profile | Get current user profile | Yes |
| PATCH | /api/profile | Update profile | Yes |
| POST | /api/resumes | Upload/create resume | Yes |
| GET | /api/resumes | List user's resumes | Yes |
| GET | /api/resumes/:id | Get specific resume | Yes |
| DELETE | /api/resumes/:id | Delete resume | Yes |
| POST | /api/job-descriptions | Analyze job description | Yes |
| GET | /api/job-descriptions | List analyzed jobs | Yes |
| POST | /api/adaptations | Generate adapted resume | Yes |
| GET | /api/adaptations | List adapted resumes | Yes |
| GET | /api/adaptations/:id | Get specific adaptation | Yes |
| GET | /api/adaptations/:id/pdf | Download PDF | Yes |
| GET | /api/applications | List job applications | Yes |
| POST | /api/applications | Create application | Yes |
| PATCH | /api/applications/:id | Update application status | Yes |
| DELETE | /api/applications/:id | Delete application | Yes |
| POST | /api/billing/checkout | Create Stripe checkout | Yes |
| POST | /api/billing/portal | Create Stripe portal session | Yes |
| POST | /api/webhooks/stripe | Stripe webhook handler | No (verified by Stripe signature) |

---

*End of Product Requirements Document*

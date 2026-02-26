# ARCHITECTURE: F-014 — Job Description URL Extraction

## 1. USER FLOW

### Main App (JobDescriptionInput)
1. User navigates to the job analysis page
2. User pastes a job URL into the "URL del aviso" input field
3. User clicks "Extraer texto" (or presses Enter in the URL input)
4. Frontend POSTs `{ url }` to `/api/extract-job-url`
5. Server validates URL (SSRF checks), fetches page, parses HTML with cheerio
6. Server returns `{ text, source, title?, company? }`
7. Frontend populates the textarea with the extracted text
8. Success message "Texto extraido. Revisalo y haz clic en Analizar." appears
9. User reviews the text and clicks "Analizar Oferta" — proceeds through the existing flow

### Onboarding Wizard (StepAddJobDescription)
Same URL extraction flow, but embedded in the wizard. The textarea coexists with the URL field.

### Error scenarios
- Invalid URL (no https, malformed) → 400 with INVALID_URL code → error shown below URL input
- Private/loopback IP → 400 with BLOCKED_URL code → error shown below URL input
- Site returns 401/403 → 422 with LOGIN_WALL code → user told to copy-paste manually
- Fetch times out (10s) → 504 with FETCH_TIMEOUT code → user told to copy-paste manually
- Page too large (>5MB) → 413 with CONTENT_TOO_LARGE code
- Network failure → 502 with FETCH_ERROR code

## 2. DATABASE

No database changes required. URL extraction is a stateless utility — the extracted text flows into the existing job analysis pipeline unchanged.

## 3. API ENDPOINTS

### POST /api/extract-job-url

**Authentication:** None required (public endpoint)

**Request:**
```json
{ "url": "https://www.linkedin.com/jobs/view/1234567890" }
```

**Response 200:**
```json
{
  "text": "Senior Software Engineer en Acme Corp\n\nWe are looking for...",
  "source": "linkedin",
  "title": "Senior Software Engineer",
  "company": "Acme Corp"
}
```

**Error responses:**

| Status | Code              | Message (Spanish)                                                                        |
|--------|-------------------|------------------------------------------------------------------------------------------|
| 400    | INVALID_URL       | "La URL debe comenzar con https://"                                                      |
| 400    | BLOCKED_URL       | "URL no permitida."                                                                      |
| 413    | CONTENT_TOO_LARGE | "La pagina es demasiado grande para procesar."                                           |
| 422    | LOGIN_WALL        | "La pagina requiere inicio de sesion o no contiene una oferta visible..."                |
| 502    | FETCH_ERROR       | "No se pudo acceder al sitio. Verifica la URL o intenta pegar el texto manualmente."    |
| 504    | FETCH_TIMEOUT     | "El sitio no respondio a tiempo. Intenta copiar y pegar el texto directamente."         |
| 500    | INTERNAL_ERROR    | "Error interno. Intenta de nuevo."                                                       |

## 4. REACT COMPONENTS

### JobDescriptionInput (updated)
- **New state:** `urlInput`, `isExtracting`, `extractionError`, `extractionSuccess`
- **New UI:** URL input + "Extraer texto" button above the existing textarea
- **Unchanged:** `onAnalyze` callback interface — text still goes through existing flow
- **Both fields always visible** — URL field and textarea coexist

### StepAddJobDescription (updated)
- Same URL extraction state and logic as JobDescriptionInput
- Styled with `rounded-xl` and `border-slate-200` to match the existing onboarding design
- Extraction success shown in green (`bg-green-50`) to match existing error pattern

## 5. NEW FILES

### `lib/url-extractor.ts`
Pure utility module. No side effects.

**Exports:**
- `validateUrl(url): UrlValidationResult` — SSRF protection + HTTPS check
- `detectSource(url): 'linkedin' | 'indeed' | 'generic'` — hostname-based detection
- `extractJobText(url): Promise<JobExtractionResult>` — main extraction function

**Cheerio selectors by source:**

| Site     | Description selector                          | Title selector                         | Company selector                |
|----------|-----------------------------------------------|----------------------------------------|---------------------------------|
| LinkedIn | `.description__text`, `.show-more-less-html__markup` | `h1.top-card-layout__title`  | `.topcard__org-name-link`       |
| Indeed   | `#jobDescriptionText`                         | `.jobsearch-JobInfoHeader-title`       | `div[data-company-name]`        |
| Generic  | `[class*="job-description"]`, `article`, `main`, body fallback | `h1` | None         |

### `app/api/extract-job-url/route.ts`
- Single POST handler
- Delegates all logic to `lib/url-extractor.ts`
- Maps typed errors to HTTP status codes and Spanish messages
- No authentication required

### `lib/types.ts` (updated)
Added at the bottom:
```typescript
export type UrlExtractionErrorCode =
  | 'INVALID_URL' | 'BLOCKED_URL' | 'FETCH_TIMEOUT' | 'FETCH_ERROR'
  | 'LOGIN_WALL' | 'CONTENT_TOO_LARGE' | 'INTERNAL_ERROR';

export interface UrlExtractionAPIError {
  error: string;
  code: UrlExtractionErrorCode;
}
```

## 6. TESTS

**File:** `__tests__/url-extractor.test.ts` (41 tests, 100% pass)

| Test Group         | Count | Coverage                                                          |
|--------------------|-------|-------------------------------------------------------------------|
| validateUrl        | 22    | Valid URLs, HTTP rejection, empty/malformed, all private IP ranges|
| detectSource       | 7     | LinkedIn, Indeed, generic, malformed                              |
| extractJobText     | 12    | All error codes, successful extraction, login-wall heuristics     |

## 7. MANUAL TEST CHECKLIST

### Desktop (Chrome, Firefox, Safari)

- [ ] Paste a LinkedIn job URL → text extracted and populates textarea
- [ ] Paste an Indeed job URL → text extracted and populates textarea
- [ ] Paste a generic job URL → text extracted
- [ ] Try http:// URL → error "La URL debe comenzar con https://"
- [ ] Try a URL with no job content → LOGIN_WALL error shown
- [ ] Leave URL field empty → "Extraer texto" button is disabled
- [ ] After extraction, modify text in textarea → works normally
- [ ] Click "Analizar Oferta" after extraction → full analysis flow works
- [ ] Onboarding wizard: URL extraction works identically

### Mobile (iOS Safari, Android Chrome)

- [ ] URL input is focusable and keyboard appears
- [ ] "Extraer texto" button is tappable and not obscured by keyboard
- [ ] Success/error messages are visible
- [ ] Textarea scrolls correctly after extraction populates it

### Edge cases

- [ ] URL with login wall (e.g., LinkedIn when not logged in) → appropriate error
- [ ] Very long URL → no crash
- [ ] URL with unicode characters → handles correctly
- [ ] Click "Extraer texto" multiple times rapidly → only one request fires (button disabled during extraction)

## 8. DEPLOYMENT CHECKLIST

- [ ] `npm install cheerio` confirmed in package.json
- [ ] `/api/extract-job-url` appears in `npm run build` output
- [ ] All 41 unit tests pass
- [ ] TypeScript type-check passes (no new errors beyond pre-existing .next/types issues)
- [ ] Manual smoke test: LinkedIn URL extraction works in production
- [ ] Manual smoke test: error messages display correctly in Spanish

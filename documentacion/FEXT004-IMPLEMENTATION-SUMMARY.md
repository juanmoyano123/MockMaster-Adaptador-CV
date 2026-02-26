# F-EXT-004 - User Resume Persistence: Implementation Summary

## What was built

Three files were created / modified to persist the user's master CV in Supabase.
localStorage remains the primary store for the web app; Supabase is an additive
sync layer that lets the Chrome Extension read the CV via a standard HTTP API.

---

## Files

### 1. `supabase/migrations/002_user_resumes.sql` (NEW)

Creates the `user_resumes` table with:

- `id` UUID primary key
- `user_id` UUID (FK to `auth.users`, CASCADE DELETE, UNIQUE constraint — one CV per user)
- `name` TEXT (filename / label, defaults to 'Mi CV')
- `original_text` TEXT (raw extracted text, required)
- `parsed_content` JSONB (structured ParsedContent object, required)
- `uploaded_at` TIMESTAMPTZ (last upload/update moment)
- `created_at` / `updated_at` TIMESTAMPTZ (auto-managed)

RLS is enabled. Four policies are defined (SELECT / INSERT / UPDATE / DELETE),
each gated on `auth.uid() = user_id`. A trigger keeps `updated_at` current.

All policy statements use `DROP POLICY IF EXISTS` before `CREATE POLICY` so the
migration is safe to re-run.

### 2. `app/api/user/resume/route.ts` (NEW)

Dual-auth Next.js Route Handler:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/resume` | Return the user's saved CV |
| POST | `/api/user/resume` | Upsert (save or update) the user's CV |

**Auth logic:**
- If an `Authorization: Bearer <token>` header is present the JWT is validated
  via `supabase.auth.getUser(token)` and all DB queries run with that token in
  the `Authorization` header so RLS resolves correctly.
- Otherwise the standard cookie-based `createClient()` is used (web app path).

**Validation (POST):**
- `original_text` must be a non-empty string.
- `parsed_content` must contain a `contact.name` and at least one non-empty
  array among `experience`, `education`, or `skills`.

**Upsert strategy:**
- `supabase.upsert({ ... }, { onConflict: 'user_id' })` — targets the
  `UNIQUE(user_id)` constraint so a second save replaces the first.

**Error codes used:**
- `UNAUTHORIZED` (401)
- `NOT_FOUND` (404)
- `VALIDATION_FAILED` (400)
- `INTERNAL_ERROR` (500)

### 3. `components/ResumeUploadFlow.tsx` (MODIFIED)

`handleSave` now has two stages:

1. **Primary** — `resumeStorage.saveResume(data)` writes to localStorage exactly
   as before. Any error here aborts the function and shows the user an alert.
2. **Additive** — `fetch('/api/user/resume', { method: 'POST', ... })` syncs to
   Supabase. This call is fire-and-forget: `.catch(err => console.warn(...))` so
   any network or auth failure is logged silently and does not affect the UI.

---

## How to apply the migration

Run the SQL file in the Supabase SQL Editor (Dashboard > SQL Editor > New Query):

```
supabase/migrations/002_user_resumes.sql
```

Or via the Supabase CLI if configured:

```bash
supabase db push
```

---

## Manual smoke-test checklist

1. Log in to the web app.
2. Upload a CV and click Save.
3. Open the browser DevTools Network tab and confirm a POST to `/api/user/resume`
   returns HTTP 200 with `{ resume: { id, name, parsed_content, uploaded_at } }`.
4. In a new tab, call GET `/api/user/resume` (logged-in session) and confirm the
   same resume data is returned.
5. Log out and call GET `/api/user/resume` — confirm HTTP 401.
6. POST with an empty `original_text` — confirm HTTP 400 `VALIDATION_FAILED`.
7. POST again (second save) — confirm the same `id` is returned (upsert, not insert).
8. Check the `user_resumes` table in Supabase Dashboard — only one row per user.

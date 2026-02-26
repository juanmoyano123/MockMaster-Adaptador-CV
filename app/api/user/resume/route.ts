/**
 * API Route: GET|POST /api/user/resume
 * Feature: F-EXT-004 - User Resume Persistence
 *
 * Persists the user's master CV in Supabase so the Chrome Extension
 * can retrieve it via API (localStorage is not accessible cross-origin).
 *
 * Auth strategy (dual):
 *   - Web app: cookie-based session (standard Next.js / Supabase SSR)
 *   - Chrome Extension: Bearer token in Authorization header
 *
 * GET /api/user/resume
 *   Returns the saved resume for the authenticated user.
 *   200: { resume: { id, name, original_text, parsed_content, uploaded_at } }
 *   401: { error: 'No autenticado', code: 'UNAUTHORIZED' }
 *   404: { error: 'No tienes un CV guardado', code: 'NOT_FOUND' }
 *
 * POST /api/user/resume
 *   Saves (upsert) the user's resume. Replaces any existing record.
 *   Body: { name?: string, original_text: string, parsed_content: ParsedContent }
 *   200: { resume: { id, name, parsed_content, uploaded_at } }
 *   400: { error: 'Datos de CV invalidos', code: 'VALIDATION_FAILED' }
 *   401: { error: 'No autenticado', code: 'UNAUTHORIZED' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { ParsedContent } from '@/lib/types';

// ---------------------------------------------------------------------------
// Helper: resolve the authenticated user from either a Bearer token (extension)
// or the standard cookie-based session (web app).
// ---------------------------------------------------------------------------
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? '';
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;

  if (bearerToken) {
    // Extension path: create a lightweight client without cookie store just
    // to call getUser() with the explicit JWT.
    const supabaseForToken = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // No cookie store needed — we pass the token directly.
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    );

    const { data: { user }, error } = await supabaseForToken.auth.getUser(bearerToken);
    return { user: error ? null : user, token: bearerToken };
  }

  // Web app path: use the standard cookie-based server client.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { user, token: null };
}

// ---------------------------------------------------------------------------
// Helper: build a Supabase client authenticated with a specific JWT token.
// Used for the extension path so database RLS resolves auth.uid() correctly.
// ---------------------------------------------------------------------------
function createClientWithToken(token: string) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

// ---------------------------------------------------------------------------
// Validation: parsed_content must have contact info and at least one of
// experience, education, or skills with content.
// ---------------------------------------------------------------------------
function isValidParsedContent(parsed: unknown): parsed is ParsedContent {
  if (!parsed || typeof parsed !== 'object') return false;

  const p = parsed as Record<string, unknown>;

  // Must have a contact object with at least a name
  if (!p.contact || typeof p.contact !== 'object') return false;
  const contact = p.contact as Record<string, unknown>;
  if (!contact.name || typeof contact.name !== 'string' || contact.name.trim() === '') {
    return false;
  }

  // Must have at least one meaningful section
  const hasExperience = Array.isArray(p.experience) && p.experience.length > 0;
  const hasEducation = Array.isArray(p.education) && p.education.length > 0;
  const hasSkills = Array.isArray(p.skills) && p.skills.length > 0;

  return hasExperience || hasEducation || hasSkills;
}

// ---------------------------------------------------------------------------
// GET /api/user/resume
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { user, token } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Build the appropriate client for database queries
    const supabase = token ? createClientWithToken(token) : await createClient();

    const { data: resume, error } = await supabase
      .from('user_resumes')
      .select('id, name, original_text, parsed_content, uploaded_at')
      .eq('user_id', user.id)
      .single();

    if (error || !resume) {
      return NextResponse.json(
        { error: 'No tienes un CV guardado', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({ resume }, { status: 200 });
  } catch (error) {
    console.error('GET /api/user/resume error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/user/resume
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const { user, token } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Datos de CV invalidos', code: 'VALIDATION_FAILED' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Datos de CV invalidos', code: 'VALIDATION_FAILED' },
        { status: 400 }
      );
    }

    const { name, original_text, parsed_content } = body as {
      name?: unknown;
      original_text?: unknown;
      parsed_content?: unknown;
    };

    // Validate original_text
    if (!original_text || typeof original_text !== 'string' || original_text.trim() === '') {
      return NextResponse.json(
        { error: 'Datos de CV invalidos: original_text es requerido', code: 'VALIDATION_FAILED' },
        { status: 400 }
      );
    }

    // Validate parsed_content structure
    if (!isValidParsedContent(parsed_content)) {
      return NextResponse.json(
        {
          error: 'Datos de CV invalidos: parsed_content debe tener informacion de contacto y al menos una seccion (experiencia, educacion o habilidades)',
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      );
    }

    // Sanitise the name field — default to 'Mi CV' if not provided
    const resumeName =
      typeof name === 'string' && name.trim().length > 0 ? name.trim() : 'Mi CV';

    // Build the appropriate client for database queries
    const supabase = token ? createClientWithToken(token) : await createClient();

    // Upsert: insert if no row exists for this user_id, update otherwise.
    // onConflict targets the UNIQUE(user_id) constraint defined in the migration.
    const { data: resume, error: upsertError } = await supabase
      .from('user_resumes')
      .upsert(
        {
          user_id: user.id,
          name: resumeName,
          original_text: original_text.trim(),
          parsed_content,
          uploaded_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('id, name, parsed_content, uploaded_at')
      .single();

    if (upsertError || !resume) {
      console.error('Upsert error /api/user/resume:', upsertError);
      return NextResponse.json(
        { error: 'Error al guardar el CV', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ resume }, { status: 200 });
  } catch (error) {
    console.error('POST /api/user/resume error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

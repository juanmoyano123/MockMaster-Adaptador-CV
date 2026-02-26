/**
 * API Route: POST|GET /api/applications
 * Feature: Track U - Application Tracker API
 *
 * Manages job application records for authenticated users.
 * Supports both cookie-based sessions (web app) and Bearer tokens (extension).
 *
 * POST /api/applications — Create a new application record
 *   Body: { job_title, company_name, job_url, source, location?, salary?,
 *           modality?, status?, adapted_content?, ats_score?, template_used?,
 *           job_analysis?, notes? }
 *   201: { application }
 *   400: { error, code: 'VALIDATION_FAILED' }
 *   401: { error, code: 'UNAUTHORIZED' }
 *   409: { error, code: 'DUPLICATE' }
 *   500: { error, code: 'INTERNAL_ERROR' }
 *
 * GET /api/applications — List applications for the current user
 *   Query params: status (comma-separated), job_url, sort, order, limit, offset
 *   200: { applications: Application[], total: number }
 *   401: { error, code: 'UNAUTHORIZED' }
 *   500: { error, code: 'INTERNAL_ERROR' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_SOURCES = ['linkedin', 'indeed', 'manual'] as const;
const VALID_MODALITIES = ['remote', 'hybrid', 'onsite'] as const;
const VALID_STATUSES = ['aplicada', 'entrevista', 'oferta', 'rechazada', 'descartada'] as const;

// Columns allowed in the sort parameter to prevent SQL injection
const ALLOWED_SORT_COLUMNS = [
  'applied_at',
  'created_at',
  'updated_at',
  'company_name',
  'job_title',
  'status',
] as const;

type AllowedSortColumn = (typeof ALLOWED_SORT_COLUMNS)[number];

// ---------------------------------------------------------------------------
// POST /api/applications — Create application
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Campos requeridos: job_title, company_name, job_url, source',
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      );
    }

    // 3. Validate required fields — all must be non-empty strings
    const { job_title, company_name, job_url, source } = body;

    if (
      !job_title || typeof job_title !== 'string' || job_title.trim() === '' ||
      !company_name || typeof company_name !== 'string' || company_name.trim() === '' ||
      !job_url || typeof job_url !== 'string' || job_url.trim() === '' ||
      !source || typeof source !== 'string' || source.trim() === ''
    ) {
      return NextResponse.json(
        {
          error: 'Campos requeridos: job_title, company_name, job_url, source',
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      );
    }

    // 4. Normalize source: map 'other' → 'manual' for compatibility with the
    //    DB constraint that only allows 'linkedin' | 'indeed' | 'manual'
    const normalizedSource: string = source === 'other' ? 'manual' : source;

    // 5. Validate normalized source
    if (!VALID_SOURCES.includes(normalizedSource as (typeof VALID_SOURCES)[number])) {
      return NextResponse.json(
        {
          error: `Fuente invalida. Valores permitidos: ${VALID_SOURCES.join(', ')}`,
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      );
    }

    // 6. Validate modality if provided
    if (
      body.modality !== undefined &&
      body.modality !== null &&
      !VALID_MODALITIES.includes(body.modality as (typeof VALID_MODALITIES)[number])
    ) {
      return NextResponse.json(
        {
          error: `Modalidad invalida. Valores permitidos: ${VALID_MODALITIES.join(', ')}`,
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      );
    }

    // 7. Validate status if provided
    if (
      body.status !== undefined &&
      body.status !== null &&
      !VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])
    ) {
      return NextResponse.json(
        {
          error: `Estado invalido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      );
    }

    // 8. Insert into Supabase — build payload explicitly to satisfy TS spread rules.
    //    Optional fields are only included when the body contains them so we
    //    do not overwrite DB defaults (e.g. status defaults to 'aplicada').
    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      job_title: (job_title as string).trim(),
      company_name: (company_name as string).trim(),
      job_url: (job_url as string).trim(),
      source: normalizedSource,
    };

    if (body.location) insertPayload.location = body.location;
    if (body.salary) insertPayload.salary = body.salary;
    if (body.modality) insertPayload.modality = body.modality;
    if (body.status) insertPayload.status = body.status;
    if (body.adapted_content) insertPayload.adapted_content = body.adapted_content;
    if (body.ats_score !== undefined) insertPayload.ats_score = body.ats_score;
    if (body.template_used) insertPayload.template_used = body.template_used;
    if (body.job_analysis) insertPayload.job_analysis = body.job_analysis;
    if (body.notes) insertPayload.notes = body.notes;

    const { data: application, error } = await supabase
      .from('applications')
      .insert(insertPayload)
      .select()
      .single();

    // 9. Handle duplicate (unique constraint on user_id + job_url)
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'Ya guardaste esta oferta', code: 'DUPLICATE' },
        { status: 409 }
      );
    }

    // 10. Handle other database errors
    if (error || !application) {
      console.error('POST /api/applications insert error:', error);
      return NextResponse.json(
        { error: 'Error al guardar la aplicacion', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // 11. Return the created record
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/applications — List applications
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Parse and validate query params
    const { searchParams } = new URL(request.url);

    const statusFilter = searchParams.get('status');
    const jobUrlFilter = searchParams.get('job_url');

    // sort: whitelist allowed column names to prevent injection
    const sortParam = searchParams.get('sort') ?? 'applied_at';
    const safeSort: AllowedSortColumn = ALLOWED_SORT_COLUMNS.includes(
      sortParam as AllowedSortColumn
    )
      ? (sortParam as AllowedSortColumn)
      : 'applied_at';

    // order: restrict to 'asc' or 'desc'
    const orderParam = searchParams.get('order') ?? 'desc';
    const order: 'asc' | 'desc' = orderParam === 'asc' ? 'asc' : 'desc';

    // limit: integer, capped at 100
    const limitParam = parseInt(searchParams.get('limit') ?? '50', 10);
    const limit = isNaN(limitParam) || limitParam < 1 ? 50 : Math.min(limitParam, 100);

    // offset: non-negative integer
    const offsetParam = parseInt(searchParams.get('offset') ?? '0', 10);
    const offset = isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

    // 3. Build Supabase query with exact row count
    let query = supabase
      .from('applications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Filter by status (comma-separated list)
    if (statusFilter) {
      const statuses = statusFilter
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length > 0) {
        query = query.in('status', statuses);
      }
    }

    // Filter by exact job URL (used by checkApplicationExists)
    if (jobUrlFilter) {
      query = query.eq('job_url', jobUrlFilter);
    }

    // Apply ordering and pagination
    query = query
      .order(safeSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    // 4. Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('GET /api/applications query error:', error);
      return NextResponse.json(
        { error: 'Error al obtener aplicaciones', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { applications: data ?? [], total: count ?? 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// OPTIONS — CORS preflight support (required for Chrome Extension fetch calls)
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

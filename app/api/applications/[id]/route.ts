/**
 * API Route: PATCH|DELETE /api/applications/[id]
 * Feature: Track U - Application Tracker API
 *
 * Updates or deletes a specific application record owned by the current user.
 * Both operations enforce user ownership via .eq('user_id', user.id).
 *
 * PATCH /api/applications/[id] — Update status and/or notes
 *   Body: { status?, notes? }
 *   200: { application }
 *   400: { error, code: 'VALIDATION_FAILED' }
 *   401: { error, code: 'UNAUTHORIZED' }
 *   404: { error, code: 'NOT_FOUND' }
 *   500: { error, code: 'INTERNAL_ERROR' }
 *
 * DELETE /api/applications/[id] — Remove application record
 *   200: { success: true }
 *   401: { error, code: 'UNAUTHORIZED' }
 *   404: { error, code: 'NOT_FOUND' }
 *   500: { error, code: 'INTERNAL_ERROR' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_STATUSES = ['aplicada', 'entrevista', 'oferta', 'rechazada', 'descartada'] as const;

// Standard UUID v4 regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Route context type (Next.js 15 — params is a Promise)
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// PATCH /api/applications/[id] — Update status and/or notes
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    // 1. Auth check
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Extract and validate the application ID
    const { id } = await params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'ID de aplicacion invalido', code: 'VALIDATION_FAILED' },
        { status: 400 }
      );
    }

    // 3. Parse request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud invalido', code: 'VALIDATION_FAILED' },
        { status: 400 }
      );
    }

    // 4. Validate fields
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json(
          {
            error: `Estado invalido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
            code: 'VALIDATION_FAILED',
          },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.notes !== undefined) {
      if (body.notes !== null && typeof body.notes !== 'string') {
        return NextResponse.json(
          { error: 'El campo notes debe ser un texto o null', code: 'VALIDATION_FAILED' },
          { status: 400 }
        );
      }
      updateData.notes = body.notes;
    }

    // Must have at least one updatable field
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'Se requiere al menos un campo para actualizar: status, notes',
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      );
    }

    // 5. Update in Supabase — enforce user ownership via eq('user_id', user.id)
    const { data: application, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    // 6. PGRST116 = "Row not found" from PostgREST; also check null result
    if (error?.code === 'PGRST116' || !application) {
      return NextResponse.json(
        { error: 'Aplicacion no encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (error) {
      console.error('PATCH /api/applications/[id] update error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la aplicacion', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // 7. Return updated record
    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/applications/[id] error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/applications/[id] — Remove application record
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // 1. Auth check
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Extract and validate the application ID
    const { id } = await params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'ID de aplicacion invalido', code: 'VALIDATION_FAILED' },
        { status: 400 }
      );
    }

    // 3. Check existence before deleting (ensures ownership + gives 404 feedback)
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Aplicacion no encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 4. Delete the record — ownership already confirmed above
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('DELETE /api/applications/[id] delete error:', error);
      return NextResponse.json(
        { error: 'Error al eliminar la aplicacion', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // 5. Confirm deletion
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/applications/[id] error:', error);
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

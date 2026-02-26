/**
 * API Route: GET /api/auth/extension-verify
 *
 * Verifies a Supabase Bearer token sent by the Chrome extension and returns
 * basic user information. The extension calls this endpoint on startup to
 * confirm the user is authenticated before making other API requests.
 *
 * Authentication: Bearer token in Authorization header (required)
 *
 * Response 200:
 *   { authenticated: true, user: { id: string, email: string, name: string } }
 *
 * Response 401:
 *   { authenticated: false, error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: 'Token invalido o sesion expirada' },
        { status: 401 }
      );
    }

    // Derive display name from user metadata or fall back to email prefix
    const name: string =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split('@')[0] ||
      'Usuario';

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email ?? '',
        name,
      },
    });
  } catch (error) {
    console.error('[extension-verify] Error:', error);

    return NextResponse.json(
      { authenticated: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Handle CORS pre-flight requests from the Chrome extension.
 * The OPTIONS method must return 200 with the appropriate headers.
 * The actual CORS headers are set globally in next.config.ts.
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

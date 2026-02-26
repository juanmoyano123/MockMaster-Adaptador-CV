/**
 * Download Extension API
 *
 * GET /api/download-extension
 * Serves the Chrome extension zip only to users with extension access:
 * - Pro subscribers (active or trialing)
 * - Users with admin_granted_access = true
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status, admin_granted_access')
      .eq('user_id', user.id)
      .single();

    const adminGrantedAccess = subscription?.admin_granted_access === true;
    const tier = subscription?.tier || 'free';
    const status = subscription?.status || 'active';

    const hasExtensionAccess =
      adminGrantedAccess ||
      (tier === 'pro' && (status === 'active' || status === 'trialing'));

    if (!hasExtensionAccess) {
      return NextResponse.json(
        { error: 'Acceso no autorizado. Requiere plan Pro o habilitación manual.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return NextResponse.redirect(new URL('/mockmaster-extension.zip', request.url));
  } catch (error) {
    console.error('Download extension error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

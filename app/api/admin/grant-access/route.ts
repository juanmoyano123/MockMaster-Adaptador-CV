import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { isAdmin, getAdminServiceClient } from '@/lib/admin';

export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (!isAdmin(user.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const body = await request.json();
  const { user_id, granted } = body as { user_id: string; granted: boolean };

  if (!user_id || typeof granted !== 'boolean') {
    return NextResponse.json({ error: 'user_id y granted son requeridos' }, { status: 400 });
  }

  const supabase = getAdminServiceClient();

  const { error } = await supabase
    .from('user_subscriptions')
    .update({ admin_granted_access: granted, updated_at: new Date().toISOString() })
    .eq('user_id', user_id);

  if (error) {
    return NextResponse.json({ error: 'Error al actualizar acceso' }, { status: 500 });
  }

  return NextResponse.json({ success: true, user_id, admin_granted_access: granted });
}

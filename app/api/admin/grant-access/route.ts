import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { isAdmin, getAdminServiceClient } from '@/lib/admin';

export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (!isAdmin(user.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  let body: { user_id?: unknown; granted?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { user_id, granted } = body;

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof user_id !== 'string' || !UUID_RE.test(user_id)) {
    return NextResponse.json({ error: 'user_id debe ser un UUID válido' }, { status: 400 });
  }
  if (typeof granted !== 'boolean') {
    return NextResponse.json({ error: 'granted debe ser boolean' }, { status: 400 });
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

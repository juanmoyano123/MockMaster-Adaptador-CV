import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { isAdmin, getAdminServiceClient } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (!isAdmin(user.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const supabase = getAdminServiceClient();

  // Fetch all auth users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (authError) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }

  // Fetch all subscriptions
  const { data: subscriptions } = await supabase
    .from('user_subscriptions')
    .select('user_id, tier, status, admin_granted_access');

  // Fetch usage this month
  const now = new Date();
  const periodKey = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const { data: usages } = await supabase
    .from('subscription_usage')
    .select('user_id, adaptations_count')
    .eq('period_start', periodKey);

  const subMap = Object.fromEntries((subscriptions || []).map((s: { user_id: string; tier: string; status: string; admin_granted_access: boolean }) => [s.user_id, s]));
  const usageMap = Object.fromEntries((usages || []).map((u: { user_id: string; adaptations_count: number }) => [u.user_id, u.adaptations_count]));

  const users = authData.users.map((u: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at: string; last_sign_in_at?: string }) => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.name || u.email?.split('@')[0] || 'Sin nombre',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at || null,
    subscription: subMap[u.id] || null,
    adaptations_this_month: usageMap[u.id] || 0,
  }));

  return NextResponse.json({ users, total: users.length });
}

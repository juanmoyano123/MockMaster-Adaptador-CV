import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { isAdmin, getAdminServiceClient } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (!isAdmin(user.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const supabase = getAdminServiceClient();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data: applications, error, count } = await supabase
    .from('applications')
    .select('id, user_id, job_title, company_name, source, status, ats_score, applied_at', { count: 'exact' })
    .order('applied_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: 'Error al obtener aplicaciones' }, { status: 500 });

  // Fetch auth users to get emails
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = Object.fromEntries((authData?.users || []).map((u: { id: string; email?: string }) => [u.id, u.email]));

  const result = (applications || []).map((a: { id: string; user_id: string; job_title: string; company_name: string; source: string; status: string; ats_score: number | null; applied_at: string }) => ({
    ...a,
    user_email: emailMap[a.user_id] || a.user_id,
  }));

  return NextResponse.json({ applications: result, total: count || 0 });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { isAdmin, getAdminServiceClient } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (!isAdmin(user.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const supabase = getAdminServiceClient();

  const { data: resumes, error } = await supabase
    .from('user_resumes')
    .select('id, user_id, name, uploaded_at, original_text')
    .order('uploaded_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Error al obtener CVs' }, { status: 500 });

  // Fetch auth users to get emails
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = Object.fromEntries((authData?.users || []).map((u: { id: string; email?: string }) => [u.id, u.email]));

  const result = (resumes || []).map((r: { id: string; user_id: string; name: string; uploaded_at: string; original_text: string }) => ({
    id: r.id,
    user_id: r.user_id,
    user_email: emailMap[r.user_id] || r.user_id,
    name: r.name,
    uploaded_at: r.uploaded_at,
    preview: r.original_text?.slice(0, 200) || '',
  }));

  return NextResponse.json({ resumes: result, total: result.length });
}

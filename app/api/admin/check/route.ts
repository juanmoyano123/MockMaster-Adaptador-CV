import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { isAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  return NextResponse.json({ isAdmin: true });
}

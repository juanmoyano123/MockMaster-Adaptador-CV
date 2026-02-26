/**
 * Admin Pricing API
 *
 * GET  /api/admin/pricing  — returns the current Pro plan price
 * PUT  /api/admin/pricing  — updates the Pro plan price (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { isAdmin } from '@/lib/admin';
import { getProPrice, setProPrice } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const price = await getProPrice();
  return NextResponse.json({ price });
}

export async function PUT(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  let body: { price?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const price = Number(body.price);
  if (isNaN(price) || price <= 0) {
    return NextResponse.json({ error: 'El precio debe ser un número positivo' }, { status: 400 });
  }

  await setProPrice(price);
  return NextResponse.json({ price });
}

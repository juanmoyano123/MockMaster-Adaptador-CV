/**
 * Cancel Subscription API
 * Feature: F-009
 *
 * Cancels an active MercadoPago subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get current subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('mp_subscription_id, tier, status')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.mp_subscription_id) {
      return NextResponse.json(
        { error: 'No hay suscripcion activa', code: 'NO_SUBSCRIPTION' },
        { status: 400 }
      );
    }

    if (subscription.tier !== 'pro') {
      return NextResponse.json(
        { error: 'Solo puedes cancelar suscripciones Pro', code: 'NOT_PRO' },
        { status: 400 }
      );
    }

    // Cancel in MercadoPago
    await cancelSubscription(subscription.mp_subscription_id);

    // Update local status (webhook will also update, but this is faster for UI)
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Suscripcion cancelada. Tendras acceso hasta el fin del periodo actual.',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Error al cancelar suscripcion', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Cancel Subscription API
 * Feature: F-009
 *
 * POST /api/subscriptions/cancel
 * Cancels the user's active subscription in MercadoPago
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription } from '@/lib/mercadopago';
import { updateUserSubscription } from '@/lib/subscription-storage';

export async function POST() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get current subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('mp_subscription_id, tier, status')
      .eq('user_id', user.id)
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Suscripcion no encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (subscription.tier !== 'pro') {
      return NextResponse.json(
        { error: 'No tienes una suscripcion Pro activa', code: 'NOT_PRO' },
        { status: 400 }
      );
    }

    if (subscription.status === 'cancelled') {
      return NextResponse.json(
        { error: 'La suscripcion ya esta cancelada', code: 'ALREADY_CANCELLED' },
        { status: 400 }
      );
    }

    // Cancel in MercadoPago
    if (subscription.mp_subscription_id) {
      try {
        await cancelSubscription(subscription.mp_subscription_id);
      } catch (mpError) {
        console.error('MercadoPago cancel error:', mpError);
        // Continue to update local status even if MP fails
        // The webhook will sync the status later
      }
    }

    // Update local status
    await updateUserSubscription({
      status: 'cancelled',
    });

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

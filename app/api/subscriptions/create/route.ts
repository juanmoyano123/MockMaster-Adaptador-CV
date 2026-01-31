/**
 * Create Subscription API
 * Feature: F-009
 *
 * Creates a new MercadoPago subscription and returns checkout URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSubscription } from '@/lib/mercadopago';

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

    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('tier, status, mp_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (existingSub?.tier === 'pro' && existingSub?.status === 'active') {
      return NextResponse.json(
        { error: 'Ya tienes una suscripcion activa', code: 'ALREADY_SUBSCRIBED' },
        { status: 400 }
      );
    }

    // Create subscription in MercadoPago
    const payerEmail = user.email!;

    const { init_point, subscription_id } = await createSubscription(
      user.id,
      payerEmail
    );

    // Store pending subscription ID
    await supabase
      .from('user_subscriptions')
      .update({
        mp_subscription_id: subscription_id,
        status: 'inactive', // Will be updated by webhook
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      checkout_url: init_point,
      subscription_id,
    });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Create subscription error:', JSON.stringify(error, null, 2));
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
    }

    let errorMessage = 'Error desconocido';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // MercadoPago errors might be objects with message or cause
      const errObj = error as Record<string, unknown>;
      errorMessage = String(errObj.message || errObj.cause || errObj.error || JSON.stringify(error));
    }

    return NextResponse.json(
      { error: `Error al crear suscripcion: ${errorMessage}`, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

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
    const { init_point, subscription_id } = await createSubscription(
      user.id,
      user.email!
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
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Error al crear suscripcion', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

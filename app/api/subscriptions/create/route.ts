/**
 * Create Subscription API
 * Feature: F-009
 *
 * POST /api/subscriptions/create
 * Returns the MercadoPago checkout URL
 *
 * Supports two modes:
 * 1. Plan-based: If MP_PLAN_ID is set, redirects to plan checkout
 * 2. API-based: Creates subscription via API (for testing or custom subscriptions)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSubscription } from '@/lib/mercadopago';

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

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .single();

    if (existingSubscription?.tier === 'pro' && existingSubscription?.status === 'active') {
      return NextResponse.json(
        { error: 'Ya tienes una suscripcion activa', code: 'SUBSCRIPTION_EXISTS' },
        { status: 400 }
      );
    }

    // Check if we have a plan ID configured
    const planId = process.env.MP_PLAN_ID;

    if (planId) {
      // Mode 1: Plan-based checkout (production)
      const backUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`);
      const checkoutUrl = `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=${planId}&external_reference=${user.id}&back_url=${backUrl}`;

      return NextResponse.json({
        checkout_url: checkoutUrl,
      });
    } else {
      // Mode 2: API-based subscription (testing)
      const result = await createSubscription(user.id, user.email || '');

      // Save the subscription ID for later reference
      await supabase
        .from('user_subscriptions')
        .update({ mp_subscription_id: result.subscription_id })
        .eq('user_id', user.id);

      return NextResponse.json({
        checkout_url: result.init_point,
      });
    }
  } catch (error) {
    console.error('Create subscription error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error al crear suscripcion';

    return NextResponse.json(
      { error: errorMessage, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

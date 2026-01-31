/**
 * MercadoPago Webhook Handler
 * Feature: F-009
 *
 * Receives subscription events from MercadoPago and updates user subscription status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSubscription, mapMPStatus, verifyWebhookSignature } from '@/lib/mercadopago';

// Create admin client inside handler to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (process.env.NODE_ENV !== 'production') {
      console.log('Webhook received:', JSON.stringify(body, null, 2));
    }

    // Verificar firma del webhook (solo si MP_WEBHOOK_SECRET esta configurado)
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');

    if (process.env.MP_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(JSON.stringify(body), signature, requestId);
      if (!isValid) {
        console.error('Firma de webhook invalida');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // MercadoPago sends different event types
    const { action, data, type } = body;

    // We're interested in subscription events
    if (type !== 'subscription_preapproval' && !action?.includes('subscription')) {
      return NextResponse.json({ received: true });
    }

    const subscriptionId = data?.id;
    if (!subscriptionId) {
      console.error('No subscription ID in webhook');
      return NextResponse.json({ error: 'Missing subscription ID' }, { status: 400 });
    }

    // Get full subscription details from MercadoPago
    const mpSubscription = await getSubscription(subscriptionId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('MP Subscription:', JSON.stringify(mpSubscription, null, 2));
    }

    // Get user ID from external_reference
    const userId = mpSubscription.external_reference;
    if (!userId) {
      console.error('No user ID in subscription');
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Map MercadoPago status to our status
    const status = mapMPStatus(mpSubscription.status || 'pending');
    const tier = status === 'active' || status === 'trialing' ? 'pro' : 'free';

    // Calculate trial end date if applicable
    let trialEndsAt: string | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mpAny = mpSubscription as any;
    if (mpAny.free_trial) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + (mpAny.free_trial.frequency || 0));
      trialEndsAt = trialEnd.toISOString();
    }

    // Update subscription in Supabase
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        tier,
        status,
        mp_subscription_id: subscriptionId,
        mp_customer_id: mpSubscription.payer_id?.toString() || null,
        current_period_start: mpSubscription.date_created || null,
        current_period_end: mpSubscription.next_payment_date || null,
        trial_ends_at: trialEndsAt,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Subscription updated for user ${userId}: ${tier} (${status})`);
    }

    return NextResponse.json({ received: true, userId, tier, status });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// MercadoPago also sends GET requests for verification
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

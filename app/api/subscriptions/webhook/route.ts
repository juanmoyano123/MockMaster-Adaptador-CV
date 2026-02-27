/**
 * MercadoPago Webhook Handler
 * Feature: F-009
 *
 * POST /api/subscriptions/webhook
 * Receives notifications from MercadoPago about subscription events
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscription,
  mapMPStatus,
  verifyWebhookSignature,
} from '@/lib/mercadopago';
import {
  findSubscriptionByMPId,
  updateSubscriptionByUserId,
} from '@/lib/storage/subscription';

export async function POST(request: NextRequest) {
  try {
    // Get headers for signature verification
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    // Parse request body — return 400 on malformed JSON
    let body: { type?: string; action?: string; data?: { id?: string } };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // MercadoPago sends different notification formats
    // For subscription_preapproval: { action, type, data: { id }, ... }
    const { type, data } = body;

    // Only process subscription_preapproval events
    if (type !== 'subscription_preapproval') {
      return NextResponse.json({ received: true });
    }

    const subscriptionId = data?.id;

    if (!subscriptionId) {
      console.warn('[Webhook] Missing subscription ID in payload');
      return NextResponse.json({ received: true });
    }

    // Enforce signature verification when secret is configured
    if (process.env.MP_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(subscriptionId, xRequestId, xSignature);
      if (!isValid) {
        console.warn('[Webhook] Invalid signature — rejecting request');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Get subscription details from MercadoPago
    const mpSubscription = await getSubscription(subscriptionId);

    if (!mpSubscription) {
      console.error('[Webhook] Could not fetch subscription from MercadoPago');
      return NextResponse.json({ received: true });
    }

    // Map MP status to our status
    const newStatus = mapMPStatus(mpSubscription.status || '');
    const userId = mpSubscription.external_reference;

    if (!userId) {
      console.error('[Webhook] Subscription missing external_reference (user_id)');
      return NextResponse.json({ received: true });
    }

    // Calculate period end — handle month-boundary edge cases correctly
    // (e.g. Jan 31 + 1 month → Feb 28, not Mar 3)
    const now = new Date();
    let periodEnd: string | null = null;

    if (newStatus === 'active') {
      const targetYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
      const targetMonth = (now.getMonth() + 1) % 12;
      const lastDayOfTarget = new Date(targetYear, targetMonth + 1, 0).getDate();
      const day = Math.min(now.getDate(), lastDayOfTarget);
      periodEnd = new Date(targetYear, targetMonth, day).toISOString();
    }

    // Update subscription in Supabase
    const updateData: Record<string, unknown> = {
      mp_subscription_id: subscriptionId,
      status: newStatus,
      current_period_start: now.toISOString(),
    };

    // Set tier based on status
    if (newStatus === 'active') {
      updateData.tier = 'pro';
      updateData.current_period_end = periodEnd;
    } else if (newStatus === 'cancelled') {
      // Keep pro tier until period ends, just mark as cancelled
      // User will still have access until current_period_end
    } else {
      // For inactive/pending, keep current tier
    }

    const updated = await updateSubscriptionByUserId(userId, updateData);

    if (!updated) {
      console.error('[Webhook] Failed to update subscription in database');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);

    // Always return 200 to acknowledge receipt
    // MercadoPago will retry on non-2xx responses
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}

// MercadoPago also sends GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

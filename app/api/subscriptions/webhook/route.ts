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
} from '@/lib/subscription-storage';

export async function POST(request: NextRequest) {
  try {
    // Get headers for signature verification
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    // Parse request body
    const body = await request.json();

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // MercadoPago sends different notification formats
    // For subscription_preapproval: { action, type, data: { id }, ... }
    const { type, action, data } = body;

    // Only process subscription_preapproval events
    if (type !== 'subscription_preapproval') {
      console.log(`Ignoring event type: ${type}`);
      return NextResponse.json({ received: true });
    }

    const subscriptionId = data?.id;

    if (!subscriptionId) {
      console.warn('Webhook missing subscription ID');
      return NextResponse.json({ received: true });
    }

    // Verify signature (optional but recommended)
    if (process.env.MP_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(subscriptionId, xRequestId, xSignature);
      if (!isValid) {
        console.warn('Invalid webhook signature');
        // Still process for now, but log the warning
        // In production you might want to reject invalid signatures
      }
    }

    // Get subscription details from MercadoPago
    const mpSubscription = await getSubscription(subscriptionId);

    if (!mpSubscription) {
      console.error('Could not fetch subscription from MercadoPago');
      return NextResponse.json({ received: true });
    }

    console.log('MP Subscription status:', mpSubscription.status);
    console.log('MP Subscription external_reference:', mpSubscription.external_reference);

    // Map MP status to our status
    const newStatus = mapMPStatus(mpSubscription.status || '');
    const userId = mpSubscription.external_reference;

    if (!userId) {
      console.error('Subscription missing external_reference (user_id)');
      return NextResponse.json({ received: true });
    }

    // Calculate period dates
    const now = new Date();
    let periodEnd: string | null = null;

    // If authorized/active, calculate next period end
    if (newStatus === 'active') {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      periodEnd = nextMonth.toISOString();
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
      console.error('Failed to update subscription in database');
    }

    console.log(`Subscription ${subscriptionId} updated: status=${newStatus}`);

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

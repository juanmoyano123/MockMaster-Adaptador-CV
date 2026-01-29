/**
 * MercadoPago Integration
 * Feature: F-009
 *
 * Handles subscription creation, cancellation, and status checks
 */

import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { TRIAL_DAYS, PLANS } from './subscription-config';

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preapproval = new PreApproval(client);

/**
 * Create a new subscription with trial period
 */
export async function createSubscription(
  userId: string,
  email: string
): Promise<{ init_point: string; subscription_id: string }> {
  // Using 'as any' because MercadoPago SDK types don't include free_trial
  // but the API does support it
  const result = await preapproval.create({
    body: {
      reason: 'MockMaster Pro - Suscripcion Mensual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: PLANS.pro.price,
        currency_id: PLANS.pro.currency === 'USD' ? 'USD' : 'ARS',
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      payer_email: email,
      external_reference: userId,
      // @ts-expect-error - free_trial is supported by API but not in SDK types
      free_trial: {
        frequency: TRIAL_DAYS,
        frequency_type: 'days',
      },
    },
  });

  return {
    init_point: result.init_point!,
    subscription_id: result.id!,
  };
}

/**
 * Cancel an existing subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await preapproval.update({
    id: subscriptionId,
    body: {
      status: 'cancelled',
    },
  });
}

/**
 * Pause a subscription
 */
export async function pauseSubscription(subscriptionId: string): Promise<void> {
  await preapproval.update({
    id: subscriptionId,
    body: {
      status: 'paused',
    },
  });
}

/**
 * Get subscription details from MercadoPago
 */
export async function getSubscription(subscriptionId: string) {
  const result = await preapproval.get({ id: subscriptionId });
  return result;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  requestId: string | null
): boolean {
  // MercadoPago uses x-signature header with ts and v1 components
  // Format: ts=<timestamp>,v1=<hash>
  if (!signature || !process.env.MP_WEBHOOK_SECRET) {
    console.warn('Missing signature or webhook secret');
    return false;
  }

  try {
    const crypto = require('crypto');

    // Parse signature components
    const parts = signature.split(',');
    const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !v1) {
      console.warn('Invalid signature format');
      return false;
    }

    // Build the manifest string
    const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`;

    // Calculate HMAC
    const hmac = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest('hex');

    return hmac === v1;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Map MercadoPago status to our subscription status
 */
export function mapMPStatus(
  mpStatus: string
): 'active' | 'inactive' | 'trialing' | 'past_due' | 'cancelled' {
  switch (mpStatus) {
    case 'authorized':
    case 'active':
      return 'active';
    case 'pending':
    case 'paused':
      return 'inactive';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'inactive';
  }
}

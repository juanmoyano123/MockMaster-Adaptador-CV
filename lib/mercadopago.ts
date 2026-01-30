/**
 * MercadoPago Integration
 * Feature: F-009
 *
 * Handles subscription creation, cancellation, and status checks
 */

import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { PLANS } from './subscription-config';

// Lazy-load MercadoPago client to ensure env vars are available
function getPreApproval() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN no está configurado');
  }
  console.log('Initializing MercadoPago with token:', accessToken.substring(0, 20) + '...');
  const client = new MercadoPagoConfig({ accessToken });
  return new PreApproval(client);
}

/**
 * Create a new subscription with trial period
 */
export async function createSubscription(
  userId: string,
  email: string
): Promise<{ init_point: string; subscription_id: string }> {
  try {
    const body = {
      reason: 'MockMaster Pro - Suscripcion Mensual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months' as const,
        transaction_amount: PLANS.pro.price,
        currency_id: 'ARS' as const,
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      payer_email: email,
      external_reference: userId,
      status: 'pending' as const,
    };

    console.log('Creating subscription with body:', JSON.stringify(body, null, 2));

    const preapproval = getPreApproval();
    const result = await preapproval.create({ body });

    console.log('MercadoPago result:', JSON.stringify(result, null, 2));

    return {
      init_point: result.init_point!,
      subscription_id: result.id!,
    };
  } catch (error) {
    console.error('MercadoPago create error:', error);
    throw error;
  }
}

/**
 * Cancel an existing subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const preapproval = getPreApproval();
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
  const preapproval = getPreApproval();
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
  const preapproval = getPreApproval();
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

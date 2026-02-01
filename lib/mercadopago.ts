/**
 * MercadoPago Integration
 * Feature: F-009
 *
 * Handles subscription creation, cancellation, and status checks
 * using MercadoPago's PreApproval API (Subscriptions without associated plan)
 */

import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { PLANS } from './subscription-config';
import { SubscriptionStatus } from './types';

/**
 * Get MercadoPago PreApproval client (lazy initialization)
 */
function getPreApproval(): PreApproval {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN no esta configurado');
  }
  const client = new MercadoPagoConfig({ accessToken });
  return new PreApproval(client);
}

/**
 * Create a new subscription
 * Returns the checkout URL where the user will complete the payment
 */
export async function createSubscription(
  userId: string,
  email: string
): Promise<{ init_point: string; subscription_id: string }> {
  const preApproval = getPreApproval();

  // Check if we're in test mode (TEST credentials)
  const isTestMode = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-');

  // In test mode, use the test buyer email; in production, use real user email
  const testBuyerEmail = 'test_user_5362886612546862681@testuser.com';
  const payerEmail = isTestMode ? testBuyerEmail : email;

  const body = {
    reason: 'MockMaster Pro - Suscripcion Mensual',
    external_reference: userId,
    payer_email: payerEmail,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months' as const,
      transaction_amount: PLANS.pro.price,
      currency_id: 'ARS' as const,
    },
    back_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    status: 'pending' as const,
  };

  const result = await preApproval.create({ body });

  if (!result.init_point || !result.id) {
    throw new Error('MercadoPago no retorno init_point o id');
  }

  return {
    init_point: result.init_point,
    subscription_id: result.id,
  };
}

/**
 * Cancel an existing subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const preApproval = getPreApproval();
  await preApproval.update({
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
  const preApproval = getPreApproval();
  await preApproval.update({
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
  const preApproval = getPreApproval();
  return preApproval.get({ id: subscriptionId });
}

/**
 * Verify webhook signature
 * MercadoPago uses x-signature header with ts and v1 components
 */
export function verifyWebhookSignature(
  dataId: string,
  xRequestId: string | null,
  xSignature: string | null
): boolean {
  if (!xSignature || !process.env.MP_WEBHOOK_SECRET) {
    console.warn('Missing signature or webhook secret');
    return false;
  }

  try {
    const crypto = require('crypto');

    // Parse signature components: ts=xxx,v1=xxx
    const parts = xSignature.split(',');
    const ts = parts.find((p: string) => p.startsWith('ts='))?.split('=')[1];
    const v1 = parts.find((p: string) => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !v1) {
      console.warn('Invalid signature format');
      return false;
    }

    // Build manifest string according to MP docs
    // Format: id:[data.id];request-id:[x-request-id];ts:[ts];
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Calculate HMAC-SHA256
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
 * Map MercadoPago subscription status to our internal status
 */
export function mapMPStatus(mpStatus: string): SubscriptionStatus {
  switch (mpStatus) {
    case 'authorized':
    case 'active':
      return 'active';
    case 'pending':
      return 'inactive';
    case 'paused':
      return 'inactive';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'inactive';
  }
}

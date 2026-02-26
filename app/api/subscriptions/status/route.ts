/**
 * Subscription Status API
 * Feature: F-009
 *
 * GET /api/subscriptions/status
 * Returns current subscription status and usage for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { PLANS } from '@/lib/subscription-config';
import { getUsageThisMonth } from '@/lib/storage/subscription';
import { SubscriptionTier } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user — supports cookie (web app) and Bearer token (extension)
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get subscription from Supabase
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
    }

    // Default to free tier if no subscription found
    const tier: SubscriptionTier = (subscription?.tier as SubscriptionTier) || 'free';
    const status = subscription?.status || 'active';
    const plan = PLANS[tier];

    // Get usage for current month
    const adaptationsUsed = await getUsageThisMonth();

    // Check if admin granted free access (bypasses tier and usage limits)
    const adminGrantedAccess = subscription?.admin_granted_access === true;

    // Calculate extension access: pro active/trialing OR admin granted
    const hasExtensionAccess =
      adminGrantedAccess ||
      (tier === 'pro' && (status === 'active' || status === 'trialing'));

    // Calculate if user can adapt
    const canAdapt =
      adminGrantedAccess ||
      plan.limits.adaptations_per_month === -1 ||
      adaptationsUsed < plan.limits.adaptations_per_month;

    // Get period start for display
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return NextResponse.json({
      tier,
      status,
      plan: {
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        features: plan.features,
      },
      usage: {
        adaptations_used: adaptationsUsed,
        adaptations_limit: adminGrantedAccess ? -1 : plan.limits.adaptations_per_month,
        can_adapt: canAdapt,
        period_start: periodStart.toISOString(),
      },
      has_extension_access: hasExtensionAccess,
      subscription: subscription
        ? {
            current_period_end: subscription.current_period_end,
            trial_ends_at: subscription.trial_ends_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Status subscription error:', error);

    return NextResponse.json(
      { error: 'Error al obtener estado de suscripcion', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Subscription Status API
 * Feature: F-009
 *
 * GET /api/subscriptions/status
 * Returns current subscription status and usage for the authenticated user
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/subscription-config';
import { getUsageThisMonth } from '@/lib/subscription-storage';
import { SubscriptionTier } from '@/lib/types';

export async function GET() {
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

    // Calculate if user can adapt
    const canAdapt =
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
        adaptations_limit: plan.limits.adaptations_per_month,
        can_adapt: canAdapt,
        period_start: periodStart.toISOString(),
      },
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

/**
 * Subscription Status API
 * Feature: F-009
 *
 * Returns current subscription status and usage for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/subscription-config';

export async function GET(request: NextRequest) {
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

    // Get subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get usage for current month
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodKey = periodStart.toISOString().split('T')[0];

    const { data: usage } = await supabase
      .from('subscription_usage')
      .select('adaptations_count')
      .eq('user_id', user.id)
      .eq('period_start', periodKey)
      .single();

    const tier = subscription?.tier || 'free';
    const plan = PLANS[tier as keyof typeof PLANS];
    const adaptationsUsed = usage?.adaptations_count || 0;
    const adaptationsLimit = plan.limits.adaptations_per_month;
    const canAdapt =
      adaptationsLimit === -1 || adaptationsUsed < adaptationsLimit;

    return NextResponse.json({
      tier,
      status: subscription?.status || 'active',
      plan: {
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        features: plan.features,
      },
      usage: {
        adaptations_used: adaptationsUsed,
        adaptations_limit: adaptationsLimit,
        can_adapt: canAdapt,
        period_start: periodKey,
      },
      subscription: subscription
        ? {
            current_period_end: subscription.current_period_end,
            trial_ends_at: subscription.trial_ends_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

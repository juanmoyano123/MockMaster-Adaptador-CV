/**
 * Subscription Storage
 * Feature: F-009
 *
 * Handles subscription data persistence with Supabase
 */

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { UserSubscription, SubscriptionTier } from './types';

/**
 * Get Supabase client with service role (for webhooks)
 * This bypasses RLS policies
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase service role credentials');
  }

  return createServiceClient(url, serviceKey);
}

/**
 * Get user's subscription from Supabase
 */
export async function getUserSubscription(): Promise<UserSubscription | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data as UserSubscription;
}

/**
 * Get adaptations used this month
 */
export async function getUsageThisMonth(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  // Get first day of current month
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodKey = periodStart.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('subscription_usage')
    .select('adaptations_count')
    .eq('user_id', user.id)
    .eq('period_start', periodKey)
    .single();

  if (error) {
    // No record means 0 usage
    return 0;
  }

  return data?.adaptations_count || 0;
}

/**
 * Increment usage counter for current month
 */
export async function incrementUsage(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Get first day of current month
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodKey = periodStart.toISOString().split('T')[0];

  // Try to increment existing record
  const { data: existing } = await supabase
    .from('subscription_usage')
    .select('adaptations_count')
    .eq('user_id', user.id)
    .eq('period_start', periodKey)
    .single();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('subscription_usage')
      .update({ adaptations_count: existing.adaptations_count + 1 })
      .eq('user_id', user.id)
      .eq('period_start', periodKey);

    if (error) {
      console.error('Error updating usage:', error);
      return false;
    }
  } else {
    // Create new record
    const { error } = await supabase.from('subscription_usage').insert({
      user_id: user.id,
      period_start: periodKey,
      adaptations_count: 1,
    });

    if (error) {
      console.error('Error creating usage:', error);
      return false;
    }
  }

  return true;
}

/**
 * Update subscription in Supabase (for authenticated user)
 */
export async function updateUserSubscription(
  updates: Partial<UserSubscription>
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating subscription:', error);
    return false;
  }

  return true;
}

/**
 * Update subscription by user ID (for webhooks - uses service role)
 */
export async function updateSubscriptionByUserId(
  userId: string,
  updates: Partial<UserSubscription>
): Promise<boolean> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
    return false;
  }

  return true;
}

/**
 * Find subscription by MercadoPago subscription ID (for webhooks)
 */
export async function findSubscriptionByMPId(
  mpSubscriptionId: string
): Promise<UserSubscription | null> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('mp_subscription_id', mpSubscriptionId)
    .single();

  if (error) {
    console.error('Error finding subscription:', error);
    return null;
  }

  return data as UserSubscription;
}

/**
 * Get subscription and usage combined
 */
export async function getSubscriptionWithUsage(): Promise<{
  subscription: UserSubscription | null;
  usage: number;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [subscription, usage] = await Promise.all([
    getUserSubscription(),
    getUsageThisMonth(),
  ]);

  return { subscription, usage };
}

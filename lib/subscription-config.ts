/**
 * Subscription Configuration
 * Feature: F-009
 *
 * Defines subscription plans, limits, and pricing
 */

import { SubscriptionTier, SubscriptionPlan } from './types';

export const PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Plan Gratuito',
    price: 0,
    currency: 'ARS',
    features: [
      '5 adaptaciones por mes',
      'Análisis de ofertas ilimitado',
      '3 templates PDF',
      'Biblioteca de ofertas',
    ],
    limits: {
      adaptations_per_month: 5,
    },
  },
  pro: {
    id: 'pro',
    name: 'Plan Pro',
    price: 19,
    currency: 'USD',
    features: [
      'Adaptaciones ilimitadas',
      'Análisis de ofertas ilimitado',
      'Templates premium',
      'Soporte prioritario',
      'Sincronización en la nube',
    ],
    limits: {
      adaptations_per_month: -1, // -1 = unlimited
    },
  },
};

// Trial configuration
export const TRIAL_DAYS = 2;

// Check if user can adapt based on their subscription
export function canAdapt(
  tier: SubscriptionTier,
  adaptationsUsed: number
): boolean {
  const plan = PLANS[tier];
  if (plan.limits.adaptations_per_month === -1) {
    return true; // Unlimited
  }
  return adaptationsUsed < plan.limits.adaptations_per_month;
}

// Get remaining adaptations
export function getRemainingAdaptations(
  tier: SubscriptionTier,
  adaptationsUsed: number
): number | 'unlimited' {
  const plan = PLANS[tier];
  if (plan.limits.adaptations_per_month === -1) {
    return 'unlimited';
  }
  return Math.max(0, plan.limits.adaptations_per_month - adaptationsUsed);
}

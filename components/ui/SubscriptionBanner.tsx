/**
 * Subscription Banner Component
 * Feature: F-009
 *
 * Shows usage status and upgrade prompt for free users
 */

'use client';

import { useState, useEffect } from 'react';
import { PLANS } from '@/lib/subscription-config';

interface SubscriptionBannerProps {
  onUpgradeClick?: () => void;
}

interface SubscriptionStatus {
  tier: 'free' | 'pro';
  usage: {
    adaptations_used: number;
    adaptations_limit: number;
    can_adapt: boolean;
  };
}

export default function SubscriptionBanner({
  onUpgradeClick,
}: SubscriptionBannerProps) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/subscriptions/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!status) return null;

  const { tier, usage } = status;
  const isUnlimited = usage.adaptations_limit === -1;
  const usagePercent = isUnlimited
    ? 0
    : (usage.adaptations_used / usage.adaptations_limit) * 100;
  const isNearLimit = usagePercent >= 80;
  const isAtLimit = !usage.can_adapt;

  // Pro users - show simple badge
  if (tier === 'pro') {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700">
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                PRO
              </span>
              Adaptaciones ilimitadas
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Free users - show usage and upgrade prompt
  return (
    <div
      className={`rounded-lg border p-4 ${
        isAtLimit
          ? 'bg-red-50 border-red-200'
          : isNearLimit
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Usage Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-sm font-medium ${
                isAtLimit
                  ? 'text-red-700'
                  : isNearLimit
                  ? 'text-yellow-700'
                  : 'text-blue-700'
              }`}
            >
              {usage.adaptations_used}/{usage.adaptations_limit} adaptaciones
              usadas este mes
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isAtLimit
                  ? 'bg-red-500'
                  : isNearLimit
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>

          {isAtLimit && (
            <p className="text-sm text-red-600 mt-2">
              Has alcanzado el limite mensual. Actualiza a Pro para continuar.
            </p>
          )}
        </div>

        {/* Upgrade Button */}
        {(isNearLimit || isAtLimit) && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isAtLimit
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                clipRule="evenodd"
              />
            </svg>
            Upgrade a Pro
          </button>
        )}
      </div>
    </div>
  );
}

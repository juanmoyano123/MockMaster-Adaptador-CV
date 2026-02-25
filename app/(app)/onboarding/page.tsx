/**
 * Onboarding Page
 * Feature: F-008
 *
 * Route: /onboarding
 * Renders the 3-step OnboardingWizard.
 *
 * If the user has already completed onboarding
 * (localStorage key 'mockmaster_onboarding_complete' === 'true'),
 * this page redirects to /dashboard. That redirect is handled
 * client-side inside OnboardingGuard to avoid hydration issues.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

const ONBOARDING_COMPLETE_KEY = 'mockmaster_onboarding_complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
      if (completed === 'true') {
        // Already completed - skip the wizard
        router.replace('/dashboard');
        return;
      }
    } catch {
      // localStorage unavailable - proceed to wizard
    }
    setChecking(false);
  }, [router]);

  // Show loading spinner while checking localStorage
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return <OnboardingWizard />;
}

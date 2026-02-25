/**
 * App Layout
 * Feature: F-008 (updated)
 *
 * Wraps all authenticated app pages with AppShell.
 * Handles:
 *   1. Auth protection: unauthenticated users → /login
 *   2. Onboarding gate: authenticated users who have NOT completed
 *      onboarding are redirected to /onboarding (unless already there)
 *   3. Clean layout for /onboarding route: no AppShell sidebar/header
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppShell from '@/components/app-shell/AppShell';

const ONBOARDING_COMPLETE_KEY = 'mockmaster_onboarding_complete';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Track whether we have read localStorage (to avoid hydration flash)
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Step 1: Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Step 2: Onboarding guard (only once authenticated and not already on /onboarding)
  useEffect(() => {
    if (loading || !user) return;

    // Check if the user has finished onboarding
    let completed = false;
    try {
      completed = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
    } catch {
      // If localStorage is unavailable, assume complete to not block users
      completed = true;
    }

    setOnboardingComplete(completed);
    setOnboardingChecked(true);

    // If not complete and not already on the onboarding route, redirect
    if (!completed && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, loading, pathname, router]);

  // -------------------------------------------------------
  // Loading states
  // -------------------------------------------------------

  // Auth loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (redirect in progress)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="text-slate-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // Onboarding check still in progress (and not already on /onboarding)
  if (!onboardingChecked && pathname !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Onboarding route: render WITHOUT AppShell (clean layout)
  // -------------------------------------------------------
  if (pathname === '/onboarding') {
    return <>{children}</>;
  }

  // -------------------------------------------------------
  // Onboarding not complete and redirect not yet triggered:
  // show a spinner to avoid a flash of app content
  // -------------------------------------------------------
  if (!onboardingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Normal authenticated flow: render with AppShell
  // -------------------------------------------------------
  return <AppShell>{children}</AppShell>;
}

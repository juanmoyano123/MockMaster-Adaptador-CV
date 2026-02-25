/**
 * Page: /adapt-resume
 * Feature: F-004 - AI Resume Adaptation Engine
 * Feature: F-010 - Usage Limits (SubscriptionBanner integration)
 *
 * Main page for AI-powered resume adaptation.
 * Shows subscription usage status before the adaptation flow.
 */

'use client';

import { useState } from 'react';
import ResumeAdaptationFlow from '@/components/ResumeAdaptationFlow';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import UpgradeModal from '@/components/UpgradeModal';

export default function AdaptResumePage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <>
      {/* Subscription usage banner - visible to all users */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <SubscriptionBanner onUpgradeClick={() => setShowUpgradeModal(true)} />
      </div>

      {/* Main adaptation flow */}
      <ResumeAdaptationFlow />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}

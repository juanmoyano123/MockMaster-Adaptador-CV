/**
 * Page: /adapt-resume
 * Feature: F-004 - AI Resume Adaptation Engine
 *
 * Main page for AI-powered resume adaptation
 */

import { Metadata } from 'next';
import ResumeAdaptationFlow from '@/components/ResumeAdaptationFlow';

export const metadata: Metadata = {
  title: 'Adapt Resume - MockMaster',
  description:
    'AI-powered resume adaptation to match job requirements. Optimize your resume for ATS in under 30 seconds.',
};

export default function AdaptResumePage() {
  return <ResumeAdaptationFlow />;
}

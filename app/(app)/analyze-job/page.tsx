/**
 * Job Analysis Page
 * Feature: F-003
 *
 * Main page for analyzing job descriptions.
 */

import JobAnalysisFlow from '@/components/JobAnalysisFlow';

export const metadata = {
  title: 'Analyze Job Description | MockMaster',
  description: 'Paste a job description and get AI-powered analysis of requirements, skills, and responsibilities.',
};

export default function AnalyzeJobPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <JobAnalysisFlow />
    </div>
  );
}

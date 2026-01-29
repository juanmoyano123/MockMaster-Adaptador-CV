/**
 * ATS Score Display Component
 * Feature: F-004 (Enhanced with F-005 Detailed Breakdown)
 *
 * Circular progress bar visualization for ATS score (0-100)
 * Color-coded: Green (70+), Yellow (50-69), Red (<50)
 *
 * F-005 Enhancement: Collapsible breakdown panel showing:
 * - Keyword matching score
 * - Skills matching score
 * - Experience relevance score
 * - Format score
 * - Missing keywords list
 * - Actionable suggestions
 */

'use client';

import { useEffect, useState } from 'react';
import { ATSScoreBreakdown } from '@/lib/types';

interface ATSScoreDisplayProps {
  score: number; // 0-100
  breakdown?: ATSScoreBreakdown; // F-005: Optional detailed breakdown
  size?: number; // Circle diameter in pixels (default: 150)
  strokeWidth?: number; // Progress bar thickness (default: 12)
}

export default function ATSScoreDisplay({
  score,
  breakdown,
  size = 150,
  strokeWidth = 12,
}: ATSScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Animate score from 0 to final value on mount
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60; // 60 fps
    const increment = score / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedScore(score);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score]);

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Determine color based on score
  const getColor = (score: number): string => {
    if (score >= 70) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);

  // Determine label based on score
  const getLabel = (score: number): string => {
    if (score >= 70) return 'Strong Match';
    if (score >= 50) return 'Good Match';
    return 'Needs Work';
  };

  return (
    <div className="w-full space-y-4">
      {/* Existing: Circular Gauge */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background circle */}
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
              }}
            />
          </svg>

          {/* Score text in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color }}>
              {animatedScore}
            </span>
            <span className="text-sm text-gray-500">ATS Score</span>
          </div>
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="font-semibold" style={{ color }}>
            {getLabel(score)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {score >= 70 && 'Excellent keyword match'}
            {score >= 50 && score < 70 && 'Consider adding more keywords'}
            {score < 50 && 'Significant keyword gaps'}
          </p>
        </div>
      </div>

      {/* NEW (F-005): Toggle Button and Breakdown Panel */}
      {breakdown && (
        <>
          {/* Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              {isExpanded ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Hide Details
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  See Details
                </>
              )}
            </button>
          </div>

          {/* Breakdown Panel (Collapsible) */}
          {isExpanded && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4 animate-fadeIn overflow-hidden">
              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900">
                Desglose del Score
              </h3>

              {/* Category Scores */}
              <div className="space-y-3">
                <CategoryScore
                  label="Keywords"
                  score={breakdown.keyword_score}
                  detail={`${breakdown.keywords_matched}/${breakdown.keywords_total}`}
                />
                <CategoryScore
                  label="Skills"
                  score={breakdown.skills_score}
                  detail={`${breakdown.skills_matched.length} match`}
                />
                <CategoryScore
                  label="Experiencia"
                  score={breakdown.experience_score}
                  detail="Relevancia"
                />
                <CategoryScore
                  label="Formato"
                  score={breakdown.format_score}
                  detail="ATS"
                />
              </div>

              {/* Missing Keywords Section */}
              {breakdown.missing_keywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Keywords Faltantes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {breakdown.missing_keywords.slice(0, 8).map((keyword, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {keyword}
                      </span>
                    ))}
                    {breakdown.missing_keywords.length > 8 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{breakdown.missing_keywords.length - 8} mas
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions Section */}
              {breakdown.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Sugerencias
                  </h4>
                  <ul className="space-y-1.5">
                    {breakdown.suggestions.slice(0, 4).map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="break-words">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Category Score Component
 * Shows individual score category with progress bar
 */
interface CategoryScoreProps {
  label: string;
  score: number; // 0-100
  detail: string;
}

function CategoryScore({ label, score, detail }: CategoryScoreProps) {
  const getColor = (score: number): string => {
    if (score >= 70) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);

  return (
    <div className="min-w-0">
      <div className="flex justify-between items-center mb-1 gap-2">
        <span className="text-xs font-medium text-gray-900 truncate">
          {label}: {score}/100
        </span>
        <span className="text-xs text-gray-500 flex-shrink-0">{detail}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

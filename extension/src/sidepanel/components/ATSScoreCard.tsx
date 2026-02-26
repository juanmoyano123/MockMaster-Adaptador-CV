/**
 * ATSScoreCard — compact, collapsible ATS score banner for the adapted-resume view.
 *
 * Responsibilities:
 *   - Always-visible banner showing the total ATS score and keyword match count.
 *   - Chevron toggle to expand/collapse a detailed breakdown panel.
 *   - CategoryBar sub-component renders a labelled progress bar for each
 *     scoring dimension (keywords, skills, experience, format).
 *   - Missing keywords rendered as red pill badges when present.
 *   - Improvement suggestions rendered as a bulleted list when present.
 *   - Fallback mode: when `atsBreakdown` is null but `fallbackScore` is given,
 *     only the banner is rendered with no expand button.
 *   - Fully null-safe: renders "—" when both props are absent.
 *
 * State:
 *   - `expanded` (boolean, default false) — controls breakdown panel visibility.
 *
 * Layout note:
 *   The component is intentionally self-contained and does NOT wrap itself in
 *   a `.card` class so the consumer can compose it freely inside any container.
 */

import React, { useState } from 'react';
import { ATSScoreBreakdown } from '../api/mockmaster-client';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ATSScoreCardProps {
  /** Full ATS breakdown from the API; enables the collapsible detail panel. */
  atsBreakdown: ATSScoreBreakdown | null;
  /** Fallback score from AdaptedResume.ats_score when breakdown isn't available. */
  fallbackScore?: number | null;
}

// ---------------------------------------------------------------------------
// Helpers — score-based colour tokens
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind text-color class that matches the score severity tier.
 *   >= 75 → green  (good)
 *   >= 50 → yellow (moderate)
 *    < 50 → red    (poor)
 */
function scoreTextColor(score: number): string {
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Returns the Tailwind background-color class for the progress-bar fill.
 *   >= 75 → green
 *   >= 50 → yellow
 *    < 50 → red
 */
function scoreBarColor(score: number): string {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-400';
  return 'bg-red-400';
}

/**
 * Returns the subtle tint class applied to the banner background.
 *   >= 75 → bg-green-50
 *   >= 50 → bg-yellow-50
 *    < 50 → bg-red-50
 */
function scoreBannerBg(score: number): string {
  if (score >= 75) return 'bg-green-50';
  if (score >= 50) return 'bg-yellow-50';
  return 'bg-red-50';
}

// ---------------------------------------------------------------------------
// CategoryBar — single scored dimension (label + progress bar + value)
// ---------------------------------------------------------------------------

interface CategoryBarProps {
  /** Human-readable label in Spanish, e.g. "Palabras clave" */
  label: string;
  /** Score value 0-100 */
  score: number;
}

/**
 * Renders a row with a label on the left, a proportional progress bar in the
 * middle, and the numeric score on the right.
 *
 * The bar fill width is driven by an inline style (`width: ${score}%`) so it
 * works without arbitrary Tailwind classes. The fill colour is determined by
 * the score tier via `scoreBarColor`.
 */
function CategoryBar({ label, score }: CategoryBarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <span className="text-xs text-slate-600 w-28 shrink-0">{label}</span>

      {/* Track */}
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        {/* Fill — width set via inline style; colour driven by score tier */}
        <div
          className={`h-full rounded-full ${scoreBarColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>

      {/* Numeric score */}
      <span className={`text-xs font-medium w-6 text-right ${scoreTextColor(score)}`}>
        {score}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChevronDown / ChevronUp inline SVG icons
// ---------------------------------------------------------------------------

/** Simple 16x16 chevron pointing down. */
function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/** Simple 16x16 chevron pointing up. */
function ChevronUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ATSScoreCard({ atsBreakdown, fallbackScore }: ATSScoreCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Determine the score to display in the banner.
  // Priority: breakdown.total_score > fallbackScore > null (renders "—").
  const displayScore: number | null =
    atsBreakdown?.total_score ?? fallbackScore ?? null;

  // The expand button is only rendered when a full breakdown is available.
  const hasBreakdown = atsBreakdown !== null;

  // Banner background tint — default to white when no score is available.
  const bannerBg =
    displayScore !== null ? scoreBannerBg(displayScore) : 'bg-white';

  // Score text colour — slate default when no score.
  const scoreColor =
    displayScore !== null ? scoreTextColor(displayScore) : 'text-slate-400';

  // Keyword subtitle — only shown when breakdown data is available.
  const keywordSubtitle =
    hasBreakdown && atsBreakdown
      ? `${atsBreakdown.keywords_matched}/${atsBreakdown.keywords_total} palabras clave`
      : null;

  return (
    <div className="border-b border-slate-200">
      {/* ------------------------------------------------------------------- */}
      {/* Banner — always visible                                             */}
      {/* ------------------------------------------------------------------- */}
      <div className={`${bannerBg} p-4 flex items-center justify-between gap-3`}>
        {/* Left side: label + keyword count subtitle */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold text-slate-700">Puntaje ATS</span>
          {keywordSubtitle && (
            <span className="text-xs text-slate-500">{keywordSubtitle}</span>
          )}
        </div>

        {/* Right side: chevron toggle + large score */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Chevron toggle — only rendered when a full breakdown exists */}
          {hasBreakdown && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-white/60
                         transition-colors duration-150 focus:outline-none
                         focus:ring-2 focus:ring-slate-300"
              aria-label={expanded ? 'Ocultar detalles ATS' : 'Ver detalles ATS'}
              aria-expanded={expanded}
            >
              {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          )}

          {/* Score number */}
          <div className="flex items-end leading-none">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {displayScore !== null ? displayScore : '—'}
            </span>
            {displayScore !== null && (
              <span className="text-xs text-slate-400 mb-1 ml-0.5">/100</span>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Breakdown panel — visible only when expanded and breakdown exists   */}
      {/* ------------------------------------------------------------------- */}
      {hasBreakdown && expanded && atsBreakdown && (
        <div className="bg-white p-4 flex flex-col gap-4">
          {/* Category progress bars */}
          <div className="flex flex-col gap-2">
            <CategoryBar label="Palabras clave" score={atsBreakdown.keyword_score} />
            <CategoryBar label="Habilidades"    score={atsBreakdown.skills_score} />
            <CategoryBar label="Experiencia"    score={atsBreakdown.experience_score} />
            <CategoryBar label="Formato"        score={atsBreakdown.format_score} />
          </div>

          {/* Missing keywords — only if list is non-empty */}
          {atsBreakdown.missing_keywords.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600">
                Palabras clave faltantes
              </span>
              <div className="inline-flex flex-wrap gap-1">
                {atsBreakdown.missing_keywords.map((kw, idx) => (
                  <span
                    key={`${kw}-${idx}`}
                    className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions — only if list is non-empty */}
          {atsBreakdown.suggestions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Sugerencias</span>
              <ul className="flex flex-col gap-1">
                {atsBreakdown.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-1.5 text-xs text-slate-600"
                  >
                    {/* Bullet lightbulb character */}
                    <span className="shrink-0 mt-px" aria-hidden="true">
                      💡
                    </span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

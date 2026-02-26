/**
 * formatSectionText — plain-text formatters for adapted CV sections
 *
 * Each function converts a structured data object (or array of objects)
 * into a plain-text string that can be written directly to the clipboard.
 *
 * Design decisions:
 *   - All types are declared inline with `Array<{...}>` so these functions
 *     remain compatible regardless of which exact type definitions are in
 *     scope across parallel tracks (Track K is rewriting mockmaster-client.ts
 *     types concurrently).
 *   - Functions are pure — no side-effects, no imports, fully testable.
 *   - Empty / falsy fields are filtered out before joining so the output
 *     never contains stray pipe separators ("Company | | 2020").
 */

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/**
 * Format the professional summary section as plain text.
 *
 * Simply trims leading and trailing whitespace so that the pasted text
 * does not start or end with blank lines.
 *
 * @param summary - Raw summary string from the adaptation API response.
 * @returns Trimmed summary string.
 */
export function formatSummary(summary: string): string {
  return summary.trim();
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

/**
 * Format experience entries as human-readable plain text for clipboard.
 *
 * Output format per entry:
 *   Company | Title | Dates
 *   - bullet1
 *   - bullet2
 *
 * Multiple entries are separated by a single blank line so the user can
 * paste the whole section into a document and have each job visually distinct.
 *
 * @param entries - Array of experience items from the adaptation response.
 * @returns Multi-line string, one block per experience entry.
 */
export function formatExperience(
  entries: Array<{
    company: string;
    title: string;
    dates: string;
    bullets: string[];
  }>
): string {
  return entries
    .map((entry) => {
      // Build the header line — only include non-empty segments so we never
      // produce output like "Acme |  | 2020–2023" when title is absent.
      const header = [entry.company, entry.title, entry.dates]
        .filter(Boolean)
        .join(' | ');

      // Each achievement bullet is prefixed with "- " to match standard
      // plain-text resume conventions.
      const bullets = entry.bullets.map((b) => `- ${b}`).join('\n');

      return `${header}\n${bullets}`;
    })
    .join('\n\n'); // blank line between entries
}

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

/**
 * Format education entries as plain text.
 *
 * Output: one entry per line, fields joined by " | ".
 * Example: "Universidad Nacional | Ing. Informática | 2015"
 *
 * @param entries - Array of education items from the adaptation response.
 * @returns Multi-line string, one line per education entry.
 */
export function formatEducation(
  entries: Array<{
    school: string;
    degree: string;
    year: string;
  }>
): string {
  return entries
    .map((entry) =>
      [entry.school, entry.degree, entry.year].filter(Boolean).join(' | ')
    )
    .join('\n');
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

/**
 * Format skills list as a comma-separated string.
 *
 * Example: "TypeScript, React, Node.js, PostgreSQL"
 *
 * @param skills - Array of skill strings from the adaptation response.
 * @returns Comma-separated skill list on a single line.
 */
export function formatSkills(skills: string[]): string {
  return skills.join(', ');
}

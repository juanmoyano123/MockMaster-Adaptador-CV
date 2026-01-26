/**
 * PDF Template HTML Generators (Server-side)
 * Feature: F-006
 *
 * These functions generate static HTML for PDF templates
 * without relying on React components or JSX
 */

import { AdaptedContent, TemplateType } from './types';

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generate Clean Template HTML
 */
export function generateCleanTemplateHTML(content: AdaptedContent): string {
  const contactParts = [
    content.contact.email,
    content.contact.phone,
    content.contact.linkedin,
    content.contact.location,
  ].filter((part): part is string => Boolean(part));

  const experienceHTML = content.experience
    .map(
      (exp) => `
    <div class="experience-item">
      <div class="job-header">
        <h3>${escapeHtml(exp.title)}</h3>
        <div class="company-info">
          <strong>${escapeHtml(exp.company)}</strong> | ${escapeHtml(exp.dates)}
        </div>
      </div>
      <ul>
        ${exp.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('\n        ')}
      </ul>
    </div>
  `
    )
    .join('\n  ');

  const educationHTML = content.education
    .map(
      (edu) => `
    <div class="education-item">
      <h3>${escapeHtml(edu.degree)}</h3>
      <p>${escapeHtml(edu.school)} | ${escapeHtml(edu.year)}</p>
    </div>
  `
    )
    .join('\n  ');

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      color: #000000;
      line-height: 1.6;
      padding: 0.75in;
    }
    h1 { font-size: 18pt; margin-bottom: 8pt; font-weight: bold; }
    h2 {
      font-size: 14pt;
      margin-top: 16pt;
      margin-bottom: 8pt;
      border-bottom: 1px solid #000;
      padding-bottom: 4pt;
      font-weight: bold;
    }
    h3 { font-size: 12pt; margin-bottom: 4pt; font-weight: bold; }
    p { margin-bottom: 8pt; line-height: 1.5; }
    ul { margin-left: 24pt; margin-bottom: 12pt; list-style-type: disc; }
    li { margin-bottom: 4pt; line-height: 1.5; }
    .header { text-align: center; margin-bottom: 20pt; }
    .contact { font-size: 10pt; margin-top: 4pt; }
    .experience-item { margin-bottom: 16pt; }
    .job-header { margin-bottom: 6pt; }
    .company-info { font-size: 11pt; margin-bottom: 2pt; }
    .education-item { margin-bottom: 10pt; }
    .skills-container { line-height: 1.8; }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${styles}</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(content.contact.name)}</h1>
    <div class="contact">${contactParts.map(escapeHtml).join(' | ')}</div>
  </div>

  ${content.summary ? `<h2>Professional Summary</h2><p>${escapeHtml(content.summary)}</p>` : ''}

  ${content.experience.length > 0 ? `<h2>Work Experience</h2>${experienceHTML}` : ''}

  ${content.education.length > 0 ? `<h2>Education</h2>${educationHTML}` : ''}

  ${content.skills.length > 0 ? `<h2>Skills</h2><div class="skills-container"><p>${content.skills.map(escapeHtml).join(' • ')}</p></div>` : ''}
</body>
</html>`;
}

/**
 * Generate Modern Template HTML
 */
export function generateModernTemplateHTML(content: AdaptedContent): string {
  const contactParts = [
    content.contact.email,
    content.contact.phone,
    content.contact.linkedin,
    content.contact.location,
  ].filter((part): part is string => Boolean(part));

  const experienceHTML = content.experience
    .map(
      (exp) => `
    <div class="experience-item">
      <div class="job-header">
        <h3>${escapeHtml(exp.title)}</h3>
        <div class="company-info">
          <strong>${escapeHtml(exp.company)}</strong> | ${escapeHtml(exp.dates)}
        </div>
      </div>
      <ul>
        ${exp.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('\n        ')}
      </ul>
    </div>
  `
    )
    .join('\n  ');

  const educationHTML = content.education
    .map(
      (edu) => `
    <div class="education-item">
      <h3>${escapeHtml(edu.degree)}</h3>
      <div class="school-info">${escapeHtml(edu.school)} | ${escapeHtml(edu.year)}</div>
    </div>
  `
    )
    .join('\n  ');

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      color: #000000;
      line-height: 1.6;
      padding: 0.6in;
    }
    h1 { font-size: 20pt; margin-bottom: 4pt; font-weight: bold; color: #1E3A5F; }
    h2 {
      font-size: 14pt;
      margin-top: 18pt;
      margin-bottom: 10pt;
      font-weight: bold;
      color: #1E3A5F;
      padding-bottom: 4pt;
      border-bottom: 2px solid #1E3A5F;
    }
    h3 { font-size: 12pt; margin-bottom: 4pt; font-weight: bold; color: #1E3A5F; }
    p { margin-bottom: 8pt; line-height: 1.5; }
    ul { margin-left: 20pt; margin-bottom: 12pt; list-style-type: disc; }
    li { margin-bottom: 4pt; line-height: 1.5; }
    .header {
      margin-bottom: 20pt;
      border-bottom: 3px solid #1E3A5F;
      padding-bottom: 12pt;
    }
    .contact { font-size: 10pt; margin-top: 6pt; color: #333333; }
    .experience-item { margin-bottom: 16pt; }
    .job-header { margin-bottom: 6pt; }
    .company-info { font-size: 10.5pt; color: #555555; margin-bottom: 4pt; }
    .education-item { margin-bottom: 12pt; }
    .school-info { font-size: 10.5pt; color: #555555; }
    .skills-container { line-height: 1.8; }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${styles}</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(content.contact.name)}</h1>
    <div class="contact">${contactParts.map(escapeHtml).join(' | ')}</div>
  </div>

  ${content.summary ? `<h2>Professional Summary</h2><p>${escapeHtml(content.summary)}</p>` : ''}

  ${content.experience.length > 0 ? `<h2>Work Experience</h2>${experienceHTML}` : ''}

  ${content.education.length > 0 ? `<h2>Education</h2>${educationHTML}` : ''}

  ${content.skills.length > 0 ? `<h2>Skills</h2><div class="skills-container"><p>${content.skills.map(escapeHtml).join(' • ')}</p></div>` : ''}
</body>
</html>`;
}

/**
 * Generate Compact Template HTML
 */
export function generateCompactTemplateHTML(content: AdaptedContent): string {
  const contactParts = [
    content.contact.email,
    content.contact.phone,
    content.contact.linkedin,
    content.contact.location,
  ].filter((part): part is string => Boolean(part));

  const experienceHTML = content.experience
    .map(
      (exp) => `
    <div class="experience-item">
      <div class="job-header">
        <h3>${escapeHtml(exp.title)}</h3>
        <div class="company-info">
          <strong>${escapeHtml(exp.company)}</strong> | ${escapeHtml(exp.dates)}
        </div>
      </div>
      <ul>
        ${exp.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('\n        ')}
      </ul>
    </div>
  `
    )
    .join('\n  ');

  const educationHTML = content.education
    .map(
      (edu) => `
    <div class="education-item">
      <div class="education-row">
        <strong>${escapeHtml(edu.degree)}</strong> | ${escapeHtml(edu.school)} | ${escapeHtml(edu.year)}
      </div>
    </div>
  `
    )
    .join('\n  ');

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial Narrow', Arial, sans-serif;
      font-size: 10pt;
      color: #000000;
      line-height: 1.4;
      padding: 0.5in;
    }
    h1 { font-size: 16pt; margin-bottom: 4pt; font-weight: bold; }
    h2 {
      font-size: 12pt;
      margin-top: 12pt;
      margin-bottom: 6pt;
      font-weight: bold;
      border-bottom: 1px solid #000;
      padding-bottom: 2pt;
    }
    h3 { font-size: 11pt; margin-bottom: 2pt; font-weight: bold; }
    p { margin-bottom: 6pt; line-height: 1.4; }
    ul { margin-left: 18pt; margin-bottom: 8pt; list-style-type: disc; }
    li { margin-bottom: 2pt; line-height: 1.4; }
    .header {
      text-align: center;
      margin-bottom: 12pt;
      border-bottom: 2px solid #000;
      padding-bottom: 6pt;
    }
    .contact { font-size: 9pt; margin-top: 2pt; }
    .experience-item { margin-bottom: 10pt; }
    .job-header { margin-bottom: 4pt; }
    .company-info { font-size: 10pt; margin-bottom: 2pt; }
    .education-item { margin-bottom: 6pt; }
    .education-row { font-size: 10pt; }
    .skills-container { line-height: 1.6; font-size: 10pt; }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${styles}</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(content.contact.name)}</h1>
    <div class="contact">${contactParts.map(escapeHtml).join(' | ')}</div>
  </div>

  ${content.summary ? `<h2>Professional Summary</h2><p>${escapeHtml(content.summary)}</p>` : ''}

  ${content.experience.length > 0 ? `<h2>Work Experience</h2>${experienceHTML}` : ''}

  ${content.education.length > 0 ? `<h2>Education</h2>${educationHTML}` : ''}

  ${content.skills.length > 0 ? `<h2>Skills</h2><div class="skills-container"><p>${content.skills.map(escapeHtml).join(' • ')}</p></div>` : ''}
</body>
</html>`;
}

/**
 * Main function to render template HTML
 */
export function renderTemplateToHTML(
  content: AdaptedContent,
  template: TemplateType
): string {
  switch (template) {
    case 'clean':
      return generateCleanTemplateHTML(content);
    case 'modern':
      return generateModernTemplateHTML(content);
    case 'compact':
      return generateCompactTemplateHTML(content);
    default:
      throw new Error(`Invalid template: ${template}`);
  }
}

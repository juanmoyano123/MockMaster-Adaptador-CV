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
 * Generate Executive Template HTML
 *
 * Formal, senior-level styling:
 * - Serif font (Cambria / Palatino Linotype / generic serif)
 * - Charcoal #2D2D2D body text
 * - Uppercase section headings with letter-spacing
 * - Em-dash (—) bullets instead of disc markers
 * - Contact row separated by pipes
 * - 11pt body, 0.75in padding
 */
export function generateExecutiveTemplateHTML(content: AdaptedContent): string {
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
      font-family: Cambria, 'Palatino Linotype', Palatino, 'Book Antiqua', serif;
      font-size: 11pt;
      color: #2D2D2D;
      line-height: 1.6;
      padding: 0.75in;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      letter-spacing: 0.04em;
      margin-bottom: 6pt;
      color: #1A1A1A;
    }
    h2 {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-top: 20pt;
      margin-bottom: 10pt;
      border-bottom: 1px solid #2D2D2D;
      padding-bottom: 4pt;
      color: #2D2D2D;
    }
    h3 { font-size: 11pt; font-weight: bold; margin-bottom: 3pt; color: #1A1A1A; }
    p { margin-bottom: 8pt; line-height: 1.5; }
    ul { margin-left: 0; margin-bottom: 12pt; list-style-type: none; }
    li { margin-bottom: 4pt; line-height: 1.5; padding-left: 18pt; text-indent: -18pt; }
    li::before { content: "\\2014\\00A0"; }
    .header { text-align: center; margin-bottom: 24pt; }
    .contact { font-size: 10pt; margin-top: 6pt; color: #555555; letter-spacing: 0.02em; }
    .experience-item { margin-bottom: 18pt; }
    .job-header { margin-bottom: 6pt; }
    .company-info { font-size: 10.5pt; color: #555555; margin-bottom: 4pt; }
    .education-item { margin-bottom: 12pt; }
    .skills-container { line-height: 1.8; }
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${styles}</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(content.contact.name)}</h1>
    <div class="contact">${contactParts.map(escapeHtml).join(' | ')}</div>
  </div>

  ${content.summary ? `<h2>Resumen Profesional</h2><p>${escapeHtml(content.summary)}</p>` : ''}

  ${content.experience.length > 0 ? `<h2>Experiencia Profesional</h2>${experienceHTML}` : ''}

  ${content.education.length > 0 ? `<h2>Formacion Academica</h2>${educationHTML}` : ''}

  ${content.skills.length > 0 ? `<h2>Competencias</h2><div class="skills-container"><p>${content.skills.map(escapeHtml).join(' • ')}</p></div>` : ''}
</body>
</html>`;
}

/**
 * Generate Minimal Template HTML
 *
 * Ultra-clean, whitespace-forward design:
 * - System sans-serif font stack (Inter / Segoe UI / system-ui)
 * - Monochrome palette: #1A1A1A headings, #333333 body
 * - No borders or decorative rules anywhere
 * - Large, lightweight name (font-weight 300, 22pt)
 * - Section headings same size as body, bold (no size hierarchy bump)
 * - Skills separated by " / " instead of bullets
 * - 10.5pt body, 0.7in padding
 */
export function generateMinimalTemplateHTML(content: AdaptedContent): string {
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
          ${escapeHtml(exp.company)} &nbsp;&middot;&nbsp; ${escapeHtml(exp.dates)}
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
      <p class="school-info">${escapeHtml(edu.school)} &nbsp;&middot;&nbsp; ${escapeHtml(edu.year)}</p>
    </div>
  `
    )
    .join('\n  ');

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Inter, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      color: #333333;
      line-height: 1.65;
      padding: 0.7in;
    }
    h1 {
      font-size: 22pt;
      font-weight: 300;
      color: #1A1A1A;
      margin-bottom: 5pt;
      letter-spacing: -0.01em;
    }
    h2 {
      font-size: 10.5pt;
      font-weight: bold;
      color: #1A1A1A;
      margin-top: 22pt;
      margin-bottom: 10pt;
    }
    h3 { font-size: 10.5pt; font-weight: bold; margin-bottom: 2pt; color: #1A1A1A; }
    p { margin-bottom: 8pt; line-height: 1.55; }
    ul { margin-left: 16pt; margin-bottom: 12pt; list-style-type: disc; }
    li { margin-bottom: 4pt; line-height: 1.55; }
    .header { margin-bottom: 28pt; }
    .contact { font-size: 9.5pt; margin-top: 6pt; color: #666666; }
    .experience-item { margin-bottom: 18pt; }
    .job-header { margin-bottom: 5pt; }
    .company-info { font-size: 10pt; color: #666666; margin-bottom: 6pt; }
    .education-item { margin-bottom: 12pt; }
    .school-info { font-size: 10pt; color: #666666; margin-top: 2pt; }
    .skills-container { line-height: 1.8; }
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${styles}</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(content.contact.name)}</h1>
    <div class="contact">${contactParts.map(escapeHtml).join('  |  ')}</div>
  </div>

  ${content.summary ? `<h2>Sobre mi</h2><p>${escapeHtml(content.summary)}</p>` : ''}

  ${content.experience.length > 0 ? `<h2>Experiencia</h2>${experienceHTML}` : ''}

  ${content.education.length > 0 ? `<h2>Educacion</h2>${educationHTML}` : ''}

  ${content.skills.length > 0 ? `<h2>Habilidades</h2><div class="skills-container"><p>${content.skills.map(escapeHtml).join(' / ')}</p></div>` : ''}
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
    case 'executive':
      return generateExecutiveTemplateHTML(content);
    case 'minimal':
      return generateMinimalTemplateHTML(content);
    default:
      throw new Error(`Invalid template: ${template}`);
  }
}

/**
 * Compact Template - Maximum Content in Minimal Space
 * Feature: F-006
 *
 * Design Specs:
 * - Font: Arial Narrow or similar, 10pt body, 12pt headings
 * - Colors: Black only
 * - Margins: 0.5" all sides
 * - Layout: Minimal whitespace, condensed sections
 */

import { AdaptedContent } from '@/lib/types';

interface CompactTemplateProps {
  content: AdaptedContent;
}

export default function CompactTemplate({ content }: CompactTemplateProps) {
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial Narrow', Arial, sans-serif;
      font-size: 10pt;
      color: #000000;
      line-height: 1.4;
      padding: 0.5in;
    }

    h1 {
      font-size: 16pt;
      margin-bottom: 4pt;
      font-weight: bold;
    }

    h2 {
      font-size: 12pt;
      margin-top: 12pt;
      margin-bottom: 6pt;
      font-weight: bold;
      border-bottom: 1px solid #000;
      padding-bottom: 2pt;
    }

    h3 {
      font-size: 11pt;
      margin-bottom: 2pt;
      font-weight: bold;
    }

    p {
      margin-bottom: 6pt;
      line-height: 1.4;
    }

    ul {
      margin-left: 18pt;
      margin-bottom: 8pt;
      list-style-type: disc;
    }

    li {
      margin-bottom: 2pt;
      line-height: 1.4;
    }

    .header {
      text-align: center;
      margin-bottom: 12pt;
      border-bottom: 2px solid #000;
      padding-bottom: 6pt;
    }

    .contact {
      font-size: 9pt;
      margin-top: 2pt;
    }

    .experience-item {
      margin-bottom: 10pt;
    }

    .job-header {
      margin-bottom: 4pt;
    }

    .job-title-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .company-info {
      font-size: 10pt;
      margin-bottom: 2pt;
    }

    .education-item {
      margin-bottom: 6pt;
    }

    .education-row {
      font-size: 10pt;
    }

    .skills-container {
      line-height: 1.6;
      font-size: 10pt;
    }

    .summary {
      font-size: 10pt;
      line-height: 1.4;
    }
  `;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        {/* Contact Header */}
        <div className="header">
          <h1>{content.contact.name}</h1>
          <div className="contact">
            {content.contact.email}
            {content.contact.phone && ` | ${content.contact.phone}`}
            {content.contact.linkedin && ` | ${content.contact.linkedin}`}
            {content.contact.location && ` | ${content.contact.location}`}
          </div>
        </div>

        {/* Professional Summary */}
        {content.summary && (
          <>
            <h2>Professional Summary</h2>
            <p className="summary">{content.summary}</p>
          </>
        )}

        {/* Work Experience */}
        {content.experience.length > 0 && (
          <>
            <h2>Work Experience</h2>
            {content.experience.map((exp, idx) => (
              <div key={idx} className="experience-item">
                <div className="job-header">
                  <h3>{exp.title}</h3>
                  <div className="company-info">
                    <strong>{exp.company}</strong> | {exp.dates}
                  </div>
                </div>
                <ul>
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {/* Education */}
        {content.education.length > 0 && (
          <>
            <h2>Education</h2>
            {content.education.map((edu, idx) => (
              <div key={idx} className="education-item">
                <div className="education-row">
                  <strong>{edu.degree}</strong> | {edu.school} | {edu.year}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Skills */}
        {content.skills.length > 0 && (
          <>
            <h2>Skills</h2>
            <div className="skills-container">
              <p>{content.skills.join(' • ')}</p>
            </div>
          </>
        )}
      </body>
    </html>
  );
}

/**
 * Modern Template - Contemporary Design with Subtle Color
 * Feature: F-006
 *
 * Design Specs:
 * - Font: Inter or Helvetica, 11pt body, 14pt headings
 * - Colors: Navy blue (#1E3A5F) for headings, black for body
 * - Margins: 0.6" all sides
 * - Layout: Name with subtle color bar accent
 */

import { AdaptedContent } from '@/lib/types';

interface ModernTemplateProps {
  content: AdaptedContent;
}

export default function ModernTemplate({ content }: ModernTemplateProps) {
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      color: #000000;
      line-height: 1.6;
      padding: 0.6in;
    }

    h1 {
      font-size: 20pt;
      margin-bottom: 4pt;
      font-weight: bold;
      color: #1E3A5F;
    }

    h2 {
      font-size: 14pt;
      margin-top: 18pt;
      margin-bottom: 10pt;
      font-weight: bold;
      color: #1E3A5F;
      padding-bottom: 4pt;
      border-bottom: 2px solid #1E3A5F;
    }

    h3 {
      font-size: 12pt;
      margin-bottom: 4pt;
      font-weight: bold;
      color: #1E3A5F;
    }

    p {
      margin-bottom: 8pt;
      line-height: 1.5;
    }

    ul {
      margin-left: 20pt;
      margin-bottom: 12pt;
      list-style-type: disc;
    }

    li {
      margin-bottom: 4pt;
      line-height: 1.5;
    }

    .header {
      margin-bottom: 20pt;
      border-bottom: 3px solid #1E3A5F;
      padding-bottom: 12pt;
    }

    .contact {
      font-size: 10pt;
      margin-top: 6pt;
      color: #333333;
    }

    .contact-item {
      display: inline;
      margin-right: 12pt;
    }

    .experience-item {
      margin-bottom: 16pt;
    }

    .job-header {
      margin-bottom: 6pt;
    }

    .company-info {
      font-size: 10.5pt;
      color: #555555;
      margin-bottom: 4pt;
    }

    .education-item {
      margin-bottom: 12pt;
    }

    .school-info {
      font-size: 10.5pt;
      color: #555555;
    }

    .skills-container {
      line-height: 1.8;
    }

    .summary {
      font-size: 11pt;
      line-height: 1.6;
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
            <span className="contact-item">{content.contact.email}</span>
            {content.contact.phone && (
              <span className="contact-item">{content.contact.phone}</span>
            )}
            {content.contact.linkedin && (
              <span className="contact-item">{content.contact.linkedin}</span>
            )}
            {content.contact.location && (
              <span className="contact-item">{content.contact.location}</span>
            )}
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
                <h3>{edu.degree}</h3>
                <div className="school-info">
                  {edu.school} | {edu.year}
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

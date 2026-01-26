/**
 * Clean Template - Traditional, Professional, ATS-Friendly
 * Feature: F-006
 *
 * Design Specs:
 * - Font: Georgia or Times New Roman, 11pt body, 14pt headings
 * - Colors: Pure black (#000000) text only
 * - Margins: 0.75" all sides
 * - Layout: Single column, horizontal lines between sections
 */

import { AdaptedContent } from '@/lib/types';

interface CleanTemplateProps {
  content: AdaptedContent;
}

export default function CleanTemplate({ content }: CleanTemplateProps) {
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      color: #000000;
      line-height: 1.6;
      padding: 0.75in;
    }

    h1 {
      font-size: 18pt;
      margin-bottom: 8pt;
      font-weight: bold;
    }

    h2 {
      font-size: 14pt;
      margin-top: 16pt;
      margin-bottom: 8pt;
      border-bottom: 1px solid #000;
      padding-bottom: 4pt;
      font-weight: bold;
    }

    h3 {
      font-size: 12pt;
      margin-bottom: 4pt;
      font-weight: bold;
    }

    p {
      margin-bottom: 8pt;
      line-height: 1.5;
    }

    ul {
      margin-left: 24pt;
      margin-bottom: 12pt;
      list-style-type: disc;
    }

    li {
      margin-bottom: 4pt;
      line-height: 1.5;
    }

    .header {
      text-align: center;
      margin-bottom: 20pt;
    }

    .contact {
      font-size: 10pt;
      margin-top: 4pt;
    }

    .experience-item {
      margin-bottom: 16pt;
    }

    .job-header {
      margin-bottom: 6pt;
    }

    .company-info {
      font-size: 11pt;
      margin-bottom: 2pt;
    }

    .education-item {
      margin-bottom: 10pt;
    }

    .skills-container {
      line-height: 1.8;
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
            <p>{content.summary}</p>
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
                <p>
                  {edu.school} | {edu.year}
                </p>
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

/**
 * AdaptedResumeView — full-screen view rendered once the 4-step CV
 * adaptation pipeline completes successfully.
 *
 * Layout (fixed top + scrollable body + fixed footer):
 *   1. ATS score banner   — fixed at the top, colour-coded by score tier
 *   2. Scrollable sections — Summary, Experience, Education, Skills (in that order)
 *      followed by an optional ATS suggestions card
 *   3. Footer actions     — "Guardar postulacion" and "Descargar PDF" buttons
 *
 * Each CV section uses <CopyableSection> so the user can copy any section
 * individually with a single click, leveraging the shared clipboard logic
 * and "Copiado" confirmation UX already implemented in that component.
 *
 * Text formatting for the clipboard is delegated to the pure utility
 * functions in utils/formatSectionText so this component stays free of
 * formatting concerns.
 */

import React, { useState } from 'react';
import {
  AdaptedResume,
  ATSScoreBreakdown,
  JobAnalysis,
} from '../api/mockmaster-client';
import CopyableSection from './CopyableSection';
import ATSScoreCard from './ATSScoreCard';
import TemplateSelectorInline from './TemplateSelectorInline';
import {
  formatSummary,
  formatExperience,
  formatEducation,
  formatSkills,
} from '../utils/formatSectionText';
import { usePDFDownload, PDFTemplate } from '../hooks/usePDFDownload';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AdaptedResumeViewProps {
  /** The full adapted resume returned by the adaptation pipeline */
  adaptedResume: AdaptedResume | null;
  /** Detailed ATS score breakdown returned by step 4 of the pipeline */
  atsBreakdown: ATSScoreBreakdown | null;
  /** Job analysis produced in step 2 — reserved for future integrations */
  jobAnalysis?: JobAnalysis | null;
  /** Called when the user clicks "Guardar postulacion" */
  onSaveApplication?: () => void;
  /** Called when the user clicks "Volver" (reserved for future back-nav) */
  onGoBack?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdaptedResumeView({
  adaptedResume,
  atsBreakdown,
  jobAnalysis,
  onSaveApplication,
  onGoBack,
}: AdaptedResumeViewProps) {
  // Derive the structured content
  const content = adaptedResume?.adapted_content;

  // PDF download state
  const pdfDownload = usePDFDownload();
  const [pdfTemplate, setPdfTemplate] = useState<PDFTemplate>('clean');

  // Derive the company name from the job analysis for the PDF filename
  const companyName = jobAnalysis?.analysis?.company_name ?? 'Empresa';

  // Pre-format clipboard text for each section using the pure utility functions.
  // Fallback to an empty string so CopyableSection never receives undefined.
  const summaryText = formatSummary(content?.summary ?? '');
  const experienceText = formatExperience(content?.experience ?? []);
  const educationText = formatEducation(content?.education ?? []);
  const skillsText = formatSkills(content?.skills ?? []);

  // Count how many sections came back empty from the adaptation pipeline.
  // Used to surface a warning banner when the adapted CV has significant gaps.
  const emptySectionCount = [
    !content?.summary,
    !content?.experience || content.experience.length === 0,
    !content?.education || content.education.length === 0,
    !content?.skills || content.skills.length === 0,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      {/* ------------------------------------------------------------------- */}
      {/* ATS score card — compact banner with collapsible breakdown          */}
      {/* ------------------------------------------------------------------- */}
      <ATSScoreCard
        atsBreakdown={atsBreakdown}
        fallbackScore={adaptedResume?.ats_score}
      />

      {/* ------------------------------------------------------------------- */}
      {/* Scrollable content area                                              */}
      {/* Section order per design spec: Summary → Experience → Education → Skills */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

        {/* Warning banner when multiple sections are empty */}
        {emptySectionCount >= 2 && (
          <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700" role="alert">
            La adaptacion tuvo datos incompletos en {emptySectionCount} secciones. Verifica que tu CV en MockMaster tenga toda la informacion.
          </div>
        )}

        {/* Resumen Profesional */}
        <CopyableSection title="Resumen Profesional" copyText={summaryText}>
          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
            {content?.summary ?? 'Sin datos.'}
          </p>
        </CopyableSection>

        {/* Experiencia */}
        <CopyableSection title="Experiencia" copyText={experienceText}>
          {content?.experience && content.experience.length > 0 ? (
            <div className="flex flex-col gap-3">
              {content.experience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-semibold text-slate-800">
                    {exp.title}{' '}
                    <span className="font-normal text-slate-500">en {exp.company}</span>
                  </p>
                  <p className="text-slate-400 mb-1">{exp.dates}</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {exp.bullets.map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Sin datos.</p>
          )}
        </CopyableSection>

        {/* Educacion */}
        <CopyableSection title="Educacion" copyText={educationText}>
          {content?.education && content.education.length > 0 ? (
            <div className="flex flex-col gap-1">
              {content.education.map((edu, idx) => (
                <p key={idx} className="text-xs text-slate-700">
                  <span className="font-semibold">{edu.degree}</span>
                  {' — '}
                  {edu.school}
                  {edu.year ? ` (${edu.year})` : ''}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Sin datos.</p>
          )}
        </CopyableSection>

        {/* Habilidades */}
        <CopyableSection title="Habilidades" copyText={skillsText}>
          {content?.skills && content.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {content.skills.map((skill, idx) => (
                <span
                  key={`${skill}-${idx}`}
                  className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Sin datos.</p>
          )}
        </CopyableSection>

      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Footer actions — fixed at the bottom of the view                    */}
      {/* ------------------------------------------------------------------- */}
      <div className="p-4 border-t border-slate-200 flex flex-col gap-3">
        <button
          className="btn-primary w-full"
          onClick={onSaveApplication}
        >
          Guardar postulacion
        </button>

        {/* PDF template selector + download button */}
        {adaptedResume && (
          <TemplateSelectorInline
            selectedTemplate={pdfTemplate}
            onSelectTemplate={setPdfTemplate}
            onDownload={() =>
              pdfDownload.download(adaptedResume, pdfTemplate, companyName)
            }
            downloading={pdfDownload.downloading}
            success={pdfDownload.success}
            error={pdfDownload.error}
          />
        )}

        {onGoBack && (
          <button className="btn-ghost w-full text-xs" onClick={onGoBack}>
            Volver al inicio
          </button>
        )}
      </div>
    </div>
  );
}

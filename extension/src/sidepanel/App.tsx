/**
 * MockMaster Sidepanel — Root Application Component
 *
 * Implements a simple state machine that controls which view the user sees.
 * Each SidebarState maps to a dedicated placeholder view component.
 *
 * State transitions (happy path):
 *   loading
 *     -> unauthenticated     (no valid token in storage)
 *     -> unsupported_page    (on a non-job-listing URL)
 *     -> job_extracted       (already extracted in this session)
 *   unauthenticated -> loading (after sign-in redirect)
 *   unsupported_page -> extracting (user navigated to a job page)
 *   extracting -> job_extracted | error
 *   job_extracted -> adapting
 *   adapting -> adapted | error
 *   adapted -> application_saved
 *   error -> extracting | job_extracted (retry)
 *
 * Track C will replace the placeholder views with real UI.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { SidebarState, ExtractedJobData } from '../shared/types';
import { MSG, STATE_LABELS, isJobListingUrl, API_BASE_URL } from '../shared/constants';
import { getAuthToken } from '../shared/storage';

// ---------------------------------------------------------------------------
// Placeholder view components
// Each one is a minimal card that shows the state name and a description.
// Track C will replace these with fully designed components.
// ---------------------------------------------------------------------------

interface ViewProps {
  onTransition?: (next: SidebarState) => void;
  jobData?: ExtractedJobData | null;
  errorMessage?: string;
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <div className="spinner w-10 h-10" />
      <p className="text-sm text-slate-500">{STATE_LABELS.loading}</p>
    </div>
  );
}

function UnauthenticatedView({ onTransition }: ViewProps) {
  const handleSignIn = () => {
    // Open the main web app in a new tab so the user can authenticate.
    // After login, the web app will set a cookie that we read on the next
    // CHECK_AUTH cycle.
    chrome.tabs.create({ url: `${API_BASE_URL}/login?next=/auth/extension-callback` });
    // Recheck auth after a short delay so the sidepanel responds quickly
    // once the user completes login and returns.
    setTimeout(() => onTransition?.('loading'), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6 text-center">
      {/* Logo placeholder */}
      <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center">
        <span className="text-white text-2xl font-bold">M</span>
      </div>

      <div>
        <h1 className="text-lg font-bold text-slate-800 mb-1">MockMaster</h1>
        <p className="text-sm text-slate-500">
          Adapta tu CV a cada oferta con IA, sin cambiar de pestana.
        </p>
      </div>

      <button className="btn-primary w-full" onClick={handleSignIn}>
        Iniciar sesion
      </button>

      <p className="text-xs text-slate-400">
        ¿No tenes cuenta?{' '}
        <button
          className="text-primary-600 hover:underline"
          onClick={() =>
            chrome.tabs.create({ url: `${API_BASE_URL}/signup` })
          }
        >
          Registrate gratis
        </button>
      </p>
    </div>
  );
}

function UnsupportedPageView({ onTransition }: ViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
        🔍
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          Navega a un aviso de empleo
        </h2>
        <p className="text-sm text-slate-500">
          Abre un aviso en LinkedIn o Indeed y MockMaster extraera la
          informacion automaticamente.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          className="btn-secondary text-xs"
          onClick={() =>
            chrome.tabs.create({ url: 'https://www.linkedin.com/jobs/' })
          }
        >
          Ir a LinkedIn Jobs
        </button>
        <button
          className="btn-secondary text-xs"
          onClick={() =>
            chrome.tabs.create({ url: 'https://www.indeed.com/' })
          }
        >
          Ir a Indeed
        </button>
      </div>
      {/* Dev helper: simulate a job page */}
      <button
        className="btn-ghost text-xs text-slate-400"
        onClick={() => onTransition?.('extracting')}
      >
        [DEV] Simular pagina de aviso
      </button>
    </div>
  );
}

function ExtractingView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="spinner w-10 h-10" />
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          Extrayendo aviso…
        </h2>
        <p className="text-sm text-slate-500">
          Leyendo la descripcion del trabajo desde la pagina.
        </p>
      </div>
    </div>
  );
}

function JobExtractedView({ jobData, onTransition }: ViewProps) {
  if (!jobData) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Sin datos del aviso. Vuelve a extraer.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-snug">
              {jobData.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {jobData.company}
              {jobData.location ? ` · ${jobData.location}` : ''}
            </p>
          </div>
          <span
            className={`badge shrink-0 ${
              jobData.source === 'linkedin' ? 'badge-info' : 'badge-warning'
            }`}
          >
            {jobData.source === 'linkedin' ? 'LinkedIn' : 'Indeed'}
          </span>
        </div>

        {jobData.modality && (
          <span className="badge badge-success mt-2">
            {jobData.modality === 'remote'
              ? 'Remoto'
              : jobData.modality === 'hybrid'
              ? 'Hibrido'
              : 'Presencial'}
          </span>
        )}
      </div>

      {/* Description preview */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-2">
          Descripcion
        </p>
        <p className="text-sm text-slate-700 line-clamp-6">
          {jobData.description || 'Sin descripcion disponible.'}
        </p>
      </div>

      {/* Action */}
      <div className="p-4 border-t border-slate-200">
        <button
          className="btn-primary w-full"
          onClick={() => onTransition?.('adapting')}
        >
          Adaptar mi CV con IA
        </button>
      </div>
    </div>
  );
}

function AdaptingView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="spinner w-10 h-10" />
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          Adaptando tu CV…
        </h2>
        <p className="text-sm text-slate-500">
          La IA esta personalizando tu CV para esta oferta. Esto puede
          tomar unos segundos.
        </p>
      </div>
    </div>
  );
}

function AdaptedView({ jobData, onTransition }: ViewProps) {
  const sections = [
    { label: 'Resumen Profesional', text: 'Placeholder: resumen adaptado aparecera aqui.' },
    { label: 'Experiencia', text: 'Placeholder: experiencia adaptada aparecera aqui.' },
    { label: 'Habilidades', text: 'Placeholder: habilidades adaptadas apareceran aqui.' },
    { label: 'Educacion', text: 'Placeholder: educacion aparecera aqui.' },
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.info(`[MockMaster] Copied: ${label}`);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* ATS score placeholder */}
      <div className="p-4 border-b border-slate-200 bg-green-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            Puntaje ATS
          </span>
          <span className="text-2xl font-bold text-secondary-600">—</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          El puntaje se calculara cuando se implemente Track C.
        </p>
      </div>

      {/* Sections with copy buttons */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {sections.map((section) => (
          <div key={section.label} className="card">
            <div className="section-header">
              <span className="section-title">{section.label}</span>
              <button
                className="copy-btn"
                onClick={() => handleCopy(section.text, section.label)}
              >
                Copiar
              </button>
            </div>
            <p className="text-xs text-slate-500">{section.text}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
        <button
          className="btn-primary w-full"
          onClick={() => onTransition?.('application_saved')}
        >
          Guardar postulacion
        </button>
        <button className="btn-ghost w-full text-xs" onClick={() => {}}>
          Descargar PDF
        </button>
      </div>
    </div>
  );
}

function ApplicationSavedView({ jobData, onTransition }: ViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
        ✓
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          ¡Postulacion guardada!
        </h2>
        <p className="text-sm text-slate-500">
          {jobData?.company
            ? `Tu postulacion a ${jobData.company} fue registrada en tu tracker.`
            : 'Tu postulacion fue registrada en tu tracker.'}
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <button
          className="btn-secondary w-full"
          onClick={() =>
            chrome.tabs.create({ url: `${API_BASE_URL}/applications` })
          }
        >
          Ver mis postulaciones
        </button>
        <button
          className="btn-ghost w-full"
          onClick={() => onTransition?.('unsupported_page')}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

function ErrorView({ errorMessage, onTransition }: ViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">
        !
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          Ocurrio un error
        </h2>
        {errorMessage && (
          <p className="text-xs text-red-600 mt-1 bg-red-50 rounded p-2 text-left">
            {errorMessage}
          </p>
        )}
        <p className="text-sm text-slate-500 mt-2">
          Podes intentar extraer el aviso nuevamente.
        </p>
      </div>
      <button
        className="btn-primary w-full"
        onClick={() => onTransition?.('extracting')}
      >
        Reintentar extraccion
      </button>
      <button
        className="btn-ghost w-full"
        onClick={() => onTransition?.('unsupported_page')}
      >
        Volver al inicio
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App — main state machine
// ---------------------------------------------------------------------------

export default function App() {
  const [state, setState] = useState<SidebarState>('loading');
  const [jobData, setJobData] = useState<ExtractedJobData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Trigger content script extraction via background (defined first so hooks below can reference it)
  const triggerExtraction = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: MSG.EXTRACT_JOB });

      if (!response?.success) {
        throw new Error(response?.error ?? 'Extraccion fallida');
      }

      setJobData(response.data as ExtractedJobData);
      setState('job_extracted');
    } catch (err) {
      console.error('[MockMaster App] extraction failed:', err);
      setErrorMessage(String(err));
      setState('error');
    }
  }, []);

  // Initialise: check auth and current tab URL
  useEffect(() => {
    async function init() {
      try {
        // 1. Check auth token
        const token = await getAuthToken();
        if (!token) {
          setState('unauthenticated');
          return;
        }

        // 2. Check current tab URL via background service worker
        const response = await chrome.runtime.sendMessage({ type: MSG.GET_TAB_URL });
        if (!response?.success) {
          setState('unsupported_page');
          return;
        }

        const { url } = response.data as { url: string };
        if (isJobListingUrl(url)) {
          setState('extracting');
          triggerExtraction();
        } else {
          setState('unsupported_page');
        }
      } catch (err) {
        console.error('[MockMaster App] init failed:', err);
        setState('error');
        setErrorMessage(String(err));
      }
    }

    init();
  }, [triggerExtraction]);

  // Listen for TAB_UPDATED and AUTH_CHANGED messages from the background service worker
  useEffect(() => {
    const handler = (message: { type: string; url?: string; isAuthenticated?: boolean }) => {
      if (message.type === MSG.AUTH_CHANGED) {
        if (message.isAuthenticated) {
          chrome.runtime.sendMessage({ type: MSG.GET_TAB_URL }).then((response: any) => {
            if (response?.success) {
              const url = response.data?.url ?? '';
              if (isJobListingUrl(url)) {
                setState('extracting');
                triggerExtraction();
              } else {
                setState('unsupported_page');
              }
            } else {
              setState('unsupported_page');
            }
          }).catch(() => {
            setState('unsupported_page');
          });
        } else {
          setState('unauthenticated');
        }
        return;
      }

      if (message.type !== MSG.TAB_UPDATED) return;

      const url = message.url ?? '';
      if (isJobListingUrl(url)) {
        setState('extracting');
        triggerExtraction();
      } else if (state !== 'loading' && state !== 'unauthenticated') {
        setState('unsupported_page');
      }
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [state, triggerExtraction]);

  // Allow child views to request a state transition
  const handleTransition = useCallback((next: SidebarState) => {
    if (next === 'loading') {
      // Re-run init to recheck auth
      setState('loading');
      setTimeout(() => {
        getAuthToken().then((token) => {
          setState(token ? 'unsupported_page' : 'unauthenticated');
        });
      }, 1000);
      return;
    }
    if (next === 'extracting') {
      setState('extracting');
      triggerExtraction();
      return;
    }
    setState(next);
  }, [triggerExtraction]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const viewProps: ViewProps = {
    onTransition: handleTransition,
    jobData,
    errorMessage,
  };

  const renderView = () => {
    switch (state) {
      case 'loading':          return <LoadingView />;
      case 'unauthenticated':  return <UnauthenticatedView {...viewProps} />;
      case 'unsupported_page': return <UnsupportedPageView {...viewProps} />;
      case 'extracting':       return <ExtractingView />;
      case 'job_extracted':    return <JobExtractedView {...viewProps} />;
      case 'adapting':         return <AdaptingView />;
      case 'adapted':          return <AdaptedView {...viewProps} />;
      case 'application_saved':return <ApplicationSavedView {...viewProps} />;
      case 'error':            return <ErrorView {...viewProps} />;
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      {/* Persistent header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-bold text-slate-800">MockMaster</span>
        </div>

        {/* State indicator (dev helper) */}
        <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
          {state}
        </span>
      </header>

      {/* Main content area — scrollable */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}

/**
 * MockMaster Sidepanel — Root Application Component
 *
 * Implements a state machine that controls which view the user sees.
 * Authentication and job-extraction logic are delegated to hooks:
 *   - useAuth()          — manages authentication state and token lifecycle
 *   - useJobExtraction() — manages DOM/Vision extraction and result caching
 *
 * State transitions (happy path):
 *   loading
 *     -> unauthenticated     (no valid token confirmed by service worker)
 *     -> unsupported_page    (authenticated but current URL is not a job page)
 *     -> extracting          (authenticated AND on a job listing URL)
 *   extracting -> job_extracted | error
 *   unauthenticated -> (auth change) -> unsupported_page | extracting
 *   unsupported_page -> extracting (user navigates to a job page)
 *   job_extracted -> adapting
 *   adapting -> adapted | error
 *   adapted -> application_saved
 *   error -> extracting | unsupported_page (retry / go back)
 *
 * Track C will replace the remaining placeholder views (AdaptedView, etc.)
 * with fully designed components.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { SidebarState, ExtractedJobData } from '../shared/types';
import { MSG, STATE_LABELS, isJobListingUrl, API_BASE_URL } from '../shared/constants';

// Custom hooks
import { useAuth } from './hooks/useAuth';
import { useJobExtraction } from './hooks/useJobExtraction';

// Extracted components (Track H)
import LoginScreen from './components/LoginScreen';
import JobExtractionView from './components/JobExtractionView';

// ---------------------------------------------------------------------------
// Inline view components (out of scope for Track H — kept as placeholders)
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

function AdaptingView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="spinner w-10 h-10" />
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          Adaptando tu CV...
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
          Postulacion guardada!
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
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * The URL of the currently active tab. Used to call extraction.extract()
   * when the auth state confirms the user is on a job listing page, and to
   * pass to JobExtractionView's onRetry handler.
   */
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const auth = useAuth();
  const extraction = useJobExtraction();

  // ---------------------------------------------------------------------------
  // Effect: sync extraction hook state -> sidebar state machine
  //
  // When extraction finishes (success or failure) we advance the state machine
  // from 'extracting' to 'job_extracted' or 'error'. This effect depends on
  // the extraction observable fields rather than the extract() Promise so that
  // the sidebar state remains in sync even if extraction is triggered from
  // multiple places (initial load vs. TAB_UPDATED).
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!extraction.extracting && extraction.jobData && state === 'extracting') {
      setState('job_extracted');
    }
    if (!extraction.extracting && extraction.error && state === 'extracting') {
      setErrorMessage(extraction.error);
      setState('error');
    }
  }, [extraction.extracting, extraction.jobData, extraction.error, state]);

  // ---------------------------------------------------------------------------
  // Effect: auth state drives the initial sidebar state
  //
  // Runs whenever auth loading/authenticated status changes.  When auth is
  // confirmed, we query the background for the current tab URL and decide
  // whether to auto-trigger extraction.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Wait for the initial CHECK_AUTH round-trip to complete
    if (auth.loading) return;

    if (!auth.authenticated) {
      setState('unauthenticated');
      return;
    }

    // Authenticated — determine what the current tab is
    chrome.runtime
      .sendMessage({ type: MSG.GET_TAB_URL })
      .then((response: { success: boolean; data?: { url: string } } | undefined) => {
        if (response?.success && response.data?.url) {
          const url = response.data.url;
          setCurrentUrl(url);

          if (isJobListingUrl(url)) {
            setState('extracting');
            extraction.extract(url);
          } else {
            setState('unsupported_page');
          }
        } else {
          setState('unsupported_page');
        }
      })
      .catch(() => {
        setState('unsupported_page');
      });
    // Intentionally omit `extraction.extract` from deps — it is stable (useCallback
    // with no deps), and including it would cause re-runs on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.authenticated]);

  // ---------------------------------------------------------------------------
  // Effect: listen for TAB_UPDATED and AUTH_CHANGED messages from the
  // background service worker.
  //
  // TAB_UPDATED fires when the user navigates to a new page in the active tab.
  // AUTH_CHANGED is handled by useAuth() directly, so we only need TAB_UPDATED
  // here.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handler = (message: {
      type: string;
      url?: string;
      isAuthenticated?: boolean;
    }) => {
      if (message.type !== MSG.TAB_UPDATED) return;

      const url = message.url ?? '';

      // Ignore tab updates while not authenticated — the auth effect will
      // handle the correct transition when auth resolves.
      if (!auth.authenticated) return;

      if (isJobListingUrl(url)) {
        setCurrentUrl(url);
        extraction.extract(url);
        setState('extracting');
      } else if (state !== 'loading' && state !== 'unauthenticated') {
        setState('unsupported_page');
      }
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [auth.authenticated, state, extraction]);

  // ---------------------------------------------------------------------------
  // handleTransition — allow child views to request a state transition
  // (used by legacy inline views that are out of scope for Track H)
  // ---------------------------------------------------------------------------

  const handleTransition = useCallback(
    (next: SidebarState) => {
      if (next === 'extracting') {
        setState('extracting');
        extraction.extract(currentUrl);
        return;
      }
      setState(next);
    },
    [extraction, currentUrl]
  );

  /**
   * Opens the sign-up page in a new tab.
   * Wired to LoginScreen's onSignupClick prop.
   */
  const handleSignup = useCallback(() => {
    chrome.tabs.create({ url: `${API_BASE_URL}/signup` });
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const viewProps: ViewProps = {
    onTransition: handleTransition,
    jobData: extraction.jobData,
    errorMessage,
  };

  const renderView = () => {
    switch (state) {
      case 'loading':
        return <LoadingView />;

      case 'unauthenticated':
        return (
          <LoginScreen
            onLoginClick={auth.openLogin}
            onSignupClick={handleSignup}
          />
        );

      case 'unsupported_page':
        return <UnsupportedPageView {...viewProps} />;

      // Both 'extracting' and 'job_extracted' render JobExtractionView —
      // the component's own sub-state logic handles the visual distinction.
      case 'extracting':
      case 'job_extracted':
        return (
          <JobExtractionView
            jobData={extraction.jobData}
            extracting={extraction.extracting}
            visionFallbackActive={extraction.visionFallbackActive}
            error={extraction.error}
            onAdapt={() => handleTransition('adapting')}
            onRetry={() => {
              setState('extracting');
              extraction.extract(currentUrl);
            }}
          />
        );

      case 'adapting':
        return <AdaptingView />;

      case 'adapted':
        return <AdaptedView {...viewProps} />;

      case 'application_saved':
        return <ApplicationSavedView {...viewProps} />;

      case 'error':
        return <ErrorView {...viewProps} />;
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

      {/* Main content area */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}

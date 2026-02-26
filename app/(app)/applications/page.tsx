'use client';

/**
 * Applications Tracker Page
 * Feature: Track W — Mis Postulaciones
 *
 * Displays all job applications for the authenticated user.
 * Data is fetched from /api/applications with cookie-based auth.
 * Supports filtering by status, sorting, client-side search, and pagination.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Application, ApplicationStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bgClass: string; textClass: string }> = {
  aplicada:   { label: 'Aplicada',   bgClass: 'bg-blue-100',  textClass: 'text-blue-700' },
  entrevista: { label: 'Entrevista', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
  oferta:     { label: 'Oferta',     bgClass: 'bg-green-100', textClass: 'text-green-700' },
  rechazada:  { label: 'Rechazada',  bgClass: 'bg-red-100',   textClass: 'text-red-700' },
  descartada: { label: 'Descartada', bgClass: 'bg-slate-100', textClass: 'text-slate-600' },
};

const SOURCE_CONFIG: Record<Application['source'], { label: string; color: string }> = {
  linkedin: { label: 'LinkedIn', color: 'text-[#0A66C2]' },
  indeed:   { label: 'Indeed',   color: 'text-[#2164f3]' },
  manual:   { label: 'Manual',   color: 'text-slate-500' },
};

const SORT_OPTIONS = [
  { value: 'applied_at',   label: 'Fecha de aplicacion' },
  { value: 'company_name', label: 'Empresa' },
  { value: 'status',       label: 'Estado' },
  { value: 'created_at',   label: 'Fecha de registro' },
];

const ITEMS_PER_PAGE = 20;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ApplicationsPage() {
  // Data state
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter / sort state
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<string>('applied_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Stats state (computed once on mount, then updated when main fetch refreshes)
  const [statusCounts, setStatusCounts] = useState<Record<ApplicationStatus, number>>({
    aplicada: 0,
    entrevista: 0,
    oferta: 0,
    rechazada: 0,
    descartada: 0,
  });
  const [totalAll, setTotalAll] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  /**
   * Fetches the paginated, filtered, sorted list of applications.
   * Dependencies: statusFilter, sortBy, sortOrder, currentPage
   */
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      let url = `/api/applications?sort=${sortBy}&order=${sortOrder}&limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? `Error ${response.status}`);
      }

      const data = await response.json();
      setApplications(data.applications ?? data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las postulaciones');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, sortOrder, currentPage]);

  // Trigger main fetch whenever its dependencies change
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  /**
   * Fetches all applications once on mount to compute status counts and totalAll.
   * Uses a large limit to capture everything (up to 100).
   */
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/applications?limit=100', { credentials: 'include' });
        if (!response.ok) return;

        const data = await response.json();
        const allApps: Application[] = data.applications ?? data.data ?? [];

        const counts: Record<ApplicationStatus, number> = {
          aplicada: 0,
          entrevista: 0,
          oferta: 0,
          rechazada: 0,
          descartada: 0,
        };
        for (const app of allApps) {
          if (app.status in counts) {
            counts[app.status]++;
          }
        }

        setStatusCounts(counts);
        setTotalAll(data.total ?? allApps.length);
      } catch {
        // Stats are non-critical; silently ignore errors
      }
    }

    fetchStats();
  }, []);

  // Reset to page 1 when the status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // ---------------------------------------------------------------------------
  // Client-side search (applies on top of server-filtered results)
  // ---------------------------------------------------------------------------

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (app) =>
        app.company_name.toLowerCase().includes(q) ||
        app.job_title.toLowerCase().includes(q)
    );
  }, [applications, searchQuery]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis Postulaciones</h1>
        <p className="text-slate-600 mt-1">
          {totalAll === 0 && !loading
            ? 'Rastrea todas tus postulaciones de trabajo'
            : `${totalAll} postulacion${totalAll !== 1 ? 'es' : ''} en total`}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats Bar                                                            */}
      {/* ------------------------------------------------------------------ */}
      {totalAll > 0 && !loading && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-700">Resumen:</span>
            {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(
              ([status, config]) => (
                <span
                  key={status}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgClass} ${config.textClass}`}
                >
                  {config.label}: {statusCounts[status]}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Filter Row                                                           */}
      {/* ------------------------------------------------------------------ */}
      {totalAll > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar empresa o puesto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700"
            >
              <option value="all">Todos los estados</option>
              {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(
                ([status, config]) => (
                  <option key={status} value={status}>
                    {config.label}
                  </option>
                )
              )}
            </select>

            {/* Sort field */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Sort order toggle */}
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              title={sortOrder === 'desc' ? 'Orden descendente' : 'Orden ascendente'}
              className="flex items-center justify-center w-10 h-10 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              {sortOrder === 'desc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Loading Skeleton                                                     */}
      {/* ------------------------------------------------------------------ */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Error State                                                          */}
      {/* ------------------------------------------------------------------ */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <button
            onClick={fetchApplications}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty State                                                          */}
      {/* ------------------------------------------------------------------ */}
      {totalAll === 0 && !loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No tienes postulaciones registradas
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Usa la extension de Chrome de MockMaster para guardar automaticamente tus postulaciones desde LinkedIn e Indeed.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Applications List                                                    */}
      {/* ------------------------------------------------------------------ */}
      {filteredApplications.length > 0 && !loading && (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-700">Empresa / Puesto</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Fuente</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">ATS Score</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Enlace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => {
                  const statusCfg = STATUS_CONFIG[app.status];
                  const sourceCfg = SOURCE_CONFIG[app.source];
                  const atsColor =
                    app.ats_score === null
                      ? ''
                      : app.ats_score >= 70
                      ? 'text-green-600'
                      : app.ats_score >= 50
                      ? 'text-amber-600'
                      : 'text-red-600';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      {/* Empresa / Puesto */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{app.company_name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{app.job_title}</p>
                      </td>

                      {/* Fuente */}
                      <td className="px-4 py-4">
                        <span className={`font-medium ${sourceCfg.color}`}>{sourceCfg.label}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.bgClass} ${statusCfg.textClass}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* ATS Score */}
                      <td className="px-4 py-4">
                        {app.ats_score !== null ? (
                          <span className={`font-semibold ${atsColor}`}>{app.ats_score}%</span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {formatDate(app.applied_at)}
                      </td>

                      {/* Enlace */}
                      <td className="px-4 py-4">
                        {app.job_url ? (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 font-medium text-xs underline underline-offset-2"
                          >
                            Ver oferta
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredApplications.map((app) => {
              const statusCfg = STATUS_CONFIG[app.status];
              const sourceCfg = SOURCE_CONFIG[app.source];
              const atsColor =
                app.ats_score === null
                  ? ''
                  : app.ats_score >= 70
                  ? 'text-green-600'
                  : app.ats_score >= 50
                  ? 'text-amber-600'
                  : 'text-red-600';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{app.company_name}</p>
                      <p className="text-slate-500 text-sm truncate">{app.job_title}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.bgClass} ${statusCfg.textClass}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`font-medium ${sourceCfg.color}`}>{sourceCfg.label}</span>

                    {app.ats_score !== null && (
                      <span className={`font-semibold ${atsColor}`}>ATS {app.ats_score}%</span>
                    )}

                    <span className="text-slate-500">{formatDate(app.applied_at)}</span>

                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
                      >
                        Ver oferta
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* No Results (search produced 0 results but there ARE applications)   */}
      {/* ------------------------------------------------------------------ */}
      {filteredApplications.length === 0 && totalAll > 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">
          <p className="text-slate-600 mb-4">No se encontraron postulaciones con ese criterio.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                           */}
      {/* ------------------------------------------------------------------ */}
      {total > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-3 py-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          <span className="text-sm text-slate-600">
            Pagina {currentPage} de {Math.ceil(total / ITEMS_PER_PAGE)}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(Math.ceil(total / ITEMS_PER_PAGE), p + 1))}
            disabled={currentPage >= Math.ceil(total / ITEMS_PER_PAGE)}
            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

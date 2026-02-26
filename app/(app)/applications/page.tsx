'use client';

/**
 * Applications Tracker Page
 * Feature: Track W — Mis Postulaciones
 *
 * Displays all job applications for the authenticated user.
 * Data is fetched from /api/applications with cookie-based auth.
 * Supports filtering by status, sorting, client-side search, and pagination.
 */

import { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
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

const MODALITY_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  remote:  { label: 'Remoto',     bgClass: 'bg-teal-100',   textClass: 'text-teal-700' },
  hybrid:  { label: 'Hibrido',    bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
  onsite:  { label: 'Presencial', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
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
// Helper components
// ---------------------------------------------------------------------------

/**
 * Chevron icon that rotates 180 degrees when the row is expanded.
 */
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Expanded detail panel shown below a row/card.
 * Displays location, salary, modality, notes, ATS score, template and adaptation info.
 */
function DetailPanel({ app }: { app: Application }) {
  const modalityCfg = app.modality ? MODALITY_CONFIG[app.modality] : null;

  const atsColor = app.ats_score === null ? 'text-slate-400'
    : app.ats_score >= 70 ? 'text-green-600'
    : app.ats_score >= 50 ? 'text-amber-600'
    : 'text-red-600';

  const atsBgColor = app.ats_score === null ? 'bg-slate-50'
    : app.ats_score >= 70 ? 'bg-green-50'
    : app.ats_score >= 50 ? 'bg-amber-50'
    : 'bg-red-50';

  return (
    <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left — Job Details */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalles del puesto</h4>

        {app.location && (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{app.location}</span>
          </div>
        )}

        {app.salary && (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{app.salary}</span>
          </div>
        )}

        {modalityCfg && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${modalityCfg.bgClass} ${modalityCfg.textClass}`}>
              {modalityCfg.label}
            </span>
          </div>
        )}

        <div className="pt-2">
          <p className="text-xs font-medium text-slate-500 mb-1">Notas</p>
          <p className="text-sm text-slate-600">{app.notes || 'Sin notas'}</p>
        </div>
      </div>

      {/* Right — Adaptation Details */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalles de adaptacion</h4>

        {app.ats_score !== null ? (
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${atsBgColor}`}>
            <span className={`text-2xl font-bold ${atsColor}`}>{app.ats_score}%</span>
            <span className="text-xs text-slate-500">ATS Score</span>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Sin puntaje ATS</p>
        )}

        {app.template_used && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Plantilla:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {app.template_used}
            </span>
          </div>
        )}

        {app.adapted_content ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Adaptado con IA</span>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No se uso adaptacion de CV</p>
        )}
      </div>
    </div>
  );
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

  // Inline-edit & delete state
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Expandable detail row state
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      setExpandedId(null);
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
   * Fetches all applications to compute status counts and totalAll.
   * Extracted as a useCallback so it can be called after mutations (status update, delete).
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/applications?limit=100', { credentials: 'include' });
      if (!response.ok) return;
      const data = await response.json();
      const allApps: Application[] = data.applications ?? data.data ?? [];
      const counts: Record<ApplicationStatus, number> = {
        aplicada: 0, entrevista: 0, oferta: 0, rechazada: 0, descartada: 0,
      };
      for (const app of allApps) {
        if (app.status in counts) { counts[app.status]++; }
      }
      setStatusCounts(counts);
      setTotalAll(data.total ?? allApps.length);
    } catch {
      // Stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  /**
   * Optimistically updates a single application's status in local state,
   * then persists via PATCH /api/applications/:id and refreshes stats.
   * Rolls back on error.
   */
  const handleStatusChange = useCallback(async (appId: string, newStatus: ApplicationStatus) => {
    const prevApp = applications.find((a) => a.id === appId);
    if (!prevApp || prevApp.status === newStatus) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    setUpdatingStatus(appId);

    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? `Error ${response.status}`);
      }
      await fetchStats();
      setToastMessage({ text: `Estado actualizado a "${STATUS_CONFIG[newStatus].label}"`, type: 'success' });
    } catch (err) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: prevApp.status } : a))
      );
      setToastMessage({
        text: err instanceof Error ? err.message : 'Error al actualizar el estado',
        type: 'error',
      });
    } finally {
      setUpdatingStatus(null);
    }
  }, [applications, fetchStats]);

  /**
   * Deletes an application via DELETE /api/applications/:id,
   * removes it from local state, and refreshes stats.
   */
  const handleDelete = useCallback(async (appId: string) => {
    setDeletingId(appId);
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? `Error ${response.status}`);
      }
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteConfirmId(null);
      await fetchStats();
      setToastMessage({ text: 'Postulacion eliminada', type: 'success' });
    } catch (err) {
      setToastMessage({
        text: err instanceof Error ? err.message : 'Error al eliminar la postulacion',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  }, [fetchStats]);

  /**
   * Toggles the expanded detail panel for a given application row.
   * Clicking the same row again collapses it.
   */
  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

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
              aria-label="Filtrar por estado"
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
              aria-label="Ordenar por"
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
                  <th className="text-center px-2 py-3 w-12">
                    <span className="sr-only">Acciones</span>
                  </th>
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
                    <Fragment key={app.id}>
                      <tr
                        onClick={() => toggleExpanded(app.id)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {/* Empresa / Puesto */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <ChevronIcon expanded={expandedId === app.id} />
                            <div>
                              <p className="font-semibold text-slate-900">{app.company_name}</p>
                              <p className="text-slate-500 text-xs mt-0.5">{app.job_title}</p>
                            </div>
                          </div>
                        </td>

                        {/* Fuente */}
                        <td className="px-4 py-4">
                          <span className={`font-medium ${sourceCfg.color}`}>{sourceCfg.label}</span>
                        </td>

                        {/* Estado — inline-editable select styled as a colored pill */}
                        <td className="px-4 py-4">
                          <div className="relative inline-flex items-center">
                            <select
                              value={app.status}
                              onChange={(e) => { e.stopPropagation(); handleStatusChange(app.id, e.target.value as ApplicationStatus); }}
                              onClick={(e) => e.stopPropagation()}
                              disabled={updatingStatus === app.id}
                              className={`appearance-none cursor-pointer px-2.5 py-1 pr-6 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary-500 ${statusCfg.bgClass} ${statusCfg.textClass} disabled:opacity-60`}
                            >
                              {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(
                                ([status, config]) => (
                                  <option key={status} value={status}>{config.label}</option>
                                )
                              )}
                            </select>
                            {updatingStatus === app.id ? (
                              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                              </div>
                            ) : (
                              <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
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
                              onClick={(e) => e.stopPropagation()}
                              className="text-primary-600 hover:text-primary-700 font-medium text-xs underline underline-offset-2"
                            >
                              Ver oferta
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">--</span>
                          )}
                        </td>

                        {/* Acciones — delete button */}
                        <td className="px-2 py-4 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(app.id); }}
                            disabled={deletingId === app.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Eliminar postulacion"
                          >
                            {deletingId === app.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Inline delete confirmation row */}
                      {deleteConfirmId === app.id && (
                        <tr className="bg-red-50">
                          <td colSpan={7} className="px-5 py-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-red-700">
                                Eliminar postulacion a <strong>{app.company_name}</strong>? Esta accion no se puede deshacer.
                              </p>
                              <div className="flex gap-2 flex-shrink-0 ml-4">
                                <button
                                  onClick={() => handleDelete(app.id)}
                                  disabled={deletingId === app.id}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-60"
                                >
                                  {deletingId === app.id ? 'Eliminando...' : 'Si, eliminar'}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded border border-slate-200 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Expandable detail row */}
                      {expandedId === app.id && (
                        <tr>
                          <td colSpan={7} className="px-5 py-4">
                            <DetailPanel app={app} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Clickable content area — triggers expand/collapse */}
                  <div onClick={() => toggleExpanded(app.id)} className="p-4 cursor-pointer">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronIcon expanded={expandedId === app.id} />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{app.company_name}</p>
                          <p className="text-slate-500 text-sm truncate">{app.job_title}</p>
                        </div>
                      </div>
                      {/* Status — inline-editable select styled as a colored pill */}
                      <div className="relative flex-shrink-0 inline-flex items-center">
                        <select
                          value={app.status}
                          onChange={(e) => { e.stopPropagation(); handleStatusChange(app.id, e.target.value as ApplicationStatus); }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={updatingStatus === app.id}
                          className={`appearance-none cursor-pointer px-2.5 py-1 pr-6 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary-500 ${statusCfg.bgClass} ${statusCfg.textClass} disabled:opacity-60`}
                        >
                          {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(
                            ([status, config]) => (
                              <option key={status} value={status}>{config.label}</option>
                            )
                          )}
                        </select>
                        {updatingStatus === app.id ? (
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                          </div>
                        ) : (
                          <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
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
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
                        >
                          Ver oferta
                        </a>
                      )}
                    </div>

                    {/* Delete button row */}
                    <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(app.id); }}
                        disabled={deletingId === app.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Eliminar postulacion"
                      >
                        {deletingId === app.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Inline delete confirmation */}
                  {deleteConfirmId === app.id && (
                    <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 mb-2">
                        Eliminar postulacion a <strong>{app.company_name}</strong>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(app.id)}
                          disabled={deletingId === app.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-60"
                        >
                          {deletingId === app.id ? 'Eliminando...' : 'Si, eliminar'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded border border-slate-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expandable detail panel */}
                  {expandedId === app.id && (
                    <div className="px-4 pb-4">
                      <DetailPanel app={app} />
                    </div>
                  )}
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

      {/* ------------------------------------------------------------------ */}
      {/* Toast Notification                                                   */}
      {/* ------------------------------------------------------------------ */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toastMessage.text}
        </div>
      )}
    </div>
  );
}

/**
 * Job Library Page
 * Feature: F-007
 *
 * Displays all saved job descriptions with search, filter, and quick actions.
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jobLibraryStorage } from '@/lib/job-library-storage';
import { jobAnalysisStorage } from '@/lib/job-storage';
import { SavedJobDescription, JobAnalysis } from '@/lib/types';

export default function JobLibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedJobDescription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load data on mount
  useEffect(() => {
    setMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setItems(jobLibraryStorage.getAll());
    setAllTags(jobLibraryStorage.getAllTags());
  };

  // Filter items based on search and tag
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedTag) {
      result = result.filter(item => item.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.analysis.job_title.toLowerCase().includes(q) ||
        item.analysis.company_name.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.includes(q))
      );
    }

    return result;
  }, [items, searchQuery, selectedTag]);

  const handleUseForAdaptation = (item: SavedJobDescription) => {
    // Create JobAnalysis object and save to current job storage
    const jobAnalysis: JobAnalysis = {
      raw_text: item.raw_text,
      text_hash: item.text_hash,
      analysis: item.analysis,
      analyzed_at: new Date().toISOString(),
    };

    // Save to current job analysis storage
    jobAnalysisStorage.save(jobAnalysis);

    // Mark as recently used
    jobLibraryStorage.markAsUsed(item.id);

    // Navigate to adapt-resume
    router.push('/adapt-resume');
  };

  const handleViewDetails = (item: SavedJobDescription) => {
    // Create JobAnalysis object and save to current job storage
    const jobAnalysis: JobAnalysis = {
      raw_text: item.raw_text,
      text_hash: item.text_hash,
      analysis: item.analysis,
      analyzed_at: new Date().toISOString(),
    };

    // Save to current job analysis storage
    jobAnalysisStorage.save(jobAnalysis);

    // Mark as recently used
    jobLibraryStorage.markAsUsed(item.id);

    // Navigate to analyze-job page to view details
    router.push('/analyze-job');
  };

  const handleDelete = (id: string) => {
    jobLibraryStorage.delete(id);
    setShowDeleteConfirm(null);
    refreshData();
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return formatDate(isoString);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Ofertas Guardadas</h1>
          <p className="text-slate-600 mt-1">
            {items.length === 0
              ? 'Guarda ofertas de trabajo para adaptar tu CV rapidamente'
              : `${items.length} oferta${items.length !== 1 ? 's' : ''} guardada${items.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => router.push('/analyze-job')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Oferta
        </button>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Tu biblioteca esta vacia
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Cuando analices una oferta de trabajo, podras guardarla aqui para
            reutilizarla en el futuro sin tener que pegarla de nuevo.
          </p>
          <button
            onClick={() => router.push('/analyze-job')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Analizar mi primera oferta
          </button>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre, puesto o empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Filtrar:</span>
                  <select
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="">Todas las etiquetas</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          {(searchQuery || selectedTag) && (
            <p className="text-sm text-slate-500">
              {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''}
              {selectedTag && ` en "${selectedTag}"`}
              {searchQuery && ` para "${searchQuery}"`}
            </p>
          )}

          {/* Job Cards Grid */}
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Company */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                        <p className="text-sm text-slate-600">
                          {item.analysis.job_title}
                          {item.analysis.company_name && ` en ${item.analysis.company_name}`}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Guardado {getTimeAgo(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Usado {getTimeAgo(item.last_used_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {item.analysis.seniority_level}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleUseForAdaptation(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Adaptar CV
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === item.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 mb-3">
                      Estas seguro de eliminar &quot;{item.name}&quot;? Esta accion no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                      >
                        Si, eliminar
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded border border-slate-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredItems.length === 0 && (searchQuery || selectedTag) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <p className="text-slate-600">
                No se encontraron ofertas que coincidan con tu busqueda.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                }}
                className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

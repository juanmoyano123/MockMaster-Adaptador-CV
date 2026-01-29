/**
 * Dashboard Page
 * Main landing page for authenticated users
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { resumeStorage } from '@/lib/storage';
import { jobAnalysisStorage } from '@/lib/job-storage';
import { adaptedResumeStorage } from '@/lib/adapted-resume-storage';
import { useEffect, useState } from 'react';

interface Stats {
  hasResume: boolean;
  hasJobAnalysis: boolean;
  hasAdaptedResume: boolean;
}

const quickActions = [
  {
    title: 'Subir CV',
    description: 'Carga tu curriculum para empezar',
    href: '/upload',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'primary',
  },
  {
    title: 'Analizar Oferta',
    description: 'Pega una descripcion de trabajo',
    href: '/analyze-job',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: 'secondary',
  },
  {
    title: 'Adaptar CV',
    description: 'Genera tu CV optimizado',
    href: '/adapt-resume',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    color: 'primary',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    hasResume: false,
    hasJobAnalysis: false,
    hasAdaptedResume: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for existing data
    const resume = resumeStorage.getResume();
    const jobAnalysis = jobAnalysisStorage.get();
    const adaptedResume = adaptedResumeStorage.get();

    setStats({
      hasResume: !!resume,
      hasJobAnalysis: !!jobAnalysis,
      hasAdaptedResume: !!adaptedResume,
    });
  }, []);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-slate-600 mt-1">
              Bienvenido a MockMaster. Que quieres hacer hoy?
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      {mounted && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Tu Progreso</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${stats.hasResume ? 'border-secondary-500 bg-secondary-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                {stats.hasResume ? (
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                )}
                <div>
                  <p className={`font-medium ${stats.hasResume ? 'text-secondary-700' : 'text-slate-600'}`}>
                    CV Subido
                  </p>
                  <p className="text-xs text-slate-500">
                    {stats.hasResume ? 'Completado' : 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${stats.hasJobAnalysis ? 'border-secondary-500 bg-secondary-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                {stats.hasJobAnalysis ? (
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                )}
                <div>
                  <p className={`font-medium ${stats.hasJobAnalysis ? 'text-secondary-700' : 'text-slate-600'}`}>
                    Oferta Analizada
                  </p>
                  <p className="text-xs text-slate-500">
                    {stats.hasJobAnalysis ? 'Completado' : 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${stats.hasAdaptedResume ? 'border-secondary-500 bg-secondary-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                {stats.hasAdaptedResume ? (
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                )}
                <div>
                  <p className={`font-medium ${stats.hasAdaptedResume ? 'text-secondary-700' : 'text-slate-600'}`}>
                    CV Adaptado
                  </p>
                  <p className="text-xs text-slate-500">
                    {stats.hasAdaptedResume ? 'Completado' : 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Acciones Rapidas</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                action.color === 'primary'
                  ? 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
                  : 'bg-secondary-50 text-secondary-600 group-hover:bg-secondary-100'
              }`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
              <p className="text-sm text-slate-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-primary-900 mb-1">Consejo del dia</h3>
            <p className="text-sm text-primary-700">
              Para mejores resultados, asegurate de que tu CV original tenga toda tu experiencia relevante.
              La IA reorganizara y reformulara tu contenido, pero no puede inventar experiencia que no tengas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

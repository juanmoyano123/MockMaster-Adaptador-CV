/**
 * Dashboard Page
 * Protected page - only accessible to authenticated users
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-900 text-lg">MockMaster</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-slate-900">{user.user_metadata?.name || 'User'}</p>
                <p className="text-slate-500 text-xs">{user.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">
            Bienvenido, {user.user_metadata?.name || 'Usuario'}!
          </h1>
          <p className="text-slate-600">
            Tu cuenta está activa y lista para usar.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/upload"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Subir CV</h3>
            <p className="text-sm text-slate-600">Sube tu currículum para comenzar</p>
          </Link>

          <Link
            href="/analyze-job"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Analizar Oferta</h3>
            <p className="text-sm text-slate-600">Analiza una descripción de trabajo</p>
          </Link>

          <Link
            href="/adapt-resume"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Adaptar CV</h3>
            <p className="text-sm text-slate-600">Adapta tu CV a una oferta específica</p>
          </Link>
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Información de la Cuenta</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-slate-600">Email:</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">ID de Usuario:</dt>
              <dd className="font-mono text-sm text-slate-900">{user.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Proveedor:</dt>
              <dd className="font-medium text-slate-900">
                {user.app_metadata?.provider === 'google' ? 'Google' : 'Email/Password'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Email Confirmado:</dt>
              <dd className="font-medium text-slate-900">
                {user.email_confirmed_at ? 'Sí' : 'No'}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}

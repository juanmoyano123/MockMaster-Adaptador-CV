/**
 * Auth Layout Component
 * Split-screen layout for authentication pages
 */

'use client';

import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-600/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-2xl font-semibold text-white">MockMaster</span>
          </Link>

          {/* Tagline */}
          <h1 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Adapta tu CV con IA.{' '}
            <span className="text-primary-400">Consigue más entrevistas.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            Optimiza tu currículum para cada oferta laboral y pasa los filtros ATS con facilidad.
          </p>

          {/* Illustration - Abstract CV cards */}
          <div className="mt-16 flex items-center gap-4">
            <div className="w-32 h-40 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3">
              <div className="h-3 w-16 bg-white/30 rounded mb-2" />
              <div className="h-2 w-full bg-white/20 rounded mb-1" />
              <div className="h-2 w-4/5 bg-white/20 rounded" />
            </div>
            <div className="text-white/60">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="w-32 h-40 bg-primary-500/20 backdrop-blur-sm rounded-lg border border-primary-400/30 p-3">
              <div className="h-3 w-16 bg-primary-400/50 rounded mb-2" />
              <div className="h-2 w-full bg-primary-400/30 rounded mb-1" />
              <div className="h-2 w-4/5 bg-secondary-400/40 rounded" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">MockMaster</span>
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">
                {title}
              </h2>
              <p className="text-slate-600">
                {subtitle}
              </p>
            </div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

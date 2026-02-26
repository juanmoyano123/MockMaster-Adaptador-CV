/**
 * Hero Section Component
 * Landing page hero with animated CV adaptation mockup
 */

'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8 animate-fadeIn">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full">
              <span className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary-700">
                Potenciado por Claude AI
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Postulate más inteligente.{' '}
                <span className="text-primary-600">
                  Adaptá tu CV con IA en segundos.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed">
                Adaptación con score ATS, biblioteca de ofertas, seguimiento de postulaciones y extensión Chrome para LinkedIn e Indeed. Todo en un solo lugar.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300 group"
              >
                Empezar gratis
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-300"
              >
                Ver cómo funciona
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>5 adaptaciones gratis</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Extensión incluida en Pro</span>
              </div>
            </div>
          </div>

          {/* Right: Animated ATS Score Mockup */}
          <div className="relative lg:pl-8 animate-fadeIn animation-delay-300">
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-200/50 to-secondary-200/50 blur-3xl opacity-60" />

              {/* Adapt CV Panel Mockup */}
              <div className="relative flex items-center justify-center">
                <div className="w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-cvAfter">
                  {/* Panel header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">Adapt CV</span>
                    </div>
                    <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 text-xs font-semibold rounded-full">
                      Optimizado ✓
                    </span>
                  </div>

                  {/* ATS Score */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Score ATS</span>
                      <span className="text-xs text-secondary-600 font-medium">Excelente</span>
                    </div>
                    <div className="flex items-end gap-3">
                      <span className="font-serif text-5xl font-bold text-primary-600 animate-bounce-slow">92</span>
                      <span className="text-slate-400 text-lg mb-1">/100</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 bg-slate-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  {/* Skills destacadas */}
                  <div className="mb-4">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Skills detectadas</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded">React</span>
                      <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded">TypeScript</span>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">Node.js</span>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">PostgreSQL</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">+4 más</span>
                    </div>
                  </div>

                  {/* Download button */}
                  <button className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar CV adaptado
                  </button>
                </div>

                {/* Floating extension badge */}
                <div className="absolute -top-4 -right-4 sm:-right-6 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-xl animate-cvBefore flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528A6 6 0 004 9.528V4z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M8 10a4 4 0 00-3.446 6.032l-1.261 1.26a1 1 0 101.414 1.415l1.261-1.261A4 4 0 108 10zm-2 4a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                  </svg>
                  Extensión Chrome
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cvBefore {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes cvAfter {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animate-cvBefore {
          animation: cvBefore 4s ease-in-out infinite;
        }
        .animate-cvAfter {
          animation: cvAfter 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

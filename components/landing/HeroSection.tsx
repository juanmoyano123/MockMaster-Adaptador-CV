/**
 * Hero Section Component
 * Landing page hero with animated CV transformation
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
                Potenciado por IA
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Adapta tu CV con IA.{' '}
                <span className="text-primary-600">
                  Consigue más entrevistas.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed">
                Optimiza tu currículum para cada oferta laboral en segundos.
                Nuestra IA analiza los requisitos y adapta tu experiencia para
                pasar los filtros ATS.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300 group"
              >
                Comenzar Gratis
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
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sin registro</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Privado</span>
              </div>
            </div>
          </div>

          {/* Right: Animated CV Transformation */}
          <div className="relative lg:pl-8 animate-fadeIn animation-delay-300">
            <div className="relative">
              {/* Glow effect behind cards */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-200/50 to-secondary-200/50 blur-3xl opacity-60" />

              {/* CV Cards Container */}
              <div className="relative flex items-center justify-center gap-4">
                {/* Before CV (Generic) */}
                <div className="w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-slate-200 p-4 transform -rotate-3 animate-cvBefore">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-2 w-full bg-slate-100 rounded" />
                    <div className="h-2 w-5/6 bg-slate-100 rounded" />
                    <div className="border-t border-slate-100 pt-3 mt-3">
                      <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                      <div className="h-2 w-full bg-slate-100 rounded" />
                      <div className="h-2 w-4/5 bg-slate-100 rounded mt-1" />
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-400">skill</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-400">skill</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-400">skill</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-slate-500 text-white text-xs rounded font-medium">
                    Antes
                  </div>
                </div>

                {/* AI Processing Arrow */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-primary-600">IA</span>
                </div>

                {/* After CV (Optimized) */}
                <div className="w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-primary-200 p-4 transform rotate-3 animate-cvAfter">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-primary-600 rounded" />
                    <div className="h-2 w-full bg-primary-100 rounded" />
                    <div className="h-2 w-5/6 bg-primary-100 rounded" />
                    <div className="border-t border-primary-100 pt-3 mt-3">
                      <div className="h-3 w-20 bg-primary-500 rounded mb-2" />
                      <div className="h-2 w-full bg-secondary-100 rounded" />
                      <div className="h-2 w-4/5 bg-secondary-100 rounded mt-1" />
                    </div>
                    <div className="border-t border-primary-100 pt-3">
                      <div className="h-3 w-16 bg-primary-500 rounded mb-2" />
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-secondary-100 rounded text-xs text-secondary-700 font-medium">React</span>
                        <span className="px-2 py-0.5 bg-secondary-100 rounded text-xs text-secondary-700 font-medium">Node</span>
                        <span className="px-2 py-0.5 bg-primary-100 rounded text-xs text-primary-700 font-medium">+3</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-secondary-500 text-white text-xs rounded font-medium">
                    Despues
                  </div>
                  {/* ATS Score Badge */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                    <span className="text-white font-bold text-sm">92%</span>
                  </div>
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
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          50% { transform: rotate(-3deg) translateY(-5px); }
        }
        @keyframes cvAfter {
          0%, 100% { transform: rotate(3deg) translateY(0); }
          50% { transform: rotate(3deg) translateY(-8px); }
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

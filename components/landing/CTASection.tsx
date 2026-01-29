/**
 * CTA Section Component
 * Final call-to-action section
 */

'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-600/20 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Content */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Listo para conseguir{' '}
          <span className="text-primary-400">más entrevistas</span>?
        </h2>
        <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
          No pierdas más oportunidades por un CV genérico. Adapta tu experiencia
          a cada oferta y destaca entre los candidatos.
        </p>

        {/* CTA Button */}
        <Link
          href="/upload"
          className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 group"
        >
          <span className="text-lg">Comenzar Gratis</span>
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

        {/* Sub-text */}
        <p className="text-slate-400 mt-6 text-sm">
          No requiere registro para empezar
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Datos seguros</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>Hecho con IA</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Open Source</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Extension Section Component
 * Dedicated section showcasing the Chrome extension
 */

'use client';

import Link from 'next/link';

export default function ExtensionSection() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full">
              <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <span className="text-sm font-medium text-slate-300">Extensión Chrome</span>
            </div>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Adaptá tu CV directo desde{' '}
              <span className="text-secondary-400">LinkedIn e Indeed</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-slate-300 leading-relaxed">
              La extensión de MockMaster extrae automáticamente la descripción del puesto, adapta tu CV con IA y guarda la postulación, todo sin salir de la página de la oferta.
            </p>

            {/* Bullets */}
            <ul className="space-y-3">
              {[
                'Extrae descripción del puesto automáticamente',
                'Adapta tu CV con un solo clic',
                'Guarda la postulación en tu tracker',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-secondary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="pt-2">
              <Link
                href="/billing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-lg transition-all duration-300 group"
              >
                Disponible en plan Pro
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Extension sidepanel mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-72 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
              {/* Panel header */}
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-semibold">MockMaster</span>
                </div>
                <span className="text-slate-500 text-xs">LinkedIn</span>
              </div>

              {/* Panel body */}
              <div className="p-4 space-y-4">
                {/* Job info */}
                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 text-xs uppercase tracking-wider">Puesto</label>
                    <div className="mt-1 px-3 py-2 bg-slate-700 rounded-lg text-white text-sm">
                      Senior Frontend Developer
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs uppercase tracking-wider">Empresa</label>
                    <div className="mt-1 px-3 py-2 bg-slate-700 rounded-lg text-white text-sm">
                      Acme Corp · Buenos Aires
                    </div>
                  </div>
                </div>

                {/* ATS Score */}
                <div className="px-3 py-3 bg-slate-700/50 rounded-xl border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs">Score ATS</span>
                    <span className="text-secondary-400 text-xs font-medium">Excelente</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-serif text-3xl font-bold text-white">87</span>
                    <span className="text-slate-500 text-sm mb-0.5">/100</span>
                  </div>
                  <div className="mt-2 bg-slate-600 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-1.5 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>

                {/* Action button */}
                <button className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Adaptar mi CV con IA
                </button>

                {/* Save button */}
                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Guardar oferta en biblioteca
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

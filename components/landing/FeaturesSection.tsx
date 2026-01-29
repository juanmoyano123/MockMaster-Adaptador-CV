/**
 * Features Section Component
 * Showcases key features and benefits
 */

'use client';

const features = [
  {
    title: 'IA Avanzada',
    description: 'Claude analiza y adapta tu experiencia profesional manteniendo la veracidad de tu información.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'primary',
  },
  {
    title: 'Score ATS',
    description: 'Conoce tu compatibilidad con sistemas de seguimiento de candidatos antes de aplicar.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'secondary',
  },
  {
    title: 'Edición Manual',
    description: 'Ajusta y personaliza el contenido adaptado antes de exportar tu documento final.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    color: 'primary',
  },
  {
    title: 'PDF Profesional',
    description: 'Elige entre 3 plantillas ATS-friendly diseñadas para impresionar a reclutadores.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'secondary',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-600 font-semibold text-sm uppercase tracking-wider">
            Características
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
            Por qué elegir MockMaster
          </h2>
          <p className="text-lg text-slate-600 mt-4">
            Herramientas profesionales para maximizar tus oportunidades laborales.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                feature.color === 'primary'
                  ? 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
                  : 'bg-secondary-50 text-secondary-600 group-hover:bg-secondary-100'
              }`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="font-semibold text-lg text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${
                feature.color === 'primary' ? 'bg-primary-500' : 'bg-secondary-500'
              }`} />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 py-12 border-y border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary-600">60s</div>
              <div className="text-slate-600 mt-1">Tiempo promedio</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-secondary-600">100%</div>
              <div className="text-slate-600 mt-1">Gratuito</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary-600">3</div>
              <div className="text-slate-600 mt-1">Plantillas PDF</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-secondary-600">ATS</div>
              <div className="text-slate-600 mt-1">Optimizado</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

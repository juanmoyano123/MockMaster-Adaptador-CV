/**
 * Features Section Component
 * Showcases the real product features
 */

'use client';

const features = [
  {
    title: 'Adaptación IA + Score ATS',
    description: 'Reescribí tu CV para cada oferta. Antes de descargar ves el score de compatibilidad ATS y las keywords optimizadas.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    color: 'primary',
  },
  {
    title: 'Extensión Chrome',
    description: 'Desde LinkedIn o Indeed, extraé la descripción del puesto con un clic y adaptá tu CV sin salir del sitio.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    color: 'secondary',
  },
  {
    title: 'Biblioteca de Ofertas',
    description: 'Guardá las ofertas que te interesan para adaptarlas cuando quieras, con búsqueda y filtros integrados.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    color: 'purple',
  },
  {
    title: 'Seguimiento de Postulaciones',
    description: 'Registrá cada postulación con estado (Aplicada, Entrevista, Oferta, Rechazada) y nunca pierdas el hilo.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'amber',
  },
];

const colorStyles: Record<string, { icon: string; hover: string; bar: string }> = {
  primary: {
    icon: 'bg-primary-50 text-primary-600 group-hover:bg-primary-100',
    hover: 'hover:border-primary-200',
    bar: 'bg-primary-500',
  },
  secondary: {
    icon: 'bg-secondary-50 text-secondary-600 group-hover:bg-secondary-100',
    hover: 'hover:border-secondary-200',
    bar: 'bg-secondary-500',
  },
  purple: {
    icon: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    hover: 'hover:border-purple-200',
    bar: 'bg-purple-500',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    hover: 'hover:border-amber-200',
    bar: 'bg-amber-500',
  },
};

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
            Todas las herramientas que necesitás para postularte mejor, en un solo lugar.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const styles = colorStyles[feature.color];
            return (
              <div
                key={feature.title}
                className={`group relative bg-white rounded-xl p-6 border border-slate-100 ${styles.hover} hover:shadow-lg transition-all duration-300`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${styles.icon}`}>
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
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${styles.bar}`} />
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-20 py-12 border-y border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary-600">60s</div>
              <div className="text-slate-600 mt-1">Tiempo de adaptación</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-secondary-600">100% IA</div>
              <div className="text-slate-600 mt-1">Generado por Claude AI</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-purple-600">4</div>
              <div className="text-slate-600 mt-1">Estados de seguimiento</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-amber-600">LinkedIn &amp; Indeed</div>
              <div className="text-slate-600 mt-1">Soportados por la extensión</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

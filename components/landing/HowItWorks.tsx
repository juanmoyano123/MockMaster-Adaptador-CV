/**
 * How It Works Section Component
 * 3-step process explanation
 */

'use client';

const steps = [
  {
    number: '01',
    title: 'Sube tu CV',
    description: 'Carga tu currículum actual en formato PDF, DOCX o simplemente pega el texto.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'primary',
  },
  {
    number: '02',
    title: 'Pega la oferta',
    description: 'Copia y pega la descripción del trabajo al que quieres aplicar.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: 'secondary',
  },
  {
    number: '03',
    title: 'Descarga optimizado',
    description: 'Obtén tu CV adaptado con keywords relevantes y formato ATS-friendly.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    color: 'primary',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
            Proceso Simple
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
            Cómo Funciona
          </h2>
          <p className="text-lg text-slate-600 mt-4">
            En tres simples pasos, transforma tu CV genérico en uno optimizado para cada oportunidad laboral.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line (hidden on mobile, last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-slate-200">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-300 transform rotate-45" />
                </div>
              )}

              {/* Card */}
              <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 h-full">
                {/* Step number */}
                <div className="absolute -top-4 left-8">
                  <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${
                    step.color === 'primary'
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-600 text-white'
                  }`}>
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                  step.color === 'primary'
                    ? 'bg-primary-50 text-primary-600'
                    : 'bg-secondary-50 text-secondary-600'
                }`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-500 mb-4">
            Todo el proceso toma menos de 60 segundos
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Rápido, seguro y privado</span>
          </div>
        </div>
      </div>
    </section>
  );
}

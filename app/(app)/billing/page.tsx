/**
 * Billing Page
 * Subscription management (placeholder for F-009)
 */

'use client';

export default function BillingPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-600 mt-1">Administra tu suscripcion</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                Plan Actual
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Plan Gratuito</h2>
              <p className="text-slate-600 mt-1">Funcionalidades basicas para empezar</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">$0</p>
              <p className="text-sm text-slate-500">/mes</p>
            </div>
          </div>

          {/* Features included */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">Incluye:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Subir y parsear CV ilimitados
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Analisis de ofertas laborales
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Adaptacion de CV con IA
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Score ATS con desglose
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Exportar a PDF (3 plantillas)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pro Plan Teaser */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
              Proximamente
            </span>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Plan Pro</h2>
              <p className="text-primary-100 mt-1">Para profesionales que buscan mas</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">$19</p>
              <p className="text-sm text-primary-200">/mes</p>
            </div>
          </div>

          {/* Pro Features */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-white/90">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Todo lo del plan gratuito</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Historial de adaptaciones ilimitado</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Multiples CVs guardados en la nube</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Plantillas premium de PDF</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Soporte prioritario</span>
            </div>
          </div>

          {/* CTA */}
          <button
            disabled
            className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors cursor-not-allowed"
          >
            Proximamente - Notificarme
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Preguntas frecuentes</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Por que es gratis?</p>
            <p className="text-sm text-slate-600 mt-1">
              MockMaster esta en fase beta. Queremos que pruebes todas las funcionalidades
              antes de lanzar nuestro plan Pro.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Mis datos estan seguros?</p>
            <p className="text-sm text-slate-600 mt-1">
              Tus CVs se almacenan localmente en tu navegador. No enviamos informacion
              personal a servidores externos excepto para el procesamiento de IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

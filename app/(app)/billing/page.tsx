/**
 * Billing Page
 * Feature: F-009
 *
 * Subscription management with MercadoPago integration
 */

'use client';

import { useState, useEffect } from 'react';
import { PLANS, TRIAL_DAYS } from '@/lib/subscription-config';
import UpgradeModal from '@/components/UpgradeModal';

interface SubscriptionData {
  tier: 'free' | 'pro';
  status: string;
  plan: {
    name: string;
    price: number;
    currency: string;
    features: string[];
  };
  usage: {
    adaptations_used: number;
    adaptations_limit: number;
    can_adapt: boolean;
    period_start: string;
  };
  subscription: {
    current_period_end: string | null;
    trial_ends_at: string | null;
  } | null;
}

export default function BillingPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/status');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Estas seguro que quieres cancelar tu suscripcion? Tendras acceso hasta el fin del periodo actual.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Suscripcion cancelada exitosamente');
        fetchSubscription();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al cancelar');
      }
    } catch (error) {
      alert('Error al cancelar suscripcion');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPro = data?.tier === 'pro';
  const isTrialing = data?.status === 'trialing';
  const isCancelled = data?.status === 'cancelled';

  // Debug: remove after testing
  console.log('Billing Debug:', { isPro, isCancelled, shouldShowUpgrade: !isPro || isCancelled });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-600 mt-1">Administra tu suscripcion</p>
      </div>

      {/* Current Plan */}
      <div className={`rounded-xl shadow-sm border overflow-hidden ${isPro ? 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200' : 'bg-white border-slate-200'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${isPro ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'}`}>
                Plan Actual
              </span>
              {isPro && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">
                  PRO
                </span>
              )}
              {isTrialing && (
                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Periodo de prueba
                </span>
              )}
              {isCancelled && (
                <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  Cancelado
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {data?.plan.name || 'Plan Gratuito'}
              </h2>
              <p className="text-slate-600 mt-1">
                {isPro ? 'Acceso completo a todas las funcionalidades' : 'Funcionalidades basicas para empezar'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">${data?.plan.price || 0}</p>
              <p className="text-sm text-slate-500">/{data?.plan.currency || 'ARS'}/mes</p>
            </div>
          </div>

          {/* Usage for Free users */}
          {!isPro && data?.usage && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Uso este mes</span>
                <span className="text-sm text-slate-600">
                  {data.usage.adaptations_used}/{data.usage.adaptations_limit} adaptaciones
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${data.usage.can_adapt ? 'bg-blue-500' : 'bg-red-500'}`}
                  style={{
                    width: `${Math.min((data.usage.adaptations_used / data.usage.adaptations_limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Pro period info */}
          {isPro && data?.subscription?.current_period_end && (
            <div className="mt-6 pt-6 border-t border-primary-200">
              <p className="text-sm text-slate-600">
                {isCancelled ? 'Acceso hasta: ' : 'Proxima facturacion: '}
                <span className="font-medium">
                  {new Date(data.subscription.current_period_end).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          )}

          {/* Features included */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">Incluye:</p>
            <ul className="space-y-2">
              {(data?.plan.features || PLANS.free.features).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Cancel button for Pro users */}
          {isPro && !isCancelled && (
            <div className="mt-6 pt-6 border-t border-primary-200">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelando...' : 'Cancelar suscripcion'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade to Pro (show for free users OR cancelled pro users) */}
      {(!isPro || isCancelled) && (
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                Recomendado
              </span>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Plan Pro</h2>
                <p className="text-primary-100 mt-1">Adaptaciones ilimitadas para profesionales</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">${PLANS.pro.price}</p>
                <p className="text-sm text-primary-200">/{PLANS.pro.currency}/mes</p>
              </div>
            </div>

            {/* Pro Features */}
            <div className="space-y-2 mb-6">
              {PLANS.pro.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/90">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trial info - only show for users who haven't subscribed before */}
            {!isCancelled && (
              <p className="text-sm text-white/80 mb-4">
                Prueba gratis por {TRIAL_DAYS} dias. Sin compromiso.
              </p>
            )}

            {/* CTA */}
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              {isCancelled ? 'Reactivar suscripcion' : 'Comenzar prueba gratis'}
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Preguntas frecuentes</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Como funciona el periodo de prueba?</p>
            <p className="text-sm text-slate-600 mt-1">
              Tendras acceso completo a todas las funcionalidades Pro por {TRIAL_DAYS} dias gratis.
              Si no cancelas antes, se cobrara automaticamente.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Puedo cancelar cuando quiera?</p>
            <p className="text-sm text-slate-600 mt-1">
              Si, puedes cancelar tu suscripcion en cualquier momento. Mantendras el acceso
              hasta el fin del periodo pagado.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Que metodos de pago aceptan?</p>
            <p className="text-sm text-slate-600 mt-1">
              Aceptamos todos los metodos de pago disponibles en MercadoPago: tarjetas de
              credito, debito, transferencia bancaria, y mas.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}

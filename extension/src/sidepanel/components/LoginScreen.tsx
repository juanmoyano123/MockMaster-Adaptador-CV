/**
 * LoginScreen — presentational component for the unauthenticated state.
 *
 * Purely presentational: receives callbacks via props and does NOT call any
 * Chrome APIs or access auth state directly. All side effects live in the
 * parent (App.tsx) which wires up useAuth().
 */

import React from 'react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LoginScreenProps {
  /** Called when the user clicks "Iniciar sesion" */
  onLoginClick: () => void;
  /** Called when the user clicks the "Registrate" link */
  onSignupClick: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LoginScreen({ onLoginClick, onSignupClick }: LoginScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6 text-center">
      {/* Brand logo mark */}
      <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center">
        <span className="text-white text-2xl font-bold">M</span>
      </div>

      {/* Headline + subtitle */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 mb-1">MockMaster</h1>
        <p className="text-sm text-slate-500">
          Inicia sesion para usar la extension
        </p>
      </div>

      {/* Primary CTA */}
      <button className="btn-primary w-full" onClick={onLoginClick}>
        Iniciar sesion
      </button>

      {/* Sign-up link */}
      <p className="text-xs text-slate-400">
        No tenes cuenta?{' '}
        <button
          className="text-primary-600 hover:underline"
          onClick={onSignupClick}
        >
          Registrate gratis
        </button>
      </p>
    </div>
  );
}

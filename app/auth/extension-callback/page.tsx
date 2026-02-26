/**
 * Extension Auth Callback
 *
 * This page is opened by the Chrome Extension after the user logs in.
 * It reads the Supabase session from the browser client and posts the
 * access token back to the extension via a custom message protocol.
 *
 * Flow:
 * 1. Extension opens this page in a new tab
 * 2. Page loads and checks for an active Supabase session
 * 3. If authenticated, broadcasts the token via BroadcastChannel + window.postMessage
 * 4. The extension's content script (injected on this page) picks it up
 * 5. Page auto-closes after a short delay
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ExtensionCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando sesion...');

  useEffect(() => {
    async function sendTokenToExtension() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setStatus('error');
        setMessage('No hay sesion activa. Inicia sesion primero.');
        return;
      }

      const tokenPayload = {
        type: 'MOCKMASTER_AUTH_TOKEN',
        token: session.access_token,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        },
      };

      // Method 1: Post message repeatedly to handle content script loading delay.
      // The auth-relay content script may not be injected yet when the first
      // postMessage fires, so we retry every 500ms for 5 seconds.
      for (let i = 0; i < 10; i++) {
        setTimeout(() => window.postMessage(tokenPayload, '*'), i * 500);
      }

      // Method 2: Store in a DOM element the extension can poll
      const tokenEl = document.getElementById('mockmaster-token');
      if (tokenEl) {
        tokenEl.dataset.token = session.access_token;
        tokenEl.dataset.user = JSON.stringify(tokenPayload.user);
      }

      setStatus('success');
      setMessage('Sesion sincronizada! Podes cerrar esta pestana.');

      // Auto-close after 6 seconds (give content script time to relay)
      setTimeout(() => {
        window.close();
      }, 6000);
    }

    sendTokenToExtension();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">M</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">MockMaster Extension</h1>

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-green-600">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-600">
            <p className="font-medium">{message}</p>
            <a href="/login" className="text-primary-600 hover:underline mt-2 inline-block">
              Ir al login
            </a>
          </div>
        )}

        <div id="mockmaster-token" className="hidden" />
      </div>
    </div>
  );
}

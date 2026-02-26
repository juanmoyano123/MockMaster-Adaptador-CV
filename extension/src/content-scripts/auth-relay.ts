/**
 * Auth Relay Content Script
 *
 * Injected on the MockMaster web app's extension-callback page.
 * Listens for the auth token posted by the page and relays it
 * to the extension's background service worker via chrome.runtime.sendMessage.
 *
 * Uses a flag to ensure we only relay ONCE even though the callback page
 * posts the token multiple times (to handle timing issues).
 */

import { MSG } from '../shared/constants';

let relayed = false;

function relayToken(token: string, user: unknown): void {
  if (relayed) return;
  relayed = true;

  console.log('[MockMaster auth-relay] Relaying token to background...');

  chrome.runtime.sendMessage({
    type: MSG.AUTH_TOKEN_RECEIVED,
    data: { token, user },
  }).then(() => {
    console.log('[MockMaster auth-relay] Token relayed successfully');
  }).catch((err) => {
    console.error('[MockMaster auth-relay] Failed to relay token:', err);
    relayed = false; // Allow retry on failure
  });
}

// Method 1: Listen for postMessage from the page
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type !== 'MOCKMASTER_AUTH_TOKEN') return;

  const { token, user } = event.data;
  if (!token) return;

  relayToken(token, user);
});

// Method 2: Poll the DOM element for the token (fallback)
const pollInterval = setInterval(() => {
  const tokenEl = document.getElementById('mockmaster-token');
  if (tokenEl?.dataset.token) {
    clearInterval(pollInterval);

    let user = null;
    try {
      user = JSON.parse(tokenEl.dataset.user || 'null');
    } catch { /* ignore */ }

    relayToken(tokenEl.dataset.token, user);
  }
}, 500);

// Stop polling after 15 seconds
setTimeout(() => clearInterval(pollInterval), 15000);

console.log('[MockMaster auth-relay] Content script loaded on:', window.location.href);

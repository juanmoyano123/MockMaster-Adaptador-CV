/**
 * Sidepanel React entry point.
 *
 * This file bootstraps the React application inside the Chrome side panel.
 * Keep it minimal — all real logic lives in App.tsx and below.
 *
 * Notes on the extension rendering context:
 *   - The HTML is loaded from extension/dist/sidepanel/index.html.
 *   - There is no server-side rendering; this is a pure client-side React app.
 *   - Chrome's side panel is a real browser tab context (not a sandboxed popup),
 *     so all Web APIs (fetch, localStorage, etc.) are available.
 *   - The panel width is fixed at ~400px by Chrome's UI chrome.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Load Tailwind + custom global styles
import './styles/globals.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    '[MockMaster] Could not find #root element. Check sidepanel/index.html.'
  );
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

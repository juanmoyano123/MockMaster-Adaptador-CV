/**
 * MockMaster Chrome Extension — Background Service Worker
 *
 * Responsibilities:
 *   1. Open the side panel when the action button is clicked.
 *   2. Route messages between the sidepanel and content scripts.
 *   3. Detect when the user navigates to / away from a job listing page.
 *   4. Handle screenshot capture (requires activeTab permission).
 *   5. Relay auth-check requests: sync Supabase cookie -> storage -> sidepanel.
 *   6. Listen for cookie changes on the MockMaster domain to keep auth fresh.
 *   7. Periodically re-sync auth state via a chrome.alarms alarm.
 *
 * Chrome MV3 service workers are short-lived: they can be killed at any time
 * between events.  Do NOT rely on module-level mutable variables to store
 * long-lived state — use chrome.storage.local instead.
 */

import { isJobListingUrl, detectJobSource, MSG, API_BASE_URL, STORAGE_KEYS } from '../shared/constants';
import { ExtensionMessage, MessageResponse, StoredAuthToken } from '../shared/types';
import { syncAuthState } from './auth';

// ---------------------------------------------------------------------------
// Side panel behaviour
// ---------------------------------------------------------------------------

/**
 * Open the side panel automatically every time the action icon is clicked.
 * This replaces the old popup; the panel stays open while the user browses.
 */
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err: unknown) => {
    console.error('[MockMaster SW] setPanelBehavior failed:', err);
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Broadcast a TAB_UPDATED message to the sidepanel (if it is open).
 * The sidepanel uses this to switch between states (unsupported_page,
 * extracting, etc.) without the user having to manually refresh.
 *
 * Errors are silently swallowed: Chrome throws "Receiving end does not exist"
 * whenever sendMessage is called and no listener is registered (e.g. the
 * sidepanel is not open).  That is expected behaviour — not a bug.
 */
function broadcastTabUpdated(url: string, tabId: number): void {
  const isSupported = isJobListingUrl(url);
  const source = detectJobSource(url);

  console.debug('[MockMaster SW] broadcasting TAB_UPDATED:', { tabId, url, isSupported, source });

  chrome.runtime
    .sendMessage({
      type: MSG.TAB_UPDATED,
      url,
      tabId,
      isSupported,
      source,
    } satisfies ExtensionMessage)
    .catch(() => {
      // Sidepanel may not be open — swallow the "receiving end does not exist" error
    });
}

// ---------------------------------------------------------------------------
// Message handler helpers (each is async so it can use await)
// ---------------------------------------------------------------------------

/**
 * Forward an EXTRACT_JOB message to the content script running in the
 * currently active tab and relay its response back to the caller.
 */
async function handleExtractJob(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      sendResponse({ success: false, error: 'No active tab found' });
      return;
    }

    // chrome.tabs.sendMessage throws if the content script is not injected yet
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: MSG.EXTRACT_JOB,
    } satisfies ExtensionMessage);

    sendResponse(response);
  } catch (error: unknown) {
    sendResponse({ success: false, error: String(error) });
  }
}

/**
 * Capture the currently visible tab as a JPEG (quality 80) and return the
 * data URL to the caller.  Requires the activeTab permission in manifest.json.
 */
async function handleCaptureScreenshot(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    // captureVisibleTab requires the windowId of the window containing the
    // active tab.  Passing `null` (cast to any) captures the current window.
    const dataUrl = await chrome.tabs.captureVisibleTab(
      null as unknown as number,
      { format: 'jpeg', quality: 80 }
    );

    sendResponse({ success: true, data: { dataUrl } });
  } catch (error: unknown) {
    sendResponse({ success: false, error: String(error) });
  }
}

/**
 * Returns the current auth state to the sidepanel.
 *
 * Checks chrome.storage.local first (populated by AUTH_TOKEN_RECEIVED from
 * the token-relay flow).  Only falls back to the cookie-based syncAuthState()
 * when no stored token exists — and even then, it never wipes a valid relay
 * token.
 */
async function handleCheckAuth(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    // 1. Check if a token already exists in storage (from auth relay)
    const stored = await chrome.storage.local.get([STORAGE_KEYS.authToken, 'auth_user']);
    const storedToken = stored[STORAGE_KEYS.authToken] as StoredAuthToken | undefined;

    if (storedToken?.access_token) {
      // Token exists — check it hasn't expired
      const isExpired = storedToken.expires_at - Date.now() < 60_000;
      if (!isExpired) {
        sendResponse({
          success: true,
          data: {
            authenticated: true,
            token: storedToken.access_token,
            user: stored.auth_user ?? null,
          },
        });
        return;
      }
    }

    // 2. No valid stored token — try the cookie-based sync as fallback
    const authenticated = await syncAuthState();
    const result = await chrome.storage.local.get([STORAGE_KEYS.authToken, 'auth_user']);
    const tokenAfterSync = result[STORAGE_KEYS.authToken] as StoredAuthToken | undefined;

    sendResponse({
      success: true,
      data: {
        authenticated,
        token: tokenAfterSync?.access_token ?? null,
        user: result.auth_user ?? null,
      },
    });
  } catch (error: unknown) {
    sendResponse({ success: false, error: String(error) });
  }
}

/**
 * Return the URL and title of the currently active tab.
 * The sidepanel calls this on startup to decide which state to render.
 */
async function handleGetTabUrl(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    sendResponse({
      success: true,
      data: {
        url: tab?.url ?? '',
        title: tab?.title ?? '',
        tabId: tab?.id ?? null,
      },
    });
  } catch (error: unknown) {
    sendResponse({ success: false, error: String(error) });
  }
}

// ---------------------------------------------------------------------------
// Message routing
// ---------------------------------------------------------------------------

/**
 * Central message handler.  All inter-context communication in the extension
 * passes through this switch so we have one place to debug and log.
 *
 * Returning `true` from the listener signals to Chrome that we will call
 * `sendResponse` asynchronously.
 */
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ): boolean => {
    // Log every message in development for easier debugging
    console.debug('[MockMaster SW] message received:', message.type, { sender });

    switch (message.type) {
      // -----------------------------------------------------------------------
      case MSG.EXTRACT_JOB: {
        // Sidepanel triggered an extraction — forward to the active tab's
        // content script and relay the response.
        handleExtractJob(sendResponse);
        return true; // async response
      }

      // -----------------------------------------------------------------------
      case MSG.JOB_EXTRACTED: {
        // Content script finished extraction.  The sidepanel is already
        // listening to chrome.runtime.onMessage directly, so this background
        // handler just acknowledges receipt.
        sendResponse({ success: true, data: null });
        return false; // synchronous response
      }

      // -----------------------------------------------------------------------
      case MSG.CAPTURE_SCREENSHOT: {
        // Sidepanel wants a JPEG screenshot for Vision API fallback.
        handleCaptureScreenshot(sendResponse);
        return true; // async response
      }

      // -----------------------------------------------------------------------
      case MSG.CHECK_AUTH: {
        // Sidepanel asks whether the user has a valid session.
        handleCheckAuth(sendResponse);
        return true; // async response
      }

      // -----------------------------------------------------------------------
      case MSG.GET_TAB_URL: {
        // Sidepanel asks for the URL of the currently active tab.
        handleGetTabUrl(sendResponse);
        return true; // async response
      }

      // -----------------------------------------------------------------------
      case MSG.TAB_UPDATED:
      case MSG.AUTH_CHANGED: {
        // These message types flow Background -> Sidepanel.  If somehow the
        // background receives one of its own broadcasts (e.g. in tests) just
        // acknowledge and move on.
        sendResponse({ success: true, data: null });
        return false;
      }

      // -----------------------------------------------------------------------
      case 'AUTH_TOKEN_RECEIVED': {
        // Content script on /auth/extension-callback relayed the Supabase token.
        // Store it in the canonical storage key so getAuthToken() can read it.
        const { token, user } = message.data || {};
        if (token) {
          const storedToken: StoredAuthToken = {
            access_token: token,
            refresh_token: '',
            expires_at: Date.now() + 3600 * 1000, // assume 1 hour validity
            user_id: user?.id ?? '',
            email: user?.email ?? '',
          };
          chrome.storage.local.set({
            [STORAGE_KEYS.authToken]: storedToken,
            auth_user: user ?? null,
            auth_synced_at: Date.now(),
          }).then(() => {
            console.log('[MockMaster SW] Auth token received from web app');
            // Notify sidepanel
            chrome.runtime.sendMessage({
              type: MSG.AUTH_CHANGED,
              isAuthenticated: true,
            } satisfies ExtensionMessage).catch(() => {});
          });
        }
        sendResponse({ success: true, data: null });
        return false;
      }

      // -----------------------------------------------------------------------
      default:
        // Unknown message type — ignore and do not call sendResponse so Chrome
        // does not report "message port closed" errors.
        console.warn(
          '[MockMaster SW] Unknown message type:',
          (message as { type: string }).type
        );
        return false;
    }
  }
);

// ---------------------------------------------------------------------------
// Programmatic token extraction from callback page
// ---------------------------------------------------------------------------

/**
 * Uses chrome.scripting.executeScript to programmatically read the auth token
 * from the extension callback page. This is more reliable than declarative
 * content script injection because it doesn't depend on timing.
 */
async function extractTokenFromCallbackPage(tabId: number): Promise<void> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // This function runs IN the callback page context
        // Read from DOM element (set by the React component)
        const tokenEl = document.getElementById('mockmaster-token');
        if (tokenEl?.dataset.token) {
          let user = null;
          try { user = JSON.parse(tokenEl.dataset.user || 'null'); } catch {}
          return { token: tokenEl.dataset.token, user };
        }
        return null;
      },
    });

    const result = results?.[0]?.result;
    if (result?.token) {
      console.log('[MockMaster SW] Token extracted from callback page via scripting API');

      const storedToken: StoredAuthToken = {
        access_token: result.token,
        refresh_token: '',
        expires_at: Date.now() + 3600 * 1000,
        user_id: result.user?.id ?? '',
        email: result.user?.email ?? '',
      };

      await chrome.storage.local.set({
        [STORAGE_KEYS.authToken]: storedToken,
        auth_user: result.user ?? null,
        auth_synced_at: Date.now(),
      });

      // Notify sidepanel
      chrome.runtime.sendMessage({
        type: MSG.AUTH_CHANGED,
        isAuthenticated: true,
      } satisfies ExtensionMessage).catch(() => {});
    } else {
      console.debug('[MockMaster SW] No token found on callback page, retrying...');
      // Retry once more after another 2 seconds
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            const tokenEl = document.getElementById('mockmaster-token');
            if (tokenEl?.dataset.token) {
              let user = null;
              try { user = JSON.parse(tokenEl.dataset.user || 'null'); } catch {}
              return { token: tokenEl.dataset.token, user };
            }
            return null;
          },
        }).then((retryResults) => {
          const retryResult = retryResults?.[0]?.result;
          if (retryResult?.token) {
            const storedToken: StoredAuthToken = {
              access_token: retryResult.token,
              refresh_token: '',
              expires_at: Date.now() + 3600 * 1000,
              user_id: retryResult.user?.id ?? '',
              email: retryResult.user?.email ?? '',
            };
            chrome.storage.local.set({
              [STORAGE_KEYS.authToken]: storedToken,
              auth_user: retryResult.user ?? null,
              auth_synced_at: Date.now(),
            }).then(() => {
              chrome.runtime.sendMessage({
                type: MSG.AUTH_CHANGED,
                isAuthenticated: true,
              } satisfies ExtensionMessage).catch(() => {});
            });
          }
        }).catch(() => {});
      }, 2000);
    }
  } catch (err) {
    console.error('[MockMaster SW] Failed to extract token from callback page:', err);
  }
}

// ---------------------------------------------------------------------------
// Tab navigation detection
// ---------------------------------------------------------------------------

/**
 * Whenever a tab finishes loading a new URL we check if it is a job listing
 * page and broadcast a TAB_UPDATED message.  The sidepanel listens for this
 * to update its state (e.g. switch from unsupported_page to extracting).
 */
chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void => {
    // Full page load completed
    if (changeInfo.status === 'complete' && tab.url) {
      broadcastTabUpdated(tab.url, tabId);

      // Detect the extension auth callback page and extract the token
      if (tab.url.includes('/auth/extension-callback')) {
        console.debug('[MockMaster SW] Detected auth callback page, injecting token reader...');
        // Wait a moment for React to hydrate and set the token
        setTimeout(() => {
          extractTokenFromCallbackPage(tabId);
        }, 2000);
      }
      return;
    }

    // SPA navigation: Indeed and LinkedIn change URL via History API without
    // a full page reload.  Chrome fires onUpdated with changeInfo.url when
    // the URL changes, even if status is not 'complete'.
    if (changeInfo.url) {
      broadcastTabUpdated(changeInfo.url, tabId);
    }
  }
);

/**
 * Whenever the user switches to a different tab we broadcast the new tab's
 * URL so the sidepanel can react without waiting for the next full page load.
 *
 * Example: user has LinkedIn open in tab A and Gmail in tab B.  When they
 * switch from B back to A the sidepanel should show the extraction UI, not the
 * "unsupported page" screen.
 */
chrome.tabs.onActivated.addListener(async (activeInfo: chrome.tabs.TabActiveInfo): Promise<void> => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      broadcastTabUpdated(tab.url, activeInfo.tabId);
    }
  } catch (error: unknown) {
    // Tab may have been closed before we could query it — not an error worth logging
    console.debug('[MockMaster SW] onActivated: could not get tab:', error);
  }
});

// ---------------------------------------------------------------------------
// Cookie change listener — react to Supabase auth cookie updates
// ---------------------------------------------------------------------------

/**
 * Listen for cookie changes on the MockMaster domain.  When a Supabase
 * auth-token cookie is set or removed (i.e. the user logged in or out in the
 * web app), we immediately re-sync our stored auth state and notify the
 * sidepanel via an AUTH_CHANGED message.
 *
 * This gives the extension near-instant sign-in / sign-out detection without
 * polling.
 */
chrome.cookies.onChanged.addListener((changeInfo: chrome.cookies.CookieChangeInfo): void => {
  // Only react to Supabase auth-token cookies
  if (!changeInfo.cookie.name.includes('auth-token')) return;

  console.debug(
    '[MockMaster SW] Auth cookie changed:',
    changeInfo.cookie.name,
    'removed:', changeInfo.removed
  );

  syncAuthState()
    .then((authenticated) => {
      chrome.runtime
        .sendMessage({
          type: MSG.AUTH_CHANGED,
          isAuthenticated: authenticated,
        } satisfies ExtensionMessage)
        .catch(() => {
          // Sidepanel not open — expected, not an error
        });
    })
    .catch((err: unknown) => {
      console.error('[MockMaster SW] Auth sync on cookie change failed:', err);
    });
});

// ---------------------------------------------------------------------------
// Periodic auth re-sync via alarms
// ---------------------------------------------------------------------------

const AUTH_SYNC_ALARM = 'mm_auth_sync';
/** Re-sync every 5 minutes to catch token expiry before it impacts UX */
const AUTH_SYNC_INTERVAL_MINUTES = 5;

/**
 * Ensure the periodic alarm exists.  chrome.alarms.create is idempotent when
 * the alarm already exists, so calling this on every service worker startup is
 * safe and avoids duplicate alarms.
 */
function ensureAuthSyncAlarm(): void {
  chrome.alarms.get(AUTH_SYNC_ALARM, (existing) => {
    if (!existing) {
      chrome.alarms.create(AUTH_SYNC_ALARM, {
        periodInMinutes: AUTH_SYNC_INTERVAL_MINUTES,
        delayInMinutes: AUTH_SYNC_INTERVAL_MINUTES,
      });
      console.debug('[MockMaster SW] Auth sync alarm created');
    }
  });
}

chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm): void => {
  if (alarm.name !== AUTH_SYNC_ALARM) return;

  console.debug('[MockMaster SW] Periodic auth sync triggered');
  syncAuthState()
    .then((authenticated) => {
      chrome.runtime
        .sendMessage({
          type: MSG.AUTH_CHANGED,
          isAuthenticated: authenticated,
        } satisfies ExtensionMessage)
        .catch(() => {});
    })
    .catch((err: unknown) => {
      console.error('[MockMaster SW] Periodic auth sync failed:', err);
    });
});

// ---------------------------------------------------------------------------
// Extension install / update lifecycle
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails): void => {
  console.info('[MockMaster SW] Extension installed/updated:', details.reason);

  // Set up the periodic auth sync alarm on install and update
  ensureAuthSyncAlarm();

  // Perform an immediate auth sync so the sidepanel is ready right away
  syncAuthState().catch((err: unknown) => {
    console.error('[MockMaster SW] Initial auth sync on install failed:', err);
  });

  if (details.reason === 'install') {
    // On first install, open the MockMaster web app in a new tab so the user
    // can log in and set up their profile.
    // API_BASE_URL resolves to localhost:3000 in development and the deployed
    // URL in production (webpack DefinePlugin handles the substitution).
    chrome.tabs.create({ url: `${API_BASE_URL}/login` });
  }
});

// Ensure the alarm is registered on every service worker startup, not only
// on install/update.  The service worker can be killed and restarted by Chrome
// at any time, so we must always re-register event-driven state.
ensureAuthSyncAlarm();

console.info('[MockMaster SW] Service worker started');

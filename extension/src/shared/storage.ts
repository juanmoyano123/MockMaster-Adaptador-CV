/**
 * chrome.storage.local helpers for the MockMaster extension.
 *
 * All persistent state that must survive service-worker restarts (auth tokens,
 * cached job extractions, etc.) is stored here.  Raw chrome.storage calls are
 * wrapped in typed helpers so callers never have to deal with the callback /
 * Promise mismatch or cast `unknown` manually.
 *
 * NOTE: These helpers are safe to call from any extension context (background,
 * content scripts, sidepanel) because chrome.storage.local is shared.
 */

import { StoredAuthToken, ExtractedJobData } from './types';
import { STORAGE_KEYS } from './constants';

// ---------------------------------------------------------------------------
// Generic low-level helpers
// ---------------------------------------------------------------------------

/**
 * Reads one or more keys from chrome.storage.local and returns them as a
 * typed object.
 */
function storageGet<T extends Record<string, unknown>>(
  keys: string | string[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result as T);
      }
    });
  });
}

/**
 * Writes key-value pairs to chrome.storage.local.
 */
function storageSet(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Removes keys from chrome.storage.local.
 */
function storageRemove(keys: string | string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Auth token
// ---------------------------------------------------------------------------

/** Persists the Supabase auth token to chrome.storage.local */
export async function saveAuthToken(token: StoredAuthToken): Promise<void> {
  await storageSet({ [STORAGE_KEYS.authToken]: token });
}

/**
 * Retrieves the stored auth token.
 * Returns null if no token has been saved or if it has expired.
 */
export async function getAuthToken(): Promise<StoredAuthToken | null> {
  const result = await storageGet<{ [key: string]: StoredAuthToken | undefined }>(
    STORAGE_KEYS.authToken
  );
  const token = result[STORAGE_KEYS.authToken];

  if (!token) return null;

  // Treat the token as expired if it expires in less than 60 seconds.
  const nowMs = Date.now();
  const expiresInMs = token.expires_at - nowMs;
  if (expiresInMs < 60_000) {
    // Token expired — remove it so the sidepanel shows the unauthenticated state
    await clearAuthToken();
    return null;
  }

  return token;
}

/** Removes the stored auth token (e.g. on explicit sign-out) */
export async function clearAuthToken(): Promise<void> {
  await storageRemove(STORAGE_KEYS.authToken);
}

/** Returns true if there is a valid (non-expired) auth token stored */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}

// ---------------------------------------------------------------------------
// Cached job extraction
// ---------------------------------------------------------------------------

/**
 * Caches the most recently extracted job data keyed by tab URL.
 * This allows the sidepanel to restore state when reopened without re-running
 * the DOM extraction.
 */
export async function cacheExtraction(
  url: string,
  data: ExtractedJobData
): Promise<void> {
  await storageSet({
    [STORAGE_KEYS.cachedExtraction]: { url, data, cached_at: Date.now() },
  });
}

/**
 * Returns the cached extraction for the given URL, or null if there is no
 * cached entry or the cache is stale (older than 30 minutes).
 */
export async function getCachedExtraction(
  url: string
): Promise<ExtractedJobData | null> {
  const result = await storageGet<{
    [key: string]: { url: string; data: ExtractedJobData; cached_at: number } | undefined;
  }>(STORAGE_KEYS.cachedExtraction);

  const entry = result[STORAGE_KEYS.cachedExtraction];
  if (!entry) return null;

  // Only return the cache if it matches the current URL and is fresh
  const THIRTY_MINUTES_MS = 30 * 60 * 1_000;
  const isStale = Date.now() - entry.cached_at > THIRTY_MINUTES_MS;
  if (entry.url !== url || isStale) return null;

  return entry.data;
}

/** Clears the cached extraction (e.g. when the user navigates away) */
export async function clearCachedExtraction(): Promise<void> {
  await storageRemove(STORAGE_KEYS.cachedExtraction);
}

// ---------------------------------------------------------------------------
// Last known tab URL
// ---------------------------------------------------------------------------

/** Persists the last active tab URL so the sidepanel can check on open */
export async function saveLastTabUrl(url: string): Promise<void> {
  await storageSet({ [STORAGE_KEYS.lastTabUrl]: url });
}

/** Returns the last persisted tab URL, or null if not set */
export async function getLastTabUrl(): Promise<string | null> {
  const result = await storageGet<{ [key: string]: string | undefined }>(
    STORAGE_KEYS.lastTabUrl
  );
  return result[STORAGE_KEYS.lastTabUrl] ?? null;
}

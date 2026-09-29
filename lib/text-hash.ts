/**
 * Text hashing utility for job description caching
 * Feature: F-003
 *
 * Uses Web Crypto API (SHA-256) for deterministic hashing.
 * Normalizes text (trim + lowercase) to detect duplicates.
 */

/**
 * Generates a SHA-256 hash of the input text for caching purposes
 *
 * @param text - The text to hash (will be normalized: trimmed and lowercased)
 * @returns Promise resolving to a hexadecimal hash string
 *
 * @example
 * const hash = await hashText("Senior Developer at Google...");
 * // Returns: "8f7a3b2c1d..."
 */
export async function hashText(text: string): Promise<string> {
  // Normalize text to ensure consistent hashing
  // Same job description pasted with different whitespace/casing = same hash
  const normalized = text.trim().toLowerCase();

  // Encode text to Uint8Array for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  // Generate SHA-256 hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}

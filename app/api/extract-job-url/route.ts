/**
 * API Route: POST /api/extract-job-url
 * Feature: F-014 — Job Description URL Extraction
 *
 * Accepts a job posting URL, fetches and parses its HTML content using
 * cheerio, and returns the extracted job description text. Includes SSRF
 * protection (private IPs blocked, HTTPS-only) and size/timeout guards.
 *
 * No authentication required — this is a public helper endpoint.
 *
 * Request body:
 *   { "url": "https://www.linkedin.com/jobs/view/..." }
 *
 * Response 200:
 *   { text: string, source: string, title?: string, company?: string }
 *
 * Error responses (all messages in Spanish):
 *   400  INVALID_URL        — URL no comienza con https:// o formato invalido
 *   400  BLOCKED_URL        — URL apunta a una IP privada/loopback
 *   413  CONTENT_TOO_LARGE  — Pagina supera los 5 MB
 *   422  LOGIN_WALL         — Pagina requiere autenticacion o no tiene oferta
 *   502  FETCH_ERROR        — No se pudo acceder al sitio
 *   504  FETCH_TIMEOUT      — Timeout al intentar acceder al sitio
 *   500  INTERNAL_ERROR     — Error interno inesperado
 */

import { extractJobText } from '@/lib/url-extractor';
import { UrlExtractionAPIError, UrlExtractionErrorCode } from '@/lib/types';

// ---------------------------------------------------------------------------
// Error message map (all messages in Spanish as per F-014 spec)
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<UrlExtractionErrorCode, string> = {
  INVALID_URL:
    'La URL debe comenzar con https://',
  BLOCKED_URL:
    'URL no permitida.',
  FETCH_TIMEOUT:
    'El sitio no respondio a tiempo. Intenta copiar y pegar el texto directamente.',
  FETCH_ERROR:
    'No se pudo acceder al sitio. Verifica la URL o intenta pegar el texto manualmente.',
  LOGIN_WALL:
    'La pagina requiere inicio de sesion o no contiene una oferta visible. Intenta copiando el texto directamente.',
  CONTENT_TOO_LARGE:
    'La pagina es demasiado grande para procesar.',
  INTERNAL_ERROR:
    'Error interno. Intenta de nuevo.',
};

const HTTP_STATUS: Record<UrlExtractionErrorCode, number> = {
  INVALID_URL: 400,
  BLOCKED_URL: 400,
  FETCH_TIMEOUT: 504,
  FETCH_ERROR: 502,
  LOGIN_WALL: 422,
  CONTENT_TOO_LARGE: 413,
  INTERNAL_ERROR: 500,
};

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

/**
 * POST /api/extract-job-url
 */
export async function POST(req: Request) {
  // Parse request body
  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    const error: UrlExtractionAPIError = {
      error: 'El cuerpo de la solicitud debe ser JSON valido.',
      code: 'INVALID_URL',
    };
    return Response.json(error, { status: 400 });
  }

  const { url } = body;

  // Basic presence check before delegating to the extractor
  if (!url || typeof url !== 'string') {
    const error: UrlExtractionAPIError = {
      error: 'Se requiere el campo "url" en el cuerpo de la solicitud.',
      code: 'INVALID_URL',
    };
    return Response.json(error, { status: 400 });
  }

  try {
    // extractJobText handles: validation → SSRF check → fetch → parse → clean
    const result = await extractJobText(url.trim());

    return Response.json(
      {
        text: result.text,
        source: result.source,
        title: result.title,
        company: result.company,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    // Typed errors thrown by extractJobText carry a `code` property
    if (err && typeof err === 'object' && 'code' in err) {
      const code = (err as { code: UrlExtractionErrorCode }).code;

      // Validate that the code is one we know about; fall back to INTERNAL_ERROR
      const knownCode: UrlExtractionErrorCode =
        code in ERROR_MESSAGES ? code : 'INTERNAL_ERROR';

      const apiError: UrlExtractionAPIError = {
        error: ERROR_MESSAGES[knownCode],
        code: knownCode,
      };

      return Response.json(apiError, { status: HTTP_STATUS[knownCode] });
    }

    // Unexpected / unhandled errors
    console.error('[extract-job-url] Unhandled error:', err);

    const apiError: UrlExtractionAPIError = {
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      code: 'INTERNAL_ERROR',
    };
    return Response.json(apiError, { status: 500 });
  }
}

/**
 * Unit Tests for URL Extractor Utility
 * Feature: F-014 — Job Description URL Extraction
 *
 * Covers:
 * - validateUrl: SSRF protection, HTTPS enforcement, format checks
 * - detectSource: LinkedIn, Indeed, generic detection
 * - extractJobText: fetch error cases via mocked global fetch
 */

import { validateUrl, detectSource, extractJobText } from '@/lib/url-extractor';

// ---------------------------------------------------------------------------
// validateUrl
// ---------------------------------------------------------------------------

describe('validateUrl', () => {
  // --- Valid URLs ---
  test('accepts a valid https LinkedIn URL', () => {
    const result = validateUrl('https://www.linkedin.com/jobs/view/1234567890');
    expect(result.valid).toBe(true);
  });

  test('accepts a valid https Indeed URL', () => {
    const result = validateUrl('https://ar.indeed.com/viewjob?jk=abc123');
    expect(result.valid).toBe(true);
  });

  test('accepts a generic https job portal URL', () => {
    const result = validateUrl('https://jobs.example.com/postings/engineer-123');
    expect(result.valid).toBe(true);
  });

  // --- HTTPS enforcement ---
  test('rejects http:// URLs', () => {
    const result = validateUrl('http://www.linkedin.com/jobs/view/123');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('INVALID_URL');
    expect(result.error).toContain('https://');
  });

  test('rejects ftp:// URLs', () => {
    const result = validateUrl('ftp://example.com/jobs/123');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('INVALID_URL');
  });

  test('rejects URLs without protocol', () => {
    const result = validateUrl('www.linkedin.com/jobs/view/123');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('INVALID_URL');
  });

  // --- Empty / invalid input ---
  test('rejects empty string', () => {
    const result = validateUrl('');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('INVALID_URL');
  });

  test('rejects whitespace-only string', () => {
    const result = validateUrl('   ');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('INVALID_URL');
  });

  test('rejects malformed URLs', () => {
    const result = validateUrl('https://');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('INVALID_URL');
  });

  // --- SSRF protection: localhost ---
  test('blocks localhost', () => {
    const result = validateUrl('https://localhost/api/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  test('blocks 0.0.0.0', () => {
    const result = validateUrl('https://0.0.0.0/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  // --- SSRF protection: 10.x.x.x ---
  test('blocks 10.0.0.1 (private class A)', () => {
    const result = validateUrl('https://10.0.0.1/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  test('blocks 10.255.255.255', () => {
    const result = validateUrl('https://10.255.255.255/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  // --- SSRF protection: 172.16-31.x.x ---
  test('blocks 172.16.0.1 (private class B start)', () => {
    const result = validateUrl('https://172.16.0.1/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  test('blocks 172.31.255.255 (private class B end)', () => {
    const result = validateUrl('https://172.31.255.255/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  test('allows 172.15.x.x (not in private range)', () => {
    // 172.15.x.x is outside the 172.16-31 range — should be allowed
    const result = validateUrl('https://172.15.0.1/jobs');
    expect(result.valid).toBe(true);
  });

  test('allows 172.32.x.x (not in private range)', () => {
    const result = validateUrl('https://172.32.0.1/jobs');
    expect(result.valid).toBe(true);
  });

  // --- SSRF protection: 192.168.x.x ---
  test('blocks 192.168.1.1 (private class C)', () => {
    const result = validateUrl('https://192.168.1.1/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  // --- SSRF protection: 127.x.x.x ---
  test('blocks 127.0.0.1 (loopback)', () => {
    const result = validateUrl('https://127.0.0.1/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  test('blocks 127.255.255.255 (loopback range)', () => {
    const result = validateUrl('https://127.255.255.255/jobs');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  // --- SSRF protection: 169.254.x.x (link-local / cloud metadata) ---
  test('blocks 169.254.169.254 (AWS metadata endpoint)', () => {
    const result = validateUrl('https://169.254.169.254/latest/meta-data/');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });

  // --- SSRF protection: known blocked hostnames ---
  test('blocks metadata.google.internal', () => {
    const result = validateUrl('https://metadata.google.internal/computeMetadata/v1/');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BLOCKED_URL');
  });
});

// ---------------------------------------------------------------------------
// detectSource
// ---------------------------------------------------------------------------

describe('detectSource', () => {
  test('detects linkedin.com as linkedin', () => {
    expect(detectSource('https://www.linkedin.com/jobs/view/123')).toBe('linkedin');
  });

  test('detects regional linkedin subdomains as linkedin', () => {
    expect(detectSource('https://ar.linkedin.com/jobs/view/123')).toBe('linkedin');
  });

  test('detects indeed.com as indeed', () => {
    expect(detectSource('https://ar.indeed.com/viewjob?jk=abc')).toBe('indeed');
  });

  test('detects us.indeed.com as indeed', () => {
    expect(detectSource('https://www.indeed.com/viewjob?jk=abc')).toBe('indeed');
  });

  test('returns generic for unknown job portals', () => {
    expect(detectSource('https://jobs.acme.com/postings/123')).toBe('generic');
  });

  test('returns generic for company career pages', () => {
    expect(detectSource('https://careers.google.com/jobs/results/123')).toBe('generic');
  });

  test('returns generic for malformed URLs without throwing', () => {
    expect(detectSource('not-a-url')).toBe('generic');
  });
});

// ---------------------------------------------------------------------------
// extractJobText — mocked fetch scenarios
// ---------------------------------------------------------------------------

describe('extractJobText', () => {
  // Save original fetch and restore after tests
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // Helper: build a minimal mock Response with a ReadableStream body
  function mockFetchResponse(
    html: string,
    options: { status?: number; ok?: boolean; contentLength?: string } = {}
  ) {
    const { status = 200, ok = true, contentLength } = options;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(html);

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoded);
        controller.close();
      },
    });

    const headers = new Headers({ 'content-type': 'text/html' });
    if (contentLength) {
      headers.set('content-length', contentLength);
    }

    return Promise.resolve(
      new Response(stream, { status, headers, statusText: ok ? 'OK' : 'Error' })
    );
  }

  // --- Validation errors (no fetch needed) ---
  test('throws INVALID_URL for http:// URLs', async () => {
    await expect(extractJobText('http://example.com/jobs/1')).rejects.toMatchObject({
      code: 'INVALID_URL',
    });
  });

  test('throws BLOCKED_URL for localhost', async () => {
    await expect(extractJobText('https://localhost/jobs')).rejects.toMatchObject({
      code: 'BLOCKED_URL',
    });
  });

  test('throws BLOCKED_URL for private 10.x.x.x IPs', async () => {
    await expect(extractJobText('https://10.0.0.1/jobs')).rejects.toMatchObject({
      code: 'BLOCKED_URL',
    });
  });

  // --- LOGIN_WALL: HTTP 403 from the remote server ---
  test('throws LOGIN_WALL when server returns 403', async () => {
    global.fetch = () => mockFetchResponse('', { status: 403, ok: false });

    await expect(extractJobText('https://www.linkedin.com/jobs/view/123')).rejects.toMatchObject({
      code: 'LOGIN_WALL',
    });
  });

  // --- FETCH_ERROR: HTTP 500 from the remote server ---
  test('throws FETCH_ERROR when server returns 500', async () => {
    global.fetch = () => mockFetchResponse('', { status: 500, ok: false });

    await expect(extractJobText('https://jobs.example.com/1')).rejects.toMatchObject({
      code: 'FETCH_ERROR',
    });
  });

  // --- FETCH_TIMEOUT: AbortController fires ---
  test('throws FETCH_TIMEOUT when fetch is aborted', async () => {
    global.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        // Listen for the abort signal and reject immediately
        const signal = options?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener('abort', () => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }
      });
    };

    // We need a real 10s timeout which is too slow for tests, so we patch
    // the AbortController to abort immediately after construction.
    // Instead, just abort manually by making the signal pre-aborted.
    const abortController = new AbortController();
    abortController.abort();

    // Override global fetch to immediately throw an AbortError
    global.fetch = () => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    };

    await expect(extractJobText('https://www.indeed.com/viewjob?jk=abc')).rejects.toMatchObject({
      code: 'FETCH_TIMEOUT',
    });
  });

  // --- CONTENT_TOO_LARGE: content-length header exceeds 5MB ---
  test('throws CONTENT_TOO_LARGE when content-length exceeds 5MB', async () => {
    const over5MB = String(6 * 1024 * 1024); // 6 MB as string
    global.fetch = () =>
      mockFetchResponse('<html><body>big page</body></html>', {
        contentLength: over5MB,
      });

    await expect(extractJobText('https://jobs.example.com/big')).rejects.toMatchObject({
      code: 'CONTENT_TOO_LARGE',
    });
  });

  // --- Successful extraction: generic page with job content ---
  test('extracts job text from a generic HTML page', async () => {
    const html = `
      <html>
        <head><title>Senior Engineer at Acme</title></head>
        <body>
          <nav>Navigation menu</nav>
          <h1>Senior Software Engineer</h1>
          <div class="job-description">
            We are looking for a Senior Software Engineer to join our team.
            You will be responsible for designing and implementing scalable systems.
            Requirements: 5+ years of experience with TypeScript and Node.js.
            We offer competitive salary and remote work options.
          </div>
          <footer>Footer content</footer>
        </body>
      </html>
    `;

    global.fetch = () => mockFetchResponse(html);

    const result = await extractJobText('https://careers.acme.com/jobs/1');
    expect(result.source).toBe('generic');
    expect(result.text.length).toBeGreaterThan(50);
    expect(result.text.toLowerCase()).toContain('senior software engineer');
  });

  // --- Successful extraction: includes title + company in output ---
  test('prepends title and company to text when available', async () => {
    const html = `
      <html>
        <body>
          <h1>Data Scientist</h1>
          <div class="job-description">
            We are hiring a Data Scientist to help us unlock insights from our data.
            Requirements: Python, ML frameworks, statistical analysis skills.
            Join our growing team of 50+ engineers and data professionals.
          </div>
        </body>
      </html>
    `;

    global.fetch = () => mockFetchResponse(html);

    const result = await extractJobText('https://jobs.example.com/data-scientist');
    // The title "Data Scientist" should appear in the output
    expect(result.text).toContain('Data Scientist');
    expect(result.title).toBe('Data Scientist');
  });

  // --- LOGIN_WALL heuristic: page text too short (gated content) ---
  test('throws LOGIN_WALL when extracted text is below minimum length', async () => {
    const html = `
      <html>
        <body>
          <div class="job-description">Sign in</div>
        </body>
      </html>
    `;

    global.fetch = () => mockFetchResponse(html);

    await expect(extractJobText('https://jobs.example.com/gated')).rejects.toMatchObject({
      code: 'LOGIN_WALL',
    });
  });

  // --- LOGIN_WALL heuristic: page contains login-wall phrase ---
  test('throws LOGIN_WALL when page contains "sign in to view" phrase', async () => {
    const html = `
      <html>
        <body>
          <main>
            Sign in to view this job posting and apply to hundreds of open positions.
            Please log in to continue using our job board.
          </main>
        </body>
      </html>
    `;

    global.fetch = () => mockFetchResponse(html);

    await expect(extractJobText('https://jobs.example.com/private')).rejects.toMatchObject({
      code: 'LOGIN_WALL',
    });
  });

  // --- FETCH_ERROR: network-level error ---
  test('throws FETCH_ERROR when fetch throws a generic network error', async () => {
    global.fetch = () => Promise.reject(new Error('Network error'));

    await expect(extractJobText('https://jobs.example.com/unreachable')).rejects.toMatchObject({
      code: 'FETCH_ERROR',
    });
  });
});

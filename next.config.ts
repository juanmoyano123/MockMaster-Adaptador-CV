import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * CORS headers for API routes.
   *
   * Chrome extensions cannot send cookies from another domain, so they
   * authenticate via Bearer token in the Authorization header instead.
   * We allow all origins because chrome-extension://<id> changes per
   * installation and cannot be enumerated at build time.
   *
   * The existing cookie-based auth for the web app is not affected.
   */
  async headers() {
    return [
      {
        // CORS for API routes — allows Chrome extension (chrome-extension://<id>)
        // which has a per-installation dynamic origin. Auth is enforced via
        // Bearer token so wildcard origin is acceptable here.
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        // Security headers for all pages
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;

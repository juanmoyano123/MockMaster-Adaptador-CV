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
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

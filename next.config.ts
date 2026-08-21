import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // pdfjs-dist requires canvas alias disabled for browser builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss://* ws://* http://localhost:* http://127.0.0.1:*; frame-ancestors 'none';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://afraid-eel-73.loca.lt/api/:path*'
      },
      {
        source: '/ws/:path*',
        destination: 'https://afraid-eel-73.loca.lt/ws/:path*'
      },
      {
        source: '/recordings/:path*',
        destination: 'https://afraid-eel-73.loca.lt/recordings/:path*'
      }
    ];
  }
};

export default nextConfig;

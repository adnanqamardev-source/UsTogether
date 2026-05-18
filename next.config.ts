import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['motion'],

  async headers() {
    return [
      {
        // Apply these headers to all routes in your application
        source: '/(.*)',
        headers: [
          {
            // Protects against clickjacking (someone embedding your site in an invisible iframe)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Prevents the browser from guessing the type of a file, forcing it to stick to what you declared
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Controls how much information the browser sends when you link away to another website
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            // Forces browsers to only use HTTPS, keeping the connection secure
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // The VIP Bouncer: Determines exactly where scripts, styles, and data can load from
            key: 'Content-Security-Policy',
            // This is a balanced policy. It allows Firebase and Google APIs to connect, 
            // allows basic inline styles (common in Tailwind/Next), and allows images from external URLs.
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.vercel-scripts.com wss://*.firebaseio.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

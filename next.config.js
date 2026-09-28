import path from 'path';

/**
 * Demo mode (NEXT_PUBLIC_DEMO_MODE=true) swaps Firebase for in-memory mocks so
 * the app and the E2E suite can run without backend credentials. It is a
 * local-dev/test-only affordance: mock data must never reach real users, so a
 * production build that requests it fails fast instead of silently serving
 * fake data.
 */
const demoRequested = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
// Only a real Vercel production deployment is fenced off. `next build`
// always runs with NODE_ENV=production — including the CI E2E job, which
// intentionally builds with the demo flag — so NODE_ENV must NOT be part of
// this check or CI breaks.
const isVercelProduction = process.env.VERCEL_ENV === 'production';

if (demoRequested && isVercelProduction) {
  throw new Error(
    'NEXT_PUBLIC_DEMO_MODE=true is not allowed in a production build. ' +
      'Remove it from the environment; the app requires real Firebase config.',
  );
}

const isDemo = demoRequested && !isVercelProduction;
const demoModule = './lib/firebase/demo.ts';
const demoModulePath = path.join(process.cwd(), demoModule);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['motion'],
  ...(isDemo
    ? {
        webpack(config) {
          config.resolve.alias = {
            ...config.resolve.alias,
            'firebase/firestore': demoModulePath,
            'firebase/auth': demoModulePath,
            'firebase/storage': demoModulePath,
            // Force a pure-JS shim so @firebase/auth ESM never loads at runtime
            '@firebase/auth': demoModulePath,
          };
          return config;
        },
        turbopack: {
          resolveAlias: {
            'firebase/firestore': demoModule,
            'firebase/auth': demoModule,
            'firebase/storage': demoModule,
            '@firebase/auth': demoModule,
          },
        },
      }
    : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Window-Policy',
            value: 'allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Disable Privacy Sandbox features to prevent warnings from ad blockers
            value:
              'attribution-reporting=(),' +
              'private-aggregation=(),' +
              'private-state-token-issuance=(),' +
              'private-state-token-redemption=(),' +
              'join-ad-interest-group=(),' +
              'run-ad-auction=(),' +
              'browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

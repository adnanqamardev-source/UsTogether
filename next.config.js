/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['motion'],
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
        ],
      },
    ];
  },
};

export default nextConfig;
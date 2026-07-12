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
            key: 'Permissions-Policy',
            // Disable Privacy Sandbox features to prevent warnings from ad blockers
            // These features are not used by this application
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
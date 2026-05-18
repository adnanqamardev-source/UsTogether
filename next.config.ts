import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['motion'],
  // Ensure basePath and output: 'export' are completely removed!
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['motion'],

  // --- Crucial settings for GitHub Pages ---
  output: 'export', 
  basePath: '/UsTogether', // Must match your exact URL repository capitalization!
  images: {
    unoptimized: true, 
  },
};

export default nextConfig;

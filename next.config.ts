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
  
  // --- Required settings for GitHub Pages ---
  output: 'export', // Tells Next.js to build static files instead of a server
  basePath: '/us-two', // MUST match your GitHub repository name exactly
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js image optimization
  },
};

export default nextConfig;

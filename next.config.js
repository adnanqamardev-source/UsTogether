/**
 * Next.js configuration file (JavaScript version).
 * The project originally used a TypeScript config (next.config.ts),
 * but Next.js only reads a .js file during the build process.
 * This file mirrors the settings from the TypeScript config.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Skip linting errors during production builds to avoid ESLint option errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['motion'],
  // Ensure basePath and output: 'export' are completely removed!
  experimental: {
    // Enable the App Router (app directory) explicitly for Next.js 13+.
    appDir: true,
  },
};

module.exports = nextConfig;
import path from "path";
import type { NextConfig } from "next";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const demoModule = "./lib/firebase/demo.ts";
const demoModulePath = path.join(process.cwd(), demoModule);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ["motion"],
  ...(isDemo
    ? {
        webpack(config: any) {
          config.resolve.alias = {
            ...config.resolve.alias,
            "firebase/firestore": demoModulePath,
            "firebase/auth": demoModulePath,
            "firebase/storage": demoModulePath,
            // Force a pure-JS shim so @firebase/auth ESM never loads at runtime
            "@firebase/auth": demoModulePath,
          };
          return config;
        },
        turbopack: {
          resolveAlias: {
            "firebase/firestore": demoModule,
            "firebase/auth": demoModule,
            "firebase/storage": demoModule,
            "@firebase/auth": demoModule,
          },
        },
      }
    : {}),
};
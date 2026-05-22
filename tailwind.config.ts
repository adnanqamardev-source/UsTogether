import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adding your landing page brand colors for easy reuse
        space: {
          bg: '#0F0A1F',
          dark: '#0a0715',
        },
        accent: {
          rose: '#f43f5e', // rose-500
          indigo: '#4f46e5', // indigo-600
        }
      }
    },
  },
  plugins: [],
};

export default config;

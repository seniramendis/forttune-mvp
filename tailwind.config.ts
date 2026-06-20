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
        navy: '#0D1B3E',
        navy2: '#1A2F5E',
        orange: '#E85D26',
        orange2: '#F47A4A',
        bg: '#F5F6FA',
        muted: '#6B7A99',
        border: 'rgba(13,27,62,0.1)',
      }
    },
  },
  plugins: [],
};

export default config;
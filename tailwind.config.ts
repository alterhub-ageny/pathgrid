import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#d9e0ef',
          200: '#b3c1df',
          300: '#8da2cf',
          400: '#6b84bf',
          500: '#4a67af',
          600: '#2d4a8a',
          700: '#1a2f5e',
          800: '#0f1d3d',
          900: '#080f24',
        },
        gold: {
          50: '#fef8e7',
          100: '#fcecb8',
          200: '#f9df86',
          300: '#f6d154',
          400: '#f3c42e',
          500: '#d4a61e',
          600: '#a88216',
          700: '#7c5e10',
          800: '#503c0a',
          900: '#241b04',
        },
        cyan: {
          50: '#e6f9fc',
          100: '#b3edf5',
          200: '#80e1ee',
          300: '#4dd5e7',
          400: '#26c9e0',
          500: '#00b8d4',
          600: '#0093a8',
          700: '#006e7c',
          800: '#004950',
          900: '#002428',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'Noto Naskh Arabic', 'Amiri', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;

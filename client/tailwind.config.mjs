/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        primary: '#8b5cf6',
        secondary: '#3b82f6',
        accent: '#14b8a6',
        'text-main': '#f8fafc',
        'text-muted': '#94a3b8',
      },
    },
  },
  plugins: [],
};

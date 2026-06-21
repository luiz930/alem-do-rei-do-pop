/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#08090c',
        navy: '#0c1728',
        gold: '#c7a65b',
        champagne: '#f2dfae',
        paper: '#f5f2ea',
        mist: '#a9acb3'
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'Segoe UI', 'sans-serif']
      },
      boxShadow: { gold: '0 18px 60px rgba(199,166,91,.16)' }
    }
  },
  plugins: []
};

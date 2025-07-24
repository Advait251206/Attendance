// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'fira-code': ['"Fira Code"', 'monospace'],
      },
      colors: {
        // --- NEW: Replaced green with a vibrant blue ---
        'cyber-blue': '#00C2FF', // A bright, electric blue
        'matrix-bg': '#0d0208',
        'cyber-black': '#0a0a0a',
        'terminal-gray': '#b2b2b2',
        'accent-purple': '#9e00ff',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        flicker: 'flicker 1.5s infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
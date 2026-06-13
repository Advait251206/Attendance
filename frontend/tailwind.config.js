/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Orbitron"', 'sans-serif'],
        'mono': ['"Fira Code"', 'monospace'],
        'fira-code': ['"Fira Code"', 'monospace'],
      },
      colors: {
        // === PRIMARY DESIGN SYSTEM ===
        'primary':     '#00f3ff',  // Neon Cyan
        'secondary':   '#bc13fe',  // Neon Purple
        'accent':      '#2d45ff',  // Electric Blue
        'danger':      '#ff003c',  // Neon Red
        'warning':     '#fcea0a',  // Neon Yellow

        // === BACKGROUNDS ===
        'background':  '#050508',  // Near-black deep space
        'surface':     '#0d0d14',  // Slightly elevated dark panel

        // === TEXT ===
        'neon-white':  '#e8eaf6',  // Soft white
        'neon-gray':   '#6b7280',  // Muted gray for labels

        // === LEGACY HACKER GREEN (kept for compatibility) ===
        'hacker-green': '#00ff41',
        'matrix-bg':    '#0d0208',
        'cyber-black':  '#0a0a0a',
        'terminal-gray':'#b2b2b2',
        'accent-purple':'#9e00ff',
      },
      boxShadow: {
        'neon-cyan':   '0 0 20px rgba(0, 243, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(188, 19, 254, 0.5)',
        'neon-red':    '0 0 20px rgba(255, 0, 60, 0.5)',
        'neon-yellow': '0 0 20px rgba(252, 234, 10, 0.5)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,243,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.05) 1px, transparent 1px)",
        'radial-gradient-vignette': 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.8) 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
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
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glitch: {
          '0%, 100%': { clipPath: 'inset(80% 0 0 0)', transform: 'translate(-2px, 0)' },
          '20%': { clipPath: 'inset(10% 0 85% 0)', transform: 'translate(2px, 0)' },
          '40%': { clipPath: 'inset(50% 0 30% 0)', transform: 'translate(-1px, 0)' },
          '60%': { clipPath: 'inset(20% 0 60% 0)', transform: 'translate(1px, 0)' },
          '80%': { clipPath: 'inset(40% 0 20% 0)', transform: 'translate(-2px, 0)' },
        },
      },
      animation: {
        flicker: 'flicker 1.5s infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        shimmer: 'shimmer 1s infinite',
        scanline: 'scanline 8s linear infinite',
        glitch: 'glitch 0.5s infinite',
      },
    },
  },
  plugins: [],
}
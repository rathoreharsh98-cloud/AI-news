/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        osint: {
          950: '#080b11',
          900: '#0a0d14',
          850: '#0f1420',
          800: '#141b2d',
          750: '#192237',
          700: '#1e2942',
          600: '#2b3a5c',
          accent: '#00f0ff',
          neonGreen: '#00ff66',
          neonAmber: '#ffb703',
          neonRed: '#ff3366',
          purple: '#8b5cf6',
          biasLeft: '#3b82f6',
          biasCenter: '#a855f7',
          biasRight: '#f43f5e'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'radar': 'radar-rotate 4s linear infinite',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'radar-rotate': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}

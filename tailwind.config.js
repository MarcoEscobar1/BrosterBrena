/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa1a1',
          400: '#ff6b6b',
          500: '#e30a17', // Logo red
          600: '#c90814',
          700: '#a60610',
          800: '#8a050d',
          900: '#730c11',
          950: '#400004',
        },
        surface: {
          DEFAULT: '#0a0a0a',
          50:  '#222222',
          100: '#1c1c1c',
          200: '#171717',
          300: '#121212',
          400: '#0a0a0a',
          500: '#000000',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in':   'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-15px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'brand': '0 0 24px rgba(227, 10, 23, 0.2)',
        'glow':  '0 0 40px rgba(227, 10, 23, 0.35)',
      },
    },
  },
  plugins: [],
}

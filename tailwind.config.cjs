/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink': 'rgb(var(--ink-rgb) / <alpha-value>)',
        'muted': 'rgb(var(--muted-rgb) / <alpha-value>)',
        'subtle': 'rgb(var(--subtle-rgb) / <alpha-value>)',
        'line': 'rgb(var(--line-rgb) / <alpha-value>)',
        'danger': 'rgb(var(--danger-rgb) / <alpha-value>)',
        'danger-soft': 'rgb(var(--danger-soft-rgb) / <alpha-value>)',
        'success': 'rgb(var(--success-rgb) / <alpha-value>)',
        'warning': 'rgb(var(--warning-rgb) / <alpha-value>)',
        brand: {
          50: 'rgb(var(--accent-soft-rgb) / <alpha-value>)',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa1a1',
          400: '#ff6b6b',
          500: '#e30a17', // Logo red
          600: '#c90814',
          700: 'rgb(var(--accent-text-rgb) / <alpha-value>)',
          800: '#8a050d',
          900: '#730c11',
          950: '#400004',
        },
        surface: {
          '50': 'rgb(var(--paper-rgb) / <alpha-value>)',
          '100': 'rgb(var(--paper-rgb) / <alpha-value>)',
          '200': 'rgb(var(--surface-200-rgb) / <alpha-value>)',
          '300': 'rgb(var(--ground-rgb) / <alpha-value>)',
          '400': 'rgb(var(--surface-400-rgb) / <alpha-value>)',
          '500': 'rgb(var(--surface-500-rgb) / <alpha-value>)',
          'DEFAULT': 'rgb(var(--ground-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
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
        'brand': '0 4px 12px rgba(0, 0, 0, 0.18)',
        'glow':  '0 8px 24px rgba(0, 0, 0, 0.24)',
      },
    },
  },
  plugins: [],
}

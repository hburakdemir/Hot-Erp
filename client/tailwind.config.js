/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        /** Birincil tema: kırmızı tonları (topluluk kimliği) — eski `navy-*` sınıfları bu paleti kullanır */
        navy: {
          50: '#fff5f5',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#450a0a',
        },
        /** Açık yüzeyler — beyaz / çok açık gri */
        cream: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f4f4f5',
          300: '#e4e4e7',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(136,19,55,0.08), 0 8px 32px rgba(136,19,55,0.06)',
        'card-lg': '0 2px 8px rgba(136,19,55,0.08), 0 24px 64px rgba(136,19,55,0.1)',
        'inner-sm': 'inset 0 1px 2px rgba(136,19,55,0.06)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

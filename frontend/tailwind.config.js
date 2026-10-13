/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        blood: {
          primary: '#be123c', // deep crimson red
          dark: '#881337',
          accent: '#e11d48',
          light: '#fff1f2',
          subtle: '#ffe4e6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'healthcare': '0 4px 20px -2px rgba(190, 18, 60, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'healthcare-hover': '0 12px 28px -4px rgba(190, 18, 60, 0.14), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};

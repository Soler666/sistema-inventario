/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1d1d1f',
        secondary: '#86868b',
        accent: '#0071e3',
        success: '#34c759',
        warning: '#ff9500',
        critical: '#ff3b30',
        surface: '#f5f5f7',
        'surface-dark': '#ffffff',
        border: '#d2d2d7',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

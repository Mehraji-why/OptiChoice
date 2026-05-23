/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2c5aa0',
        'primary-dark': '#1e3f5a',
        surface: '#f8fafc',
        'surface-dark': '#0f172a',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

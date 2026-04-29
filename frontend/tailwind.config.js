/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2c5aa0',
        'primary-dark': '#1e3f5a',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cantv: {
          blue: '#0d6efd',
          darkBlue: '#0a58ca',
          lightBlue: '#e7f1ff',
          dark: '#111418',
          sidebar: '#212529',
          border: '#dee2e6'
        }
      }
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",  // Indica a Tailwind di guardare TUTTO dentro /app
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: '#0a0a0a',
        gold: '#D4AF37',
      },
    },
  },
  plugins: [],
}

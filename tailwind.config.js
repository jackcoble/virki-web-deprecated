/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      
      animation: {
        'reverse-spin': 'reverse-spin 1s linear infinite'
      },

      keyframes: {
        'reverse-spin': {
          from: {
            transform: 'rotate(360deg)'
          }
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms")
  ],
}

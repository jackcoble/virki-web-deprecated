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
      },

      colors: {
        'mine-shaft': {
          DEFAULT: '#212121',
          '50': '#7D7D7D',
          '100': '#737373',
          '200': '#5E5E5E',
          '300': '#4A4A4A',
          '400': '#353535',
          '500': '#212121',
          '600': '#050505'
        },

        'mountain-meadow': {
          DEFAULT: '#22CA6C',
          '50': '#49E08C',
          '100': '#37DD81',
          '200': '#22CA6C',
          '300': '#1A9A52',
          '400': '#126A39',
          '500': '#0A3A1F',
          '600': '#020A05',
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms")
  ],
}

const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './utils/**/*.ts'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat Variable', 'Montserrat', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Midnight sits at the midpoint between blue and indigo desaturated by 20%. Blue was a bit
        // too blue, indigo was a bit too purple.
        midnight: {
          50: '#f1f5fd',
          100: '#e1eafc',
          200: '#c9d9f8',
          300: '#a6c0f3',
          400: '#7f9feb',
          500: '#5f7de3',
          600: '#4b61d7',
          700: '#404fc1',
          800: '#38429c',
          900: '#313b7d',
        },
        gray: {
          350: '#b7bcc5',
        },
        myetm: {
          // collections table highlight
            100: "#d7ecea",
            110: "#0f5f5a",
            // light and medium background
            200: "#ffffff",
            300: "#f6f7f9",
            // light gray & medium gray
            400: "#aeb4bd",
            450: "rgb(89, 98, 111)",
            // dark background
            600: "#edeff2",
            // dark text
            800: "#181f29",
            // dark collections
            850: "#181f29",
            // brand colors (blue)
            900: "#4e7be4",
            910: "#89a9ec",
            940: "#d0e0f7",
            // brand colors (orange)
            950: "#f27316",
            970: "#f4cab3",
            // brand colors (green)
            980: "#56b351",
            990: "#a5e0a1"
        }
      },
    },
  },
  plugins: [],
};

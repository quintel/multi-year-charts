const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './utils/**/*.ts'],
  safelist: [
    'w-[36%]',
    'w-[44%]',
    'w-[52%]',
    'w-[60%]',
    'w-[68%]',
    'w-[76%]'
  ],
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
          // light and medium background
          200: "#fdfdfd",
          300: "#fbf7f6",
          // light gray & medium gray
          400: "#aba8a7",
          450: 'rgb(125, 118, 115)',
          // dark background
          600: "#fdece0",
          // dark text
          800: "#462c34",
          // brand colors (blue)
          900: "#4e7be4",
          910: "#89a9ec",
          940: "#d0e0f7",
          // brand colors (orange,)
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

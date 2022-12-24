/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
};

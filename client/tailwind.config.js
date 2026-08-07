/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fcfdfa',
          100: '#f3f6ee',
          200: '#e5ecd9',
          300: '#cfdeb9',
          400: '#b1c890',
          500: '#94b070',
          600: '#769453',
          700: '#5c773e',
          800: '#4a5f33',
          900: '#3f502d',
          950: '#212a17',
        },
        gold: {
          50: '#fbf9f4',
          100: '#f5eedf',
          200: '#eadabe',
          300: '#dcbe92',
          400: '#cb9d66',
          500: '#be8449',
          600: '#af703c',
          700: '#925732',
          800: '#77462d',
          900: '#613928',
          950: '#341d13',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#EBEEF0',
        'adidas-black': '#000000',
        'adidas-white': '#FFFFFF',
        'adidas-grey': '#EBEEF0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Oswald', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

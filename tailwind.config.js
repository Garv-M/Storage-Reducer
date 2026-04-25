/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        blue: {
          100: '#0053e2',
        },
        spark: {
          100: '#ffc220',
        },
        red: {
          100: '#ea1100',
        },
        green: {
          100: '#2a8703',
        },
      },
    },
  },
  plugins: [],
};

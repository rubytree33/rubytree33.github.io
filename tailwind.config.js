/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./{pages,components}/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Titillium Web"', ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [],
}

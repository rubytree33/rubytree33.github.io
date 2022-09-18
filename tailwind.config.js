/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./{pages,components}/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      ruby: {
        ...colors.rose,
      },
    },
    extend: {
      fontFamily: {
        'sans': ['"Titillium Web"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

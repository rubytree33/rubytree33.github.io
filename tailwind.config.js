/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

// in case a palette needs to be edited on https://palettte.app/
/*
const logPalette = (name, obj = colors[name]) =>
  console.log(JSON.stringify([{
    paletteName: name,
    swatches: Object.entries(obj).map(([k,v]) => ({
      name: k, color: v
    })),
  }]))

logPalette('rose')
*/

module.exports = {
  content: [
    "./{pages,components}/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Titillium Web"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        ruby: {
          ...colors.rose,
          950: '#691230',
        },
      },
    },
  },
  plugins: [],
}

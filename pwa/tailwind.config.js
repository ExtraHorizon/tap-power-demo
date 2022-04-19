module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#172242',
        medium: '#747A8E',
        light: '#FAFBFF',
        primary: {
          main: '#4975FF',
          light: '#5d88fb',
          dark: '#2C5FFF',
        },
        secondary: {
          dark: '#172242',
          light: '#FAFBFF',
          main: '#a7f7f1',
        },
        accent: {
          primary: {
            light: '#DFFFFD',
            dark: '#74dcef',
          },
          secondary: {
            main: '#FFD28E',
            light: '#FFE8C4',
            dark: '#FFBD58',
          }
        }
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      transitionProperty: {
        'menu-appear': 'max-height, opacity'
      }
    },
  },
  plugins: [],
}

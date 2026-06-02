/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        veil: {
          900: '#0A0813',
          800: '#100D1C',
          700: '#181426',
          600: '#241E38',
        },
        haze: {
          400: '#8A85A6',
          200: '#C3BFD6',
          50:  '#F1EFF8',
        },
      },
      fontFamily: {
        fraunces: ['Fraunces', 'Georgia', 'serif'],
        hanken: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

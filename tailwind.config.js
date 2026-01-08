/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "app/**/*.{vue,js,ts}",
    "components/**/*.{vue,js,ts}",
    "layouts/**/*.{vue,js,ts}",
    "pages/**/*.{vue,js,ts}",
    "plugins/**/*.{js,ts}",
    "app.config.{js,ts}",
    "nuxt.config.{js,ts}"
  ],
  theme: {
    extend: {
      keyframes: {
        spin2: {
          '0%': { transform: 'rotate(0deg)', },
          // '25%': { },
          // '80%': { },
          '100%': { transform: 'rotate(360deg)', },
        },
        spin2rev: {
          '0%': { },
          '25%': { transform: 'rotate(0deg)', },
          // '20%': { },
          // '80%': { },
          '100%': { transform: 'rotate(-360deg)', },
        }
      },
    },
    fontFamily: {
      montserrat: "Montserrat, sans-serif",
      julius: "Julius Sans One, sans-serif",
    },
    container: {
      center: true,
    },
  },
  plugins: [],
}

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
    extend: {},
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

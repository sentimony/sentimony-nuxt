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
      colors: {
        sage: '#b5ccb5',
        'sage-alt': '#a1c0a1',
        crimson: '#8a0202',
        brand: '#1cb884',
      },
      keyframes: {
        spin2: {
          '0%': { transform: 'rotate(0deg)', },
          '100%': { transform: 'rotate(360deg)', },
        },
        spin2rev: {
          '0%': { },
          '25%': { transform: 'rotate(0deg)', },
          '100%': { transform: 'rotate(-360deg)', },
        }
      },
      fontFamily: {
        montserrat: "Montserrat, sans-serif",
        julius: "Julius Sans One, sans-serif",
      },
    },
    container: {
      center: true,
    },
  },
  plugins: [],
}

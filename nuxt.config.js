module.exports = {
  target: "static",
  head: {
    titleTemplate: '%s | Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital@0;1&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Julius+Sans+One&display=swap' },
      // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lekton&display=swap' },
      // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon-v2-green/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon-v2-green/favicon.svg' },
      { rel: 'alternate icon', type: 'image/x-icon', href: '/favicon-v2-green/favicon.ico' },
      { rel: 'manifest', href: '/favicon-v2-green/site.webmanifest' },
    ],
    script: [
      { src: 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4' }
    ]
  },
  components: true,
  loading: {
    color: 'rgba(255,255,255,0.5)',
    height: '5px'
  },
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  },
  plugins: [
    { src: '~/plugins/google-analytics.js', ssr: false },
    { src: '~/plugins/vue-awesome-swiper.js', ssr: true },
    { src: '~/plugins/v-img.js', ssr: false },
    { src: '~/plugins/vue-ripple-directive.js', ssr: false },
    { src: '~/plugins/vue-mq.js', ssr: true },
    '~/plugins/pinia.js',
    // '~/plugins/tailwindcss.js',
  ],
  css: [
    // 'normalize.css/normalize.css',
    // '~/assets/css/tailwind.css',
    'swiper/css/swiper.css',
    '@/assets/scss/swiper-restyle.scss',
    '@/assets/scss/item.scss',
    // 'assets/scss/base.scss',
    'assets/scss/flex-sticky.scss',
    // 'swiper/swiper-bundle.css',
    '@/assets/scss/transitions.scss',
  ],
  modules: [
    'nuxt-facebook-pixel-module',
    // '@nuxtjs/tailwindcss',
  ],
  facebook: {
    track: 'PageView',
    pixelId: 168167750758036,
    version: '2.0',
    disabled: false
  },
  // tailwindcss: {
  //   cssPath: '~/assets/css/tailwind.css'
  // },
  buildModules: [
    '@nuxtjs/composition-api/module',
    // '@nuxt/postcss8',
    // '@nuxtjs/tailwindcss',
  ],
  build: {
    // postcss: {
    //   postcssOptions: {
    //     plugins: {
    //       // tailwindcss: {},
    //       '@tailwindcss/postcss': {},
    //       autoprefixer: {},
    //     }
    //   }
    // },
    // vendor: ['axios'],
    // analyze: {
    //   analyzerMode: 'static'
    // }
  },
  router: {
    scrollBehavior: function(to, from, savedPosition) {
      return { x: 0, y: 0 }
    }
  }
  // generate: {
  //   routes: [
  //   ]
  // }
}

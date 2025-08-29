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
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'alternate icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'manifest', href: '/favicon/site.webmanifest' },
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
    { src: '@/plugins/google-analytics.js', ssr: false },
    { src: '@/plugins/vue-awesome-swiper.js', ssr: true },
    { src: '@/plugins/v-img.js', ssr: false },
    { src: '@/plugins/vue-ripple-directive.js', ssr: false },
    { src: '@/plugins/vue-mq.js', ssr: true },
    { src: '@/plugins/pinia.js', ssr: true },
  ],
  css: [
    'normalize.css/normalize.css',
    'swiper/css/swiper.css',
    '@/assets/scss/base.scss',
    '@/assets/scss/transitions.scss',
  ],
  modules: [
    'nuxt-facebook-pixel-module',
  ],
  facebook: {
    track: 'PageView',
    pixelId: 168167750758036,
    autoPageView: true,
    disabled: false
  },
    buildModules: [
    '@nuxtjs/composition-api/module',
  ],
  build: {
    // analyze: {
    //   analyzerMode: 'static'
    // },
    loaders: {
      scss: {
        implementation: require('sass'),
        sassOptions: {
          api: 'modern',
          silenceDeprecations: ['legacy-js-api']
        }
      },
      sass: {
        implementation: require('sass'),
        sassOptions: {
          api: 'modern',
          silenceDeprecations: ['legacy-js-api']
        }
      }
    },
    // vendor: ['axios'],
  },
  // generate: {
  //   routes: [
  //   ]
  // }
}

module.exports = {
  head: {
    titleTemplate: '%s | Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Julius+Sans+One' },
      { rel: 'shortcut icon', href: 'https://content.sentimony.com/assets/img/favicons/sentimony/favicon-32.png?01' },
      { rel: 'apple-touch-icon', href: 'https://content.sentimony.com/assets/img/favicons/sentimony/favicon-144.png?01' },
    ]
  },
  loading: {
    color: 'rgba(255,255,255,0.5)',
    height: '5px',
  },
  plugins: [
    { src: '~/plugins/google-analytics.js', ssr: false },
    { src: '~/plugins/vue-awesome-swiper.js', ssr: true },
    // { src: '~/plugins/vue-tabs.js', ssr: false },
    { src: '~/plugins/v-img.js', ssr: false },
    { src: '~/plugins/fireauth.js', ssr: false },
    { src: '~/plugins/vue-ripple-directive.js', ssr: false },
    { src: '~/plugins/vue-mq.js', ssr: true },
    { src: '~/plugins/vue-disqus', ssr: true },
  ],
  css: [
    'normalize.css/normalize.css',
    'swiper/css/swiper.css',
    'assets/scss/base.scss',
    // 'swiper/swiper-bundle.css',
    // 'vue-nav-tabs/dist/vue-tabs.min.css',
  ],
  modules: [
    'nuxt-facebook-pixel-module',
  ],
  facebook: {
    track: 'PageView',
    pixelId: 168167750758036,
    version: '2.0',
    disabled: false,
  },
  build: {
    vendor: ['axios'],
    analyze: {
      analyzerMode: 'static'
    }
  },
  router: {
    scrollBehavior: function (to, from, savedPosition) {
      return { x: 0, y: 0 }
    }
  },
  // generate: {
  //   routes: [
  //   ]
  // }
}

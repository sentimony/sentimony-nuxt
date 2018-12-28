// import routes from './assets/json/routes.js'
// const routes = require('./assets/json/routes.js')

module.exports = {
  head: {
    titleTemplate: '%s | Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Julius+Sans+One' },
      { rel: 'shortcut icon', href: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/favi%2Ffavicon-32-site.png?alt=media&token=a060a2ba-68f7-4b4e-b0e4-e04dd2cf7de3' },
      { rel: 'apple-touch-icon', href: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/favi%2Ffavicon-144.jpg?alt=media&token=763f1846-67b5-494e-a980-7c0eb218d28f' }
    ]
  },
  loading: {
    color: 'rgba(255,255,255,0.5)',
    height: '5px'
  },
  plugins: [
    { src: '~/plugins/google-analytics.js', ssr: false },
    { src: '~/plugins/swiper.js', ssr: false },
    { src: '~/plugins/vue-tabs.js', ssr: false },
    { src: '~/plugins/v-img.js', ssr: false },
    { src: '~/plugins/vue-ripple-directive.js', ssr: false },
    { src: '~/plugins/vue-disqus', ssr: true }
  ],
  css: [
    'normalize.css/normalize.css',
    'swiper/dist/css/swiper.css',
    // 'vue-nav-tabs/dist/vue-tabs.min.css'
  ],
  modules: [
    'nuxt-facebook-pixel-module'
  ],
  facebook: {
    track: 'PageView',
    pixelId: 168167750758036,
    version: '2.0',
    disabled: false
  },
  build: {
    // vendor: ['axios'],
    // analyze: {
    //   analyzerMode: 'static'
    // }
  },
  router: {
    scrollBehavior: function (to, from, savedPosition) {
      return { x: 0, y: 0 }
    }
  },
  generate: {
      // routes: routes
      routes: [
      '/release/va-fantazma',
    ]
  }
}

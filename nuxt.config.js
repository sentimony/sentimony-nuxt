const nodeExternals = require('webpack-node-externals')
const resolve = (dir) => require('path').join(__dirname, dir)

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js + Vuetify.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' },
      { rel: 'stylesheet', href: 'https://cdn.materialdesignicons.com/2.2.43/css/materialdesignicons.min.css' }
    ]
  },
  plugins: [
    '~/plugins/vuetify.js',
    '~/plugins/firebase.js'
  ],
  css: [
    '~/assets/style/app.styl'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    babel: {
      plugins: [
        ["transform-imports", {
          "vuetify": {
            "transform": "vuetify/es5/components/${member}",
            "preventFullImport": true
          }
        }]
      ]
    },
    vendor: [
      '~/plugins/vuetify.js',
      '~/plugins/firebase.js'
    ],
    extractCSS: true,
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      if (ctx.isServer) {
        config.externals = [
          nodeExternals({
            whitelist: [/^vuetify/]
          })
        ]
      }
    }
  }
  // },
  // generate: {
  //   routes: [
  //     '/release/va-fantazma',
  //     '/release/va-emptinesses',
  //     '/release/sphingida-origin',
  //     '/release/va-true-story',
  //     '/release/spectrum-vision-lost-space-device',
  //     '/release/irukanji-z-lisu',
  //     '/release/va-ocean-scenes-higher-titans',
  //     '/release/senzar-before-the-morning-sun',
  //     '/release/va-grower',
  //     '/release/va-time-loop-beyond-borders',
  //     '/release/unusual-cosmic-process-weightlessness',
  //     '/release/va-tempo-syndicate',
  //     '/release/va-dancing-mavka',
  //     '/release/va-absence-of-gravity',
  //     '/release/va-special-places',
  //     '/release/hypnotriod-seven-heavenly-edges',
  //     '/release/specialmind-the-missing-particle',
  //     '/release/tentura-aurora',
  //     '/release/cifroteca-roof-raiser-wild-storm',
  //     '/release/psyfactor-retro-scientific',
  //     '/release/va-gamayun-tale',
  //     '/release/tentura-beyond-illusion',
  //     '/release/ufomatka-the-ep',
  //     '/release/va-the-ten',
  //     '/release/zymosis-insight',
  //     '/release/overdream-beautiful-thinking',
  //     '/release/ufomatka-altering-the-synaptic-controllers',
  //     '/release/omnisound-destiny',
  //     '/release/zymosis-nichna',
  //     '/release/va-futured-vol-1',
  //
  //     '/artist/alexander-daf',
  //     '/artist/already-maged',
  //     '/artist/astropilot',
  //     '/artist/calamus',
  //     '/artist/capsula',
  //     '/artist/chronos',
  //     '/artist/cifroteca',
  //     '/artist/crystal-vibe',
  //     '/artist/dagas',
  //     '/artist/daoine-sidhe',
  //     '/artist/eguana',
  //     '/artist/flooting-grooves',
  //     '/artist/harax',
  //     '/artist/heinali',
  //     '/artist/hypnotriod',
  //     '/artist/irukanji',
  //     '/artist/katya-chilly',
  //     '/artist/magmadivers',
  //     '/artist/neirula',
  //     '/artist/overdream',
  //     '/artist/psyfactor',
  //     '/artist/roof-raiser',
  //     '/artist/saikozaurus',
  //     '/artist/senzar',
  //     '/artist/shiva3',
  //     '/artist/shivattva',
  //     '/artist/shizolizer-gin',
  //     '/artist/sky-technology',
  //     '/artist/solcast',
  //     '/artist/specialmind',
  //     '/artist/spectrum-vision',
  //     '/artist/sphingida',
  //     '/artist/sygnals',
  //     '/artist/tentura',
  //     '/artist/tookytooky',
  //     '/artist/ufomatka',
  //     '/artist/unstable-elements',
  //     '/artist/unusual-cosmic-process',
  //     '/artist/vonoom',
  //     '/artist/zymosis',
  //     '/artist/psydewise',
  //     '/artist/kabi',
  //     '/artist/erot',
  //
  //     '/event/shift-space',
  //     '/event/alt-space',
  //     '/event/water-marks',
  //     '/event/home-space',
  //     '/event/five-years',
  //
  //     '/friend/another-dimension',
  //     '/friend/clocktail',
  //     '/friend/moon-koradji',
  //     '/friend/parvati',
  //     '/friend/space-baby',
  //     '/friend/treetrolla',
  //     '/friend/zenon'
  //   ]
  // }
}

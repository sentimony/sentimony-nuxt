module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: "Nuxtjs SSR Firebase Functions",
    meta: [
      {
        charset: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        hid: "description",
        name: "description",
        content: "Nuxt.js project"
      }
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Roboto"
      },
      {
        rel: "stylesheet",
        href: "https://cdn.muicss.com/mui-0.9.35/css/mui.min.css"
      }
    ]
  },

  // <script src="https://cdn.muicss.com/mui-0.9.35/js/mui.min.js"></script>
  /*
   ** Customize the progress bar color
   */
   // mode: "spa",
  loading: {
    color: "#3B8070"
  },
  css: [
    {
      src: "@/assets/styles/main.css",
      lang: "css"
    }
  ],
  /*
   ** Build configuration
   */
  buildDir: "../prod/server/nuxt",
  build: {
    publicPath: "/assets/",
    extractCSS: true,
    // babel: {
    //   presets: [
    //     'es2015',
    //     'stage-0'
    //   ],
    //   plugins: [
    //     ["transform-runtime", {
    //       "polyfill": true,
    //       "regenerator": true
    //     }],
    //   ]
    // },
    /*
     ** Run ESLint on save
     */
    extend(config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        // config.module.rules.push({
        //   enforce: 'pre',
        //   test: /\.(js|vue)$/,
        //   loader: 'eslint-loader',
        //   exclude: /(node_modules)/
        // })
      }
    }
  },
  generate: {
    routes: [
      '/release/va-fantazma',
      '/release/va-emptinesses',
      '/release/sphingida-origin',
      '/release/va-true-story',
      '/release/spectrum-vision-lost-space-device',
      '/release/irukanji-z-lisu',
      '/release/va-ocean-scenes-higher-titans',
      '/release/senzar-before-the-morning-sun',
      '/release/va-grower',
      '/release/va-time-loop-beyond-borders',
      '/release/unusual-cosmic-process-weightlessness',
      '/release/va-tempo-syndicate',
      '/release/va-dancing-mavka',
      '/release/va-absence-of-gravity',
      '/release/va-special-places',
      '/release/hypnotriod-seven-heavenly-edges',
      '/release/specialmind-the-missing-particle',
      '/release/tentura-aurora',
      '/release/cifroteca-roof-raiser-wild-storm',
      '/release/va-gamayun-tale',
      '/release/psyfactor-retro-scientific',
      '/release/ufomatka-the-ep',
      '/release/tentura-beyond-illusion',
      '/release/va-the-ten',
      '/release/zymosis-insight',
      '/release/overdream-beautiful-thinking',
      '/release/ufomatka-altering-the-synaptic-controllers',
      '/release/omnisound-destiny',
      '/release/zymosis-nichna',
      '/release/va-futured-vol-1',
      '/release/psydewise-synaptic-elastic',
      '/release/u-wave-autumn-discovery',
      '/release/va-futured-vol-2',
      '/release/juelz-dependence-ep'
    ]
  }
};

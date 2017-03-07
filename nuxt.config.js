module.exports = {
  head: {
    titleTemplate: '%s | Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { property: 'og:image', content: '' }
    ],
    link: [
      { rel: 'shortcut icon', href: '' },
      { rel: 'apple-touch-icon', href: '' }
    ]
  },
  loading: {
    color: '#666',
    height: '4px'
  },
  plugins: [
    '~plugins/google-analytics.js'
  ],
  build: {
    vendor: ['axios']
  },
  generate: {
    routeParams: {
      '/release/:key': [
        { key: 'va-fantazma' },
        { key: 'va-emtinesses' },
        { key: 'sphingida-origin' },
        { key: 'va-true-story' }
      ]
    }
  }
}

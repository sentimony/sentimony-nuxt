export default {

  state: {
    loadedPages: {
      "home": {
        "title": "Home",
        "slug": "/",
        "fractal": true
      },
      "artists": {
        "title": "Artists",
        "slug": "/artists",
        "fractal": true
      },
      "releases": {
        "title": "Releases",
        "slug": "/releases",
        "fractal": false
      }
    }
  },

  mutations: {
  },

  actions: {
  },

  getters: {
    loadedPages (state) {
      return state.loadedPages
    },
    loadedPage (state) {
      return (pageId) => {
        return state.loadedPages.find((page) => {
          return page.id === pageId
        }) || {}
      }
    }
  }

}

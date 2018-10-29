export default {

  state: {
    loadedPages: {
      "home": {
        "title": "Home"
      },
      "artists": {
        "title": "Artists"
      },
      "releases": {
        "title": "Releases"
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
    }
  }

}

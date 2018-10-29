import { DB } from '@/services/fireinit.js'

export default {

  state: {
    loadedReleases: {
      "va-fantazma": {
        "title": "VA «Fantazma»"
      },
      "va-emptinesses": {
        "title": "VA «Emptinesses»"
      }
    }
  },

  mutations: {
    setLoadedReleases (state, payload) {
      state.loadedReleases = payload
    },
  },

  actions: {
    loadReleases ({commit}) {
      commit('setLoading', true)
      DB.ref('releases').once('value')
        .then((data) => {
          const releases = []
          const obj = data.val()
          for (let key in obj) {
            releases.push({
              // id: key,
              // title: obj[key].title
            })
          }
          commit('setLoadedReleases', releases)
          commit('setLoading', false)
        })
        .catch(
          (error) => {
            console.log(error)
            commit('setLoading', false)
          }
        )
    }
  },

  getters: {
    loadedReleases (state) {
      return state.loadedReleases
    }
  }

}

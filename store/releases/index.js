import firebase, { DB } from '@/services/fireinit.js'

export default {

  state: {
    loadedReleases: []
  },

  mutations: {
    setLoadedReleases (state, payload) {
      state.loadedReleases = payload
    }
  },

  actions: {
    loadReleases ({commit}) {
      commit('setLoading', true)
      firebase.database().ref('releases').once('value')
        .then((data) => {
          const release = []
          const obj = data.val()
          for (let key in obj) {
            release.push({
              id: key,
              title: obj[key].title,
              date: obj[key].date,
              slug: obj[key].slug,
              cat_no: obj[key].cat_no,
              cover: obj[key].cover
            })
          }
          commit('setLoadedReleases', release)
          commit('setLoading', false)
        })
        .catch((error) => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },

  getters: {
    loadedReleases (state) {
      return state.loadedReleases
    },
    loadedReleasesSortedByDate (state, getters) {
      return getters.loadedReleases.sort((itemA, itemB) => {
        return new Date(itemA.date) - new Date(itemB.date)
      }).reverse() || {}
    },
    loadedRelease (state) {
      return (id) => {
        return state.loadedReleases.find((page) => {
          return page.id === id
        }) || {}
      }
    }
  }

}

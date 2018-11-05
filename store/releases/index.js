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
              slug: obj[key].slug,
              title: obj[key].title,
              cat_no: obj[key].cat_no,
              coming_soon: obj[key].coming_soon,
              cover: obj[key].cover,
              new: obj[key].new,
              style: obj[key].style,
              tracks_number: obj[key].tracks_number,
              total_time: obj[key].total_time,
              format: obj[key].format,
              date: obj[key].date,
              upc: obj[key].upc,
              info: obj[key].info,
              credits: obj[key].credits,
              links: obj[key].links,
              tracklist: obj[key].tracklist
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

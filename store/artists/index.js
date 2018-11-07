import firebase, { DB } from '@/services/fireinit.js'

export default {

  state: {
    loadedArtists: []
  },

  mutations: {
    setLoadedArtists (state, payload) {
      state.loadedArtists = payload
    }
  },

  actions: {
    loadArtists ({commit}) {
      commit('setLoading', true)
      firebase.database().ref('artists').once('value')
        .then((data) => {
          const artist = []
          const obj = data.val()
          for (let key in obj) {
            artist.push({
              id: key,
              date: obj[key].date,
              visible: obj[key].visible,
              category_id: obj[key].category_id,
              bandcamp: obj[key].bandcamp,
              discogs: obj[key].discogs,
              facebook: obj[key].facebook,
              location: obj[key].location,
              name: obj[key].name,
              photo: obj[key].photo,
              slug: obj[key].slug,
              soundcloud_id: obj[key].soundcloud_id,
              style: obj[key].style,
              title: obj[key].title,
              website: obj[key].website,
              youtube_id: obj[key].youtube_id,
              frames: obj[key].frames,
              releases: obj[key].releases
            })
          }
          commit('setLoadedArtists', artist)
          commit('setLoading', false)
        })
        .catch((error) => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },

  getters: {
    loadedArtists (state) {
      return state.loadedArtists
    },
    loadedArtistsSortedByDate (state, getters) {
      return getters.loadedArtists.sort((itemA, itemB) => {
        return new Date(itemA.date) - new Date(itemB.date)
      }) || {}
    },
    loadedArtist (state) {
      return (id) => {
        return state.loadedArtists.find((page) => {
          return page.id === id
        }) || {}
      }
    }
  }

}

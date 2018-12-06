import firebase, { DB } from '@/services/fireinit.js'

export default {

  state: {
    loadedSocial: []
  },

  mutations: {
    setLoadedSocial (state, payload) {
      state.loadedSocial = payload
    }
  },

  actions: {
    loadSocial ({commit}) {
      commit('setLoading', true)
      firebase.database().ref('social/data').once('value')
        .then((data) => {
          const social = []
          const obj = data.val()
          for (let key in obj) {
            social.push({
              id: key,
              icon: obj[key].icon,
              isVisibleHeadr: obj[key].isVisibleHeadr,
              isVisibleContacts: obj[key].isVisibleContacts,
              isVisibleFootr: obj[key].isVisibleFootr,
              title: obj[key].title,
              url: obj[key].url
            })
          }
          commit('setLoadedSocial', social)
          commit('setLoading', false)
        })
        .catch((error) => {
          console.log(error)
          commit('setLoading', false)
        })
    }
  },

  getters: {
    loadedSocial (state) {
      return state.loadedSocial
    }
  }

}

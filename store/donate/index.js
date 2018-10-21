import firebase, { DB } from '@/services/fireinit.js'

export default {

  state: {
    loadedDoanteSections: []
  },

  mutations: {
    setLoadedDonateSections (state, payload) {
      state.loadedDoanteSections = payload
    },
    createDonateSection (state, payload) {
      state.loadedDoanteSections.push(payload)
    }
  },

  actions: {
    loadDonateSections ({commit}) {
      commit('setLoading', true)
      firebase.database().ref('donateSection').once('value')
        .then((data) => {
          const donateSections = []
          const obj = data.val()
          for (let key in obj) {
            donateSections.push({
              id: key,
              data: obj[key].data
            })
          }
          commit('setLoadedDonateSections', donateSections)
          commit('setLoading', false)
        })
        .catch((error) => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    createDonateSection ({commit, getters}, payload) {
      const donateSection = {
        data: payload.data
      }
      let key
      firebase.database().ref('donateSection').push(donateSection)
        .then((data) => {
          key = data.key
          return key
        })
        .then(() => {
          commit('createDonateSection', {
            ...donateSection,
            id: key
          })
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },

  getters: {
    loadedDoanteSections (state) {
      return state.loadedDoanteSections.reverse()
    },
    loadedDoanteSection (state) {
      return (id) => {
        return state.loadedDoanteSections.find((page) => {
          return page.id === id
        }) || {}
      }
    }
  }

}

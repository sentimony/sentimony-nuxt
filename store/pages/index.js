import firebase, { DB } from '@/services/fireinit.js'

export default {

  state: {
    loadedPages: []
  },

  mutations: {
    setLoadedPages (state, payload) {
      state.loadedPages = payload
    },
    createPage (state, payload) {
      state.loadedPages.push(payload)
    }
  },

  actions: {
    loadPages ({commit}) {
      commit('setLoading', true)
      firebase.database().ref('pages').once('value')
        .then((data) => {
          const pages = []
          const obj = data.val()
          for (let key in obj) {
            pages.push({
              id: key,
              date: obj[key].date,
              title: obj[key].title,
              slug: obj[key].slug
            })
          }
          commit('setLoadedPages', pages)
          commit('setLoading', false)
        })
        .catch((error) => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    createPage ({commit, getters}, payload) {
      const page = {
        date: payload.date.toISOString(),
        title: payload.title,
        slug: payload.slug
      }
      let key
      firebase.database().ref('pages').push(page)
        .then((data) => {
          key = data.key
          return key
        })
        .then(() => {
          commit('createPage', {
            ...page,
            id: key
          })
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },

  getters: {
    loadedPages (state) {
      return state.loadedPages.reverse()
    },
    loadedPage (state) {
      return (id) => {
        return state.loadedPages.find((page) => {
          return page.id === id
        }) || {}
      }
    }
  }

}

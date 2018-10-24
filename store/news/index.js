import firebase, { DB } from '@/services/fireinit.js'

export default {

  state: {
    loadedNewsList: []
  },

  mutations: {
    setLoadedNewsList (state, payload) {
      state.loadedNewsList = payload
    },
    createNewsItem (state, payload) {
      state.loadedNewsList.push(payload)
    }
  },

  actions: {
    loadNewsList ({commit}) {
      commit('setLoading', true)
      firebase.database().ref('news').once('value')
        .then((data) => {
          const newsList = []
          const obj = data.val()
          for (let key in obj) {
            newsList.push({
              id: key,
              date: obj[key].date,
              slug: obj[key].slug,
              title: obj[key].title,
              url: obj[key].url
            })
          }
          commit('setLoadedNewsList', newsList)
          commit('setLoading', false)
        })
        .catch((error) => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    createNewsItem ({commit, getters}, payload) {
      const newsItem = {
        data: payload.data
      }
      let key
      firebase.database().ref('news').push(newsItem)
        .then((data) => {
          key = data.key
          return key
        })
        .then(() => {
          commit('createNewsItem', {
            ...newsItem,
            id: key
          })
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },

  getters: {
    loadedNewsList (state) {
      return state.loadedNewsList
    },
    loadedNewsListSortedByDate (state, getters) {
      return getters.loadedNewsList.sort((itemA, itemB) => {
        return new Date(itemA.date) - new Date(itemB.date)
      }).reverse() || {}
    },
    loadedNewsItem (state) {
      return (id) => {
        return state.loadedNewsList.find((page) => {
          return page.id === id
        }) || {}
      }
    }
  }

}

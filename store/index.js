import Vuex from 'vuex'
import firebase, {auth, GoogleProvider, DB} from '@/services/fireinit.js'

const createStore = () => {
  return new Vuex.Store({

    state: {
      user: null,
      loading: false,
      loadedPages: []
    },

    mutations: {
      setUser (state, payload) {
        state.user = payload
      },
      setLoading (state, payload) {
        state.loading = payload
      },
      setLoadedPages (state, payload) {
        state.loadedPages = payload
      },
      createPage (state, payload) {
        state.loadedPages.push(payload)
      }
    },

    actions: {
      autoSignIn ({commit}, payload) {
        commit('setUser', payload)
      },
      signInWithGoogle ({commit}) {
        return new Promise((resolve, reject) => {
          auth.signInWithRedirect(GoogleProvider)
          resolve()
        })
      },
      logOut ({commit}) {
        auth.signOut()
        commit('setUser', null)
      },
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
          .catch(
            (error) => {
              console.log(error)
              commit('setLoading', false)
            }
          )
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
        }
    },

    getters: {
      loading (state) {
        return state.loading
      },
      user (state) {
        return state.user
      },
      userIsAuthenticated (state, getters) {
        return !!getters.user
      },
      loadedPages (state) {

          return state.loadedPages
      },
      loadedPage (state) {
        return (id) => {
          return state.loadedPages.find((page) => {
            return page.id === id
          }) || {}
        }
      }
    }

  })
}

export default createStore

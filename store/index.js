import Vuex from 'vuex'
import firebase, {auth, GoogleProvider, DB} from '@/services/fireinit.js'

import donate from './donate'

const createStore = () => {
  return new Vuex.Store({

    modules: {
      donate: donate
    },

    state: {
      user: null,
      loading: false,
      loadedPages: [],
      // loadedDoanteSections: []
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
      },
      // setLoadedDonateSections (state, payload) {
      //   state.loadedDoanteSections = payload
      // },
      // createDonateSection (state, payload) {
      //   state.loadedDoanteSections.push(payload)
      // },
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
        },
        // loadDonateSections ({commit}) {
        //   commit('setLoading', true)
        //   firebase.database().ref('donateSection').once('value')
        //     .then((data) => {
        //       const donateSections = []
        //       const obj = data.val()
        //       for (let key in obj) {
        //         donateSections.push({
        //           id: key,
        //           data: obj[key].data
        //         })
        //       }
        //       commit('setLoadedDonateSections', donateSections)
        //       commit('setLoading', false)
        //     })
        //     .catch(
        //       (error) => {
        //         console.log(error)
        //         commit('setLoading', false)
        //       }
        //     )
        // },
        // createDonateSection ({commit, getters}, payload) {
        //   const donateSection = {
        //     data: payload.data
        //   }
        //   let key
        //   firebase.database().ref('donateSection').push(donateSection)
        //     .then((data) => {
        //       key = data.key
        //       return key
        //     })
        //     .then(() => {
        //       commit('createDonateSection', {
        //         ...donateSection,
        //         id: key
        //       })
        //     })
        //     .catch((error) => {
        //       console.log(error)
        //     })
        // },
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
        return state.loadedPages.reverse()
      },
      loadedPage (state) {
        return (id) => {
          return state.loadedPages.find((page) => {
            return page.id === id
          }) || {}
        }
      },
      // loadedDoanteSections (state) {
      //   return state.loadedDoanteSections.reverse()
      // },
      // loadedDoanteSection (state) {
      //   return (id) => {
      //     return state.loadedDoanteSections.find((page) => {
      //       return page.id === id
      //     }) || {}
      //   }
      // }
    },

  })
}

export default createStore

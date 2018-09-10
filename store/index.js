import Vuex from 'vuex'
import firebase, {auth, GoogleProvider, DB} from '@/services/fireinit.js'
// import * as firebase from 'firebase'
// import {DB} from '@/services/fireinit.js'

const createStore = () => {
  return new Vuex.Store({

    state: {
      user: null,
      loadedReleases: [],
      loading: false
    },

    mutations: {
      setLoading (state, payload) {
        state.loading = payload
      },
      setUser (state, payload) {
        state.user = payload
      },
      setLoadedReleases (state, payload) {
        state.loadedReleases = payload
      },
      createRelease (state, payload) {
        state.loadedReleases.push(payload)
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
      loadReleases ({commit}) {
        commit('setLoading', true)
        firebase.database().ref('releases2').once('value')
          .then((data) => {
            const releases = []
            const obj = data.val()
            for (let key in obj) {
              releases.push({
                id: key,
                title: obj[key].title,
                date: obj[key].date
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
      },
      createRelease ({commit, getters}, payload) {
        const release = {
          title: payload.title,
          date: payload.date.toISOString()
        }
        let key
        firebase.database().ref('releases2').push(release)
          .then((data) => {
            key = data.key
            return key
          })
          .then(() => {
            commit('createRelease', {
              ...release,
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
      // activeUser: (state, getters) => {
      //   return state.user
      // },
      user (state) {
        return state.user
      },
      userIsAuthenticated (state, getters) {
        return !!getters.user
      },
      loadedReleases (state) {
        return state.loadedReleases
      }
    }

  })
}

export default createStore

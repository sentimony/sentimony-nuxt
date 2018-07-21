import Vuex from 'vuex'
import firebase, {auth, GoogleProvider} from '@/services/fireinit.js'

const createStore = () => {
  return new Vuex.Store({
    state: {
      user: null
    },

    getters: {
      // activeUser: (state, getters) => {
      //   return state.user
      // },
      user (state) {
        return state.user
      },
      userIsAuthenticated (state, getters) {
        return !!getters.user
      }
    },

    mutations: {
      setUser (state, payload) {
        state.user = payload
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
        firebase.auth().signOut()
        commit('setUser', null)
      }
    }
  })
}

export default createStore

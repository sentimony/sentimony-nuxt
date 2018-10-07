import Vuex from 'vuex'
import firebase, {auth, GoogleProvider, DB} from '@/services/fireinit.js'

import pages from './pages'
import donate from './donate'

const createStore = () => {
  return new Vuex.Store({

    modules: {
      pages: pages,
      donate: donate
    },

    state: {
      user: null,
      loading: false
    },

    mutations: {
      setUser (state, payload) {
        state.user = payload
      },
      setLoading (state, payload) {
        state.loading = payload
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
      }
    }

  })
}

export default createStore

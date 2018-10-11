import firebase, {DB} from '@/services/fireinit.js'

export default {

  state: {
    user: null
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
      auth.signOut()
      commit('setUser', null)
    }
  },

  getters: {
    user (state) {
      return state.user
    },
    userIsAuthenticated (state, getters) {
      return !!getters.user
    }
  }

}

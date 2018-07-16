import * as firebase from 'firebase'

export const state = () => ({
  loading: false,
  user: null,
  error: null,
  admins: [
    'px81QbZqcPdP15uB88dDYHXOB5G2',
    'px81QbZqcPdP15uB88dDYHXOB5G2'
  ]
})

export const mutations = {
  setLoading (state, payload) {
    state.loading = payload
  },
  setUser (state, payload) {
    state.user = payload
  },
  setError (state, payload) {
    state.error = payload
  },
  clearError (state) {
    state.error = null
  }
}

export const actions = {
  signUserUp ({commit}, payload) {
    commit('setLoading', true)
    commit('clearError')
    firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
      .then(
        user => {
          commit('setLoading', false)
          const newUser = {
            id: user.uid,
            email: user.email
          }
          commit('setUser', newUser)
        }
      )
      .catch(
        error => {
          commit('setLoading', false)
          commit('setError', error)
          console.log(error)
        }
      )
  },
  signUserIn ({commit}, payload) {
    commit('setLoading', true)
    commit('clearError')
    firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
      .then(
        user => {
          commit('setLoading', false)
          const newUser = {
            id: user.uid,
            email: user.email
          }
          commit('setUser', newUser)
        }
      )
      .catch(
        error => {
          commit('setLoading', false)
          commit('setError', error)
          console.log(error)
        }
      )
  },
  autoLogin ({commit}, payload) {
    commit('setUser', {
      id: payload.uid,
      email: payload.email
    })
  },
  logout ({commit}) {
    firebase.auth().signOut()
    commit('setUser', null)
  },
  clearError ({commit}) {
    commit('clearError')
  }
}

export const getters = {
  loading (state) {
    return state.loading
  },
  user (state) {
    return state.user
  },
  userIsAuthenticated (state, getters) {
    return !!getters.user
  },
  currentUserId (state, getters) {
    if (!getters.userIsAuthenticated) {
      return false
    }
    return getters.user && getters.user.id
  },
  userIsAdmin (state, getters) {
    if (state.admins.findIndex((admin) => {
      return admin === getters.currentUserId
    }) === -1) {
      return false
    }
    return true
  },
  error (state) {
    return state.error
  }
}

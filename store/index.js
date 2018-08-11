import Vuex from 'vuex'
import firebase, {auth, GoogleProvider, DB} from '@/services/fireinit.js'
// import * as firebase from 'firebase'
// import {DB} from '@/services/fireinit.js'

const createStore = () => {
  return new Vuex.Store({
    state: {
      loading: false,
      user: null,
      loadedItems: []
    },

    mutations: {
      setLoading (state, payload) {
        state.loading = payload
      },
      setUser (state, payload) {
        state.user = payload
      },
      setLoadedItems (state, payload) {
        state.loadedItems = payload
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
      loadItems ({commit}) {
        commit('setLoading', true)
        DB.ref('items').once('value')
          .then((data) => {
            const items = []
            const obj = data.val()
            for (let key in obj) {
              items.push({
                id: key,
                slug: obj[key].slug,
                title: obj[key].title,
                // creatorId: obj[key].creatorId,
                // imageUrl: obj[key].imageUrl,
                // date: obj[key].date,
                // lotteryId: obj[key].lotteryId,
                // isWinnerWeek: obj[key].isWinnerWeek,
                // isWinnerMonth: obj[key].isWinnerMonth,
                // isWinnerContest: obj[key].isWinnerContest,
                // isModerated: obj[key].isModerated
              })
            }
            commit('setLoadedItems', items)
            commit('setLoading', false)
          })
          .catch(
            (error) => {
              console.log(error)
              commit('setLoading', false)
            }
          )
      },
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
      loadedItems (state) {
        return state.loadedItems
      }
    }
  })
}

export default createStore

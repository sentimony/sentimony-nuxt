import Vuex from 'vuex'
import firebase, {DB} from '@/services/fireinit.js'

const createStore = () => {
  return new Vuex.Store({
    state: {
      loading: false,
      loadedReleases: {
        "va-fantazma": {
          "title": "VA «Fantazma»"
        },
        "va-emptinesses": {
          "title": "VA «Emptinesses»"
        }
      }
    },

    mutations: {
      setLoading (state, payload) {
        state.loading = payload
      },
      setLoadedReleases (state, payload) {
        state.loadedReleases = payload
      },
    },

    actions: {
      loadReleases ({commit}) {
        commit('setLoading', true)
        DB.ref('releases').once('value')
          .then((data) => {
            const releases = []
            const obj = data.val()
            for (let key in obj) {
              releases.push({
                // id: key,
                // title: obj[key].title
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
    },

    getters: {
      loading (state) {
        return state.loading
      },
      loadedReleases (state) {
        return state.loadedReleases
      },
    }
  })
}

export default createStore

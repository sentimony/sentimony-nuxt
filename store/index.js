import Vuex from 'vuex'
import tabs from './tabs'
import loading from './loading'
import social from './social'

const createStore = () => {
  return new Vuex.Store({
     modules: {
      tabs,
      loading,
      social
    }
   })
}

export default createStore

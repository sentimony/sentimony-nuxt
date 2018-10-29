import Vuex from 'vuex'

import loading from './loading'
import pages from './pages'
import releases from './releases'

const createStore = () => {
  return new Vuex.Store({

    modules: {
      loading: loading,
      pages: pages,
      releases: releases
    }

  })
}

export default createStore

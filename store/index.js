import Vuex from 'vuex'
// import firebase, {auth, GoogleProvider, DB} from '@/services/fireinit.js'
import * as firebase from 'firebase'

import pages from './pages'
import donate from './donate'
import user from './user'
import shared from './shared'

const createStore = () => {
  return new Vuex.Store({

    modules: {
      pages: pages,
      donate: donate,
      user: user,
      shared: shared
    }

  })
}

export default createStore

import Vuex from 'vuex'
 // import pages from './pages'
import releases from './releases'
import frame from './frame'
// import artists from './artists'
// import news from './news'
// import events from './events'
// import friends from './friends'
// import donate from './donate'
// import user from './user'
import loading from './loading'

const createStore = () => {
  return new Vuex.Store({
     modules: {
      // pages: pages,
      releases: releases,
      frame: frame,
      // artists: artists,
      // news: news,
      // events: events,
      // friends: friends,
      // error: error,
      // donate: donate,
      // user: user,
      loading: loading
    }
   })
}

export default createStore

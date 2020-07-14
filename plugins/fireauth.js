// import { auth } from '@/services/fireinit.js'

export default (context) => {
  const {store} = context
  store.dispatch('loadReleases')
  store.dispatch('loadArtists')
  store.dispatch('loadSocial')

  // return new Promise((resolve, reject) => {
  //   auth.onAuthStateChanged(user => {
  //     store.commit('setUser', user)
  //     resolve()
  //   })
  // })
}

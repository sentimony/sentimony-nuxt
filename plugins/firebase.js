import * as firebase from 'firebase'

// import firebase from 'firebase/app'
// import 'firebase/auth'
// import 'firebase/database'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyCTVGdSsE6h8PA6WOeqxgzyCgX4L3eOoNE',
    authDomain: 'sentimony-db.firebaseapp.com',
    databaseURL: 'https://sentimony-db.firebaseio.com',
    projectId: 'sentimony-db',
    storageBucket: 'sentimony-db.appspot.com',
    messagingSenderId: '724792675849'
  })
  // firebase.auth().onAuthStateChanged((user) => {
  //   if (user) {
  //     this.$store.dispatch('autoLogin', user)
  //   }
  // })
}

// import fireinit from '@/services/fireinit.js'

// export default (context) => {
//   const {store} = context
//
//   return new Promise((resolve, reject) => {
//     auth.onAuthStateChanged(user => {
//       store.commit('setUser', user)
//       resolve()
//     })
//   })
// }

// export default (context) => {
//   const {store} = context
//
//   return new Promise((resolve, reject) => {
//     firebase.onAuthStateChanged(user => {
//       store.commit('setUser', user)
//       resolve()
//     })
//   })
// }

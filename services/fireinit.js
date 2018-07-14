import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

// var config = {
//   apiKey: 'AIzaSyCTVGdSsE6h8PA6WOeqxgzyCgX4L3eOoNE',
//   authDomain: 'sentimony-db.firebaseapp.com',
//   databaseURL: 'https://sentimony-db.firebaseio.com',
//   projectId: 'sentimony-db',
//   storageBucket: 'sentimony-db.appspot.com',
//   messagingSenderId: '724792675849'
// }

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

// !firebase.apps.length ? firebase.initializeApp(config) : ''
// export const GoogleProvider = new firebase.auth.GoogleAuthProvider()
export const auth = firebase.auth()
export const DB = firebase.database()
export default firebase

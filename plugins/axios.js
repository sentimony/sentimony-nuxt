import axios from 'axios'

export default axios.create({
  baseURL: 'https://sentimony-nuxt.firebaseio.com/'
})

import Vue from 'vue'
import { PiniaVuePlugin, createPinia } from 'pinia'

Vue.use(PiniaVuePlugin)

export default (context, inject) => {
  const pinia = createPinia()
  context.app.pinia = pinia
  inject('pinia', pinia)
}
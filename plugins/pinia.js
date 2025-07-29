import { PiniaVuePlugin, createPinia } from 'pinia'
import Vue from 'vue'

Vue.use(PiniaVuePlugin)

export default (context, inject) => {
  const pinia = createPinia()
  context.app.pinia = pinia
  inject('pinia', pinia)
}
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

export function withSetup<T>(composable: () => T): { result: T, wrapper: VueWrapper } {
  let result!: T
  const wrapper = mount(defineComponent({
    setup() {
      result = composable()
      return () => h('div')
    },
  }))
  return { result, wrapper }
}

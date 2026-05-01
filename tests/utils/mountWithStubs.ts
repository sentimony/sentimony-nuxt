import { mountSuspended } from '@nuxt/test-utils/runtime'

type MountOptions = Parameters<typeof mountSuspended>[1]

export function mountWithStubs<T>(component: T, options: MountOptions = {}) {
  return mountSuspended(component as Parameters<typeof mountSuspended>[0], {
    ...options,
    global: {
      ...options?.global,
      stubs: {
        ClientOnly: { template: '<div><slot /></div>' },
        Icon: { template: '<i class="icon-stub" :data-name="name"></i>', props: ['name', 'size'] },
        NuxtLink: { template: '<a><slot :isActive="false" :isExactActive="false" /></a>', props: ['to', 'href', 'activeClass', 'exactActiveClass'] },
        ...options?.global?.stubs,
      },
      directives: {
        wave: () => {},
        ...options?.global?.directives,
      },
    },
  })
}

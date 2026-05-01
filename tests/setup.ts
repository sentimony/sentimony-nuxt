import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi, beforeEach } from 'vitest'

const { userMock, navigateToMock } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    userMock: ref<{ id: string } | null>(null),
    navigateToMock: vi.fn(),
  }
})

mockNuxtImport('useSupabaseUser', () => () => userMock)
mockNuxtImport('navigateTo', () => navigateToMock)

export { userMock, navigateToMock }

vi.stubGlobal('defineEventHandler', <T,>(fn: T) => fn)

beforeEach(() => {
  userMock.value = null
  navigateToMock.mockClear()
  vi.stubGlobal('$fetch', vi.fn())
  document.body.style.overflow = ''
})

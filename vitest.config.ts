import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['tests/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '#supabase/server': fileURLToPath(new URL('./tests/mocks/supabase-server.ts', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})

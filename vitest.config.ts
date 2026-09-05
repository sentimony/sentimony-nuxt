import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/nuxt/**/*.test.ts'],
    setupFiles: ['tests/setup/nitro-globals.ts'],
    restoreMocks: true,
  },
})

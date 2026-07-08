import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['tests/setup/nitro-globals.ts'],
  },
})

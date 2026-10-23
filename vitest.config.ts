import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

/**
 * Тесты — только для чистых модулей сервера (парсер уроков). Nuxt-окружение здесь
 * не поднимаем: разбор markdown не зависит ни от `useStorage`, ни от HTTP.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV === 'development'

/** Dev-аудит практики читает чужой проект; путь задаётся окружением, не кодом. */
const practiceProjectRoot = process.env.NUXT_PRACTICE_PROJECT_ROOT ?? ''

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  /** Исходники приложения в `app/`. Каталог `server/` — в корне репозитория. */
  srcDir: 'app/',

  css: ['~/assets/styles/main.scss'],

  modules: ['@nuxt/eslint', '@pinia/nuxt'],

  eslint: {
    config: {
      stylistic: false,
    },
  },

  devtools: {
    /** В production-сборке DevTools не подключаем — меньше шум и размер. */
    enabled: isDev,
    timeline: { enabled: isDev },
  },

  typescript: {
    strict: true,
    /** Проверка типов на `nuxt build` / `nuxt generate`, без замедления каждого сохранения в dev */
    typeCheck: 'build',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Бэкенд Nuxt fullstack',
      titleTemplate: '%s — Бэкенд Nuxt fullstack',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#010101' },
        {
          name: 'description',
          content:
            'Двенадцать уроков про серверную часть Nuxt: два рантайма, event, слои fetch, ошибки, валидация, база, сессия, кеш, storage, задачи и деплой.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'ru_RU' },
        { property: 'og:site_name', content: 'Бэкенд Nuxt fullstack' },
        { name: 'twitter:card', content: 'summary' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
        },
      ],
    },
  },

  /** Публичные ключи доступны на клиенте; секреты — только в корне `runtimeConfig` без `public` */
  runtimeConfig: {
    /** Корень проекта практики (Olimp). Пусто или нет пути — аудит отвечает `available: false`. */
    practiceRoot: practiceProjectRoot,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Бэкенд Nuxt fullstack',
    },
  },

  features: {
    /** Логи Nuxt devtools в production не нужны */
    devLogs: isDev,
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: ['app/assets/styles'],
        },
      },
    },
    build: {
      target: 'esnext',
      cssMinify: true,
    },
  },

  nitro: {
    compressPublicAssets: true,
    /**
     * Уроки, playbook и план курса едут в серверный бандл как ассеты:
     * в dev читаются с диска, в `.output` — из встроенного хранилища.
     * Копий текстов в репозитории не появляется.
     */
    serverAssets: [{ baseName: 'class', dir: 'class' }],
  },

  /** Кеш каталога уроков — только в проде: в dev правки markdown должны быть видны сразу. */
  routeRules: isDev
    ? {}
    : {
        '/api/lessons': { swr: 3600 },
        '/api/lessons/**': { swr: 3600 },
        '/api/playbook': { swr: 3600 },
        '/api/cards': { swr: 3600 },
      },
})

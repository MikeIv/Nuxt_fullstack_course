import type { PracticeCheck } from '#shared/types/practice'

/**
 * Карта практики: что в боевом проекте (`NUXT_PRACTICE_PROJECT_ROOT`, по умолчанию —
 * Olimp_fitnes_landing) доказывает, что тема урока уже применена.
 *
 * Правила:
 * - пути только относительные и только из этого файла — запрос не может подсунуть свой;
 * - `grep` — эвристика по регулярке, поэтому в UI рядом с машинным фактом стоит ручная галочка;
 * - `expect: 'absent'` — проверка на отсутствие: совпадение значит нарушение;
 * - `manual` — то, что машинно не проверить, отметка ставится руками.
 *
 * Пути сверены с реальной структурой проекта: `server/{api,utils,middleware,error-handler.ts,
 * auth.config.ts}`, `shared/{types,validations,config,utils}`, `prisma`, `app/{composables,pages}`.
 */
export const PRACTICE_MAP: Record<string, PracticeCheck[]> = {
  'two-runtimes': [
    {
      id: 'shared-types',
      title: 'Общие типы вынесены в shared/',
      kind: 'dir',
      path: 'shared/types',
      note: 'Мост между app/ и server/ — только shared.',
    },
    {
      id: 'no-app-import-in-server',
      title: 'Сервер не импортирует код приложения',
      kind: 'grep',
      path: 'server',
      pattern: 'from [\'"](?:~|~~|#app|@)/(?:composables|components|pages)',
      expect: 'absent',
      note: 'Совпадение = зависимость серверного бандла от клиентского кода.',
    },
    {
      id: 'no-server-import-in-app',
      title: 'Приложение не импортирует серверный код',
      kind: 'grep',
      path: 'app',
      pattern: 'from [\'"](?:#server|~/server|~~/server)',
      expect: 'absent',
      note: 'Через границу проходят только типы из shared/, иначе — утечка сервера в бандл.',
    },
  ],
  'event-contract': [
    {
      id: 'middleware-context',
      title: 'Middleware кладёт данные в event.context',
      kind: 'grep',
      path: 'server/middleware',
      pattern: 'event\\.context',
    },
    {
      id: 'context-read',
      title: 'Обработчик читает event.context',
      kind: 'grep',
      path: 'server/api',
      pattern: 'event\\.context',
      note: 'Если контекст никто не читает, middleware работает вхолостую.',
    },
    {
      id: 'helpers-from-event',
      title: 'Данные запроса берутся хелперами h3',
      kind: 'grep',
      path: 'server',
      pattern: 'readBody\\(|getQuery\\(|readValidatedBody\\(',
    },
  ],
  'fetch-layers': [
    {
      id: 'ofetch-client',
      title: 'Есть единый HTTP-клиент на ofetch',
      kind: 'grep',
      path: 'app/composables/useApi.ts',
      pattern: '\\$fetch\\.create',
    },
    {
      id: 'server-client',
      title: 'Серверный клиент вынесен в server/utils',
      kind: 'file',
      path: 'server/utils/serverApi.ts',
    },
    {
      id: 'fetch-for-render',
      title: 'Данные для рендера идут через useFetch/useAsyncData',
      kind: 'grep',
      path: 'app',
      pattern: 'useFetch\\(|useAsyncData\\(',
    },
  ],
  'error-contract': [
    {
      id: 'error-handler',
      title: 'Есть общий обработчик ошибок Nitro',
      kind: 'file',
      path: 'server/error-handler.ts',
    },
    {
      id: 'api-handler',
      title: 'Обработчики API идут через обёртку с конвертом',
      kind: 'grep',
      path: 'server/utils/apiHandler.ts',
      pattern: 'successResponse|errorResponse',
    },
    {
      id: 'api-types',
      title: 'Конверт ответа объявлен в shared/types',
      kind: 'file',
      path: 'shared/types/api.ts',
    },
    {
      id: 'status-message',
      title: 'Отказы отдают statusMessage/statusText, а не внутренний текст',
      kind: 'grep',
      path: 'server',
      pattern: 'statusMessage|statusText',
      note: 'h3 знает оба имени: `statusText` — старый алиас `statusMessage`.',
    },
  ],
  'state-server-vs-client': [
    {
      id: 'no-global-state',
      title: 'В shared нет модульного ref()/reactive()',
      kind: 'grep',
      path: 'shared',
      pattern: '^export const \\w+ = (?:ref|reactive)\\(',
      expect: 'absent',
      note: 'Модульный ref живёт один на процесс — это общее состояние всех пользователей.',
    },
    {
      id: 'composable-state',
      title: 'Состояние пользователя — через composable или useFetch',
      kind: 'grep',
      path: 'app/composables',
      pattern: 'useState\\(|useFetch\\(|useAsyncData\\(',
    },
  ],
  'validation-boundary': [
    {
      id: 'zod-schema',
      title: 'Схема валидации объявлена один раз',
      kind: 'grep',
      path: 'shared/validations',
      pattern: "from 'zod'|require\\('zod'\\)",
    },
    {
      id: 'api-validates-body',
      title: 'Граница сервера валидирует тело запроса',
      kind: 'grep',
      path: 'server/api',
      pattern: 'validateBody|readValidatedBody|readBody',
    },
    {
      id: 'validation-util',
      title: 'Валидация вынесена в server/utils',
      kind: 'file',
      path: 'server/utils/validation.ts',
    },
  ],
  'database-from-nitro': [
    {
      id: 'prisma-client',
      title: 'Клиент базы создаётся в server/utils',
      kind: 'file',
      path: 'server/utils/prisma.ts',
    },
    {
      id: 'schema',
      title: 'Схема и миграции в репозитории',
      kind: 'file',
      path: 'prisma/schema.prisma',
    },
    {
      id: 'prisma-usage',
      title: 'Доменный код ходит в базу через общий клиент',
      kind: 'grep',
      path: 'server/utils',
      pattern: 'prisma\\.',
      note: 'Клиент не создаётся в обработчиках: иначе пул соединений вырастет с числом запросов.',
    },
  ],
  'auth-session': [
    {
      id: 'server-middleware',
      title: 'Проверка сессии — в server/middleware',
      kind: 'file',
      path: 'server/middleware/auth.ts',
    },
    {
      id: 'require-role',
      title: 'Роль проверяется на сервере',
      kind: 'grep',
      path: 'server/utils/requireRole.ts',
      pattern: 'requireUserSession|createError|statusCode',
    },
    {
      id: 'auth-config',
      title: 'Конфигурация auth вынесена в server/',
      kind: 'file',
      path: 'server/auth.config.ts',
    },
    {
      id: 'login-page',
      title: 'Вход идёт через auth-клиент, а не ручной fetch с токеном',
      kind: 'grep',
      path: 'app/pages/login.vue',
      pattern: 'useSignIn|useAuth|signIn',
      note: 'Настоящий признак — httpOnly-cookie в ответе сервера, его видно только глазами.',
    },
  ],
  'cache-route-rules': [
    {
      id: 'route-rules',
      title: 'Правила кеша заданы на путь',
      kind: 'grep',
      path: 'nuxt.config.ts',
      pattern: 'routeRules',
    },
    {
      id: 'cached-handler',
      title: 'Точечный кеш — через defineCachedEventHandler',
      kind: 'grep',
      path: 'server',
      pattern: 'defineCachedEventHandler|cachedFunction',
    },
    {
      id: 'personal-no-cache',
      title: 'Персональные роуты живут без кеша',
      kind: 'manual',
      path: '',
      note: 'Глазами: в routeRules нет swr/isr для путей, которые читают cookie и сессию.',
    },
  ],
  'storage-layer': [
    {
      id: 'use-storage',
      title: 'Файлы идут через useStorage',
      kind: 'grep',
      path: 'server',
      pattern: 'useStorage\\(',
    },
    {
      id: 'storage-config',
      title: 'Драйвер хранилища задан конфигом',
      kind: 'grep',
      path: 'nuxt.config.ts',
      pattern: 'storage\\s*:',
    },
    {
      id: 'no-fs-in-handler',
      title: 'В обработчиках нет прямого fs/path',
      kind: 'grep',
      path: 'server/api',
      pattern: "from 'node:(?:fs|fs/promises|path)'",
      expect: 'absent',
      note: 'Совпадение = деплой привязан к рантайму с локальным диском.',
    },
  ],
  'long-tasks': [
    {
      id: 'tasks-dir',
      title: 'Долгие задачи вынесены в server/tasks',
      kind: 'dir',
      path: 'server/tasks',
    },
    {
      id: 'run-task',
      title: 'Роут запускает задачу, а не ждёт её',
      kind: 'grep',
      path: 'server',
      pattern: 'runTask\\(',
    },
    {
      id: 'stream-or-poll',
      title: 'Статус отдаётся стримом или опросом',
      kind: 'grep',
      path: 'server',
      pattern: 'createEventStream|text/event-stream|setInterval\\(',
      note: 'Эвристика: важно, что ожидание не держит обработчик запроса открытым.',
    },
  ],
  'deploy-secrets': [
    {
      id: 'node-preset',
      title: 'Пресет деплоя зафиксирован в конфиге',
      kind: 'grep',
      path: 'nuxt.config.ts',
      pattern: "preset:\\s*'node-server'",
    },
    {
      id: 'env-example',
      title: 'Переменные перечислены в .env.example',
      kind: 'file',
      path: '.env.example',
    },
    {
      id: 'no-secrets-in-app-scope',
      title: 'Секреты не попадают в публичный app-бандл',
      kind: 'grep',
      path: 'app',
      pattern: 'process\\.env',
      expect: 'absent',
      note: 'В app/ переменные окружения не читают: только runtimeConfig.',
    },
  ],
}

/** Проверки урока; неизвестный slug — пустой список. */
export function practiceChecksFor(slug: string): PracticeCheck[] {
  return PRACTICE_MAP[slug] ?? []
}

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
 * Пути сверены с реальной структурой проекта: `server/{api,utils,middleware,plugins,routes,
 * error-handler.ts, auth.config.ts}`, `shared/{types,validations,config,utils}`, `prisma`,
 * `app/{composables,pages,stores}`, `docker-compose.yml`, `.gitlab-ci.yml`.
 *
 * Сверка 2026-10: проект достроен (админка блоков, загрузка медиа, Better Auth), поэтому
 * проверки по медиа, схемам контента и базе добавлены, а те, что машинно врут на новом
 * коде, заменены на `manual` с объяснением. `missing` — факт «в проекте этого нет», а не
 * ошибка курса: так видно, что ещё не сделано.
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
      kind: 'manual',
      path: '',
      note:
        'В проекте практики контекст заполняет `server/middleware/auth.ts`, а обработчики ' +
        'берут сессию через `requireUserSession`: чтение контекста спрятано в хелпере, машинно ' +
        'его не отличить от записи. Глазами: если контекст только пишут и никто не читает — ' +
        'middleware лишний.',
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
    {
      id: 'error-mapping',
      title: 'Ошибка домена переводится в конверт в одном месте',
      kind: 'grep',
      path: 'server/utils/errorMapping.ts',
      pattern: 'statusCode',
      note:
        'Zod, Prisma и h3-ошибка сводятся к одной форме: обработчики не собирают ответ ' +
        'каждый по-своему.',
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
    {
      id: 'content-schemas',
      title: 'Схемы контента объявлены до обработчиков',
      kind: 'grep',
      path: 'shared/validations/content.ts',
      pattern: 'contentSchemas|z\\.object',
      note: 'Одна схема на запись блока и на его чтение — иначе админка и API расходятся.',
    },
    {
      id: 'media-limits',
      title: 'Лимиты загрузки объявлены в shared',
      kind: 'grep',
      path: 'shared/validations/media.ts',
      pattern: 'MEDIA_MAX_BYTES',
      note: 'Размер и типы файлов — общий контракт сервера и подсказки в UI.',
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
    {
      id: 'local-db',
      title: 'Локальная база поднимается контейнером',
      kind: 'grep',
      path: 'docker-compose.yml',
      pattern: 'postgres',
      note:
        'Свой Postgres в docker плюс shadow-база для `prisma migrate dev` — dev-окружение ' +
        'не зависит от машины. На serverless так не выйдет: там база внешняя.',
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
      pattern: 'requireUserSession\\(|requireRole\\(',
      note:
        'Проверка роли — отдельный хелпер, который бросает 401/403 до выполнения обработчика. ' +
        'Одна и та же строка работает и на `nuxt-auth-utils`, и на Better Auth: имена хелперов ' +
        'совпадают.',
    },
    {
      id: 'auth-module',
      title: 'Auth-модуль подключён конфигом',
      kind: 'grep',
      path: 'nuxt.config.ts',
      pattern: 'better-auth|auth-utils',
      note: 'Модуль выбирается один раз и приносит серверные хелперы сессии.',
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
      id: 'cache-headers',
      title: 'Неизменяемые файлы отдаются с долгим cache-control',
      kind: 'grep',
      path: 'server',
      pattern: 'cache-control',
      note:
        'В проекте практики `routeRules` пока нет: кеш живёт заголовком на раздаче загрузок. ' +
        'Персональные ручки при этом остаются без кеша — это и есть третий уровень.',
    },
    {
      id: 'personal-no-cache',
      title: 'Персональные роуты живут без кеша',
      kind: 'manual',
      path: '',
      note: 'Глазами: у путей, которые читают cookie или сессию, нет ни `swr`/`isr`, ни `defineCachedEventHandler`.',
    },
  ],
  'storage-layer': [
    {
      id: 'use-storage',
      title: 'Файлы идут через useStorage',
      kind: 'grep',
      path: 'server',
      pattern: 'useStorage\\(',
      note:
        'В проекте практики драйвера нет: загрузки пишутся своим кодом на `node:fs`. Это ' +
        'осознанный выбор под `node-server` — но он и есть цена привязки к диску.',
    },
    {
      id: 'storage-config',
      title: 'Драйвер хранилища задан конфигом',
      kind: 'grep',
      path: 'nuxt.config.ts',
      pattern: 'storage\\s*:',
    },
    {
      id: 'uploads-dir',
      title: 'Каталог загрузок вынесен из public/',
      kind: 'grep',
      path: 'nuxt.config.ts',
      pattern: 'uploadsDir',
      note:
        '`uploads/` вне `public/` переживает пересборку `.output`. Файлы отдаёт nitro-роут ' +
        '`server/routes/uploads/[...path].get.ts`, а не статика.',
    },
    {
      id: 'media-utils',
      title: 'Запись файлов живёт в server/utils, а не в обработчике',
      kind: 'file',
      path: 'server/utils/media.ts',
      note:
        'Граница та же, что у Prisma-клиента: обработчик не трогает `fs` и `path` напрямую. ' +
        'Перенос на S3 меняет один файл вместо всех ручек загрузки.',
    },
  ],
  'long-tasks': [
    {
      id: 'tasks-dir',
      title: 'Долгие задачи вынесены в server/tasks',
      kind: 'dir',
      path: 'server/tasks',
      note:
        'В проекте практики задач пока нет: `missing` здесь — «ещё не сделано», а не поломка ' +
        'курса. Практика урока делается в своём проекте.',
    },
    {
      id: 'run-task',
      title: 'Роут запускает задачу, а не ждёт её',
      kind: 'grep',
      path: 'server',
      pattern: 'runTask\\(',
      note: 'Ожидание внутри обработчика держит соединение и упирается в таймаут платформы.',
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
    {
      id: 'ci-pipeline',
      title: 'Сборка и деплой идут пайплайном',
      kind: 'grep',
      path: '.gitlab-ci.yml',
      pattern: '^verify:|^build:|^deploy:',
      note: 'Секреты живут в переменных CI, а не в репозитории; артефакт — `.output`.',
    },
  ],
}

/** Проверки урока; неизвестный slug — пустой список. */
export function practiceChecksFor(slug: string): PracticeCheck[] {
  return PRACTICE_MAP[slug] ?? []
}

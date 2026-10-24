/**
 * `GET /api/lessons` — каталог курса: арки, уроки, суммарное время.
 *
 * Кеш ответа живёт в `routeRules` и только в проде: в dev его нет, иначе правка
 * `class/**` не видна до перезапуска сервера.
 */
export default defineEventHandler(() => getLessonIndex())

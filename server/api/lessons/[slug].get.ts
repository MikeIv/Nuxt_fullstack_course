/**
 * `GET /api/lessons/[slug]` — урок целиком: блоки, оглавление, практика, источники.
 *
 * Кеш ответа живёт в `routeRules` и только в проде: в dev его нет, иначе правка
 * `class/**` не видна до перезапуска сервера.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusText: 'Не указан урок' })
  }

  const lesson = await getLessonDetail(slug)

  if (!lesson) {
    throw createError({ statusCode: 404, statusText: 'Урок не найден' })
  }

  return lesson
})

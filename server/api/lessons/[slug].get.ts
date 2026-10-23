/**
 * `GET /api/lessons/[slug]` — урок целиком: блоки, оглавление, практика, источники.
 * Ключ кеша — только существующий slug из каталога, поэтому мусорные пути не плодят записи.
 */
export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({ statusCode: 400, statusText: 'Не указан урок' })
    }

    const lesson = await getLessonDetail(slug)

    if (!lesson) {
      throw createError({ statusCode: 404, statusText: 'Урок не найден' })
    }

    return lesson
  },
  {
    name: 'lesson-detail',
    getKey: (event) => getRouterParam(event, 'slug') ?? 'unknown',
    maxAge: 60 * 60,
    swr: true,
  },
)

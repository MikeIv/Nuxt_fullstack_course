/**
 * `GET /api/lessons` — каталог курса: арки, уроки, суммарное время.
 * Ответ мемоизируется на процесс: тексты уроков меняются только вместе со сборкой.
 */
export default defineCachedEventHandler(() => getLessonIndex(), {
  name: 'lessons-index',
  getKey: () => 'index',
  maxAge: 60 * 60,
  swr: true,
})

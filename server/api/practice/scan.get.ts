/**
 * `GET /api/practice/scan` — аудит боевого проекта по карте практики.
 *
 * Ручка живёт только в dev: в проде она не регистрируется вовсе, потому что читает
 * файловую систему за пределами приложения. Содержимое файлов наружу не отдаётся —
 * только факты (`exists`, `bytes`, номера совпавших строк).
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusText: 'Аудит проекта доступен только в dev' })
  }

  const root = useRuntimeConfig(event).practiceRoot
  setHeader(event, 'cache-control', 'no-store')

  return scanPractice(root)
})

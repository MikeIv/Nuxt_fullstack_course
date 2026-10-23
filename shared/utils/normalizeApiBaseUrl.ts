/**
 * Приводит `NUXT_PUBLIC_API_BASE` / `runtimeConfig.public.apiBase` к виду для `ofetch` `baseURL`.
 * Пустая строка и пробелы → `undefined` (запросы пойдут на текущий origin без префикса).
 */
export function normalizeApiBaseUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.replace(/\/+$/, '')
}

/**
 * Склеивает базу API и сегмент пути в один URL (без двойных слэшей между базой и путём).
 * Без базы возвращает путь с ведущим `/`, если его не было.
 */
export function joinApiUrl(base: unknown, pathSegment: string): string {
  const b = normalizeApiBaseUrl(base)
  const trimmed = pathSegment.trim()
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  if (!b) return path
  return `${b}${path}`
}

import type { H3Event } from 'h3'
import { normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'

/**
 * HTTP-клиент из Nitro к внешнему API с тем же `public.apiBase`, что на клиенте.
 * Передавайте `event` в обработчиках, если позже понадобится проксировать заголовки / cookies.
 */
export function serverApi(event?: H3Event) {
  const config = event ? useRuntimeConfig(event) : useRuntimeConfig()
  const baseURL = normalizeApiBaseUrl(config.public.apiBase)

  return $fetch.create({
    baseURL,
    onResponseError(ctx) {
      if (import.meta.dev) {
        console.error('[serverApi]', String(ctx.request), ctx.response.status, ctx.response._data)
      }
    },
  })
}

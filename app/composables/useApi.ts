import { joinApiUrl, normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'

/**
 * Императивный HTTP-клиент (`ofetch`) с `baseURL` из `runtimeConfig.public.apiBase`.
 * Используйте в обработчиках, плагинах и `useAsyncData` + ручной вызов.
 */
export function useApi() {
  const baseURL = normalizeApiBaseUrl(useRuntimeConfig().public.apiBase)

  return $fetch.create({
    baseURL,
    onResponseError(ctx) {
      if (import.meta.dev) {
        console.error('[useApi]', String(ctx.request), ctx.response.status, ctx.response._data)
      }
    },
  })
}

/**
 * Реактивный `useFetch` к тому же API, что и {@link useApi}: URL собирается из `apiBase` + путь.
 * Второй аргумент — без `baseURL` и без дженерика на `UseFetchOptions` (ограничение типов Nuxt 4);
 * тип ответа задаётся параметром `T` у возвращаемого `AsyncData<T, …>`.
 */
export function useApiFetch<T = unknown>(
  path: MaybeRefOrGetter<string>,
  options?: Omit<UseFetchOptions<unknown>, 'baseURL'>,
): AsyncData<T, FetchError | null> {
  const config = useRuntimeConfig()

  const request = computed(() => joinApiUrl(config.public.apiBase, String(toValue(path))))

  return useFetch(request, options) as AsyncData<T, FetchError | null>
}

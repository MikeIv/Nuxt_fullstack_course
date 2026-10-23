import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'

import type { CardsPayload, LessonDetail, LessonIndex, Playbook } from '#shared/types/lesson'

/**
 * Каталог курса. `key` фиксированный: шапка и страница курса делят один запрос,
 * а payload приходит с сервера вместе с HTML.
 */
export function useLessonIndex(): AsyncData<LessonIndex, FetchError | null> {
  return useApiFetch<LessonIndex>('/api/lessons', { key: 'lessons-index' })
}

/** Один урок по slug. Ключ зависит от slug, чтобы переходы не показывали чужой урок. */
export function useLessonDetail(slug: string): AsyncData<LessonDetail, FetchError | null> {
  return useApiFetch<LessonDetail>(`/api/lessons/${slug}`, { key: `lesson-${slug}` })
}

/** Правила из `playbook.md`. */
export function usePlaybook(): AsyncData<Playbook, FetchError | null> {
  return useApiFetch<Playbook>('/api/playbook', { key: 'playbook' })
}

/** Карточки-конспекты из `cards.md`. */
export function useCards(): AsyncData<CardsPayload, FetchError | null> {
  return useApiFetch<CardsPayload>('/api/cards', { key: 'cards' })
}

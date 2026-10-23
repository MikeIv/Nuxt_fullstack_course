import { defineStore } from 'pinia'

import type { LessonSummary } from '#shared/types/lesson'

/** Три отметки урока: прочитан, практика сделана, правило взято в работу. */
export interface LessonProgress {
  read: boolean
  practice: boolean
  rule: boolean
  /** Отмеченные шаги практики: `{ "1": true }`. */
  steps: Record<string, boolean>
}

export type LessonStatus = 'done' | 'partial' | 'none'

const STORAGE_KEY = 'nuxt-fullstack-course:progress:v1'

const EMPTY: LessonProgress = { read: false, practice: false, rule: false, steps: {} }

export type ProgressField = 'read' | 'practice' | 'rule'

/**
 * Прогресс живёт в localStorage: курс локальный, регистрации нет.
 * Гидратация — только на клиенте (`onMounted` в лейауте), поэтому SSR и первый
 * клиентский рендер совпадают и разметка не «прыгает».
 */
export const useProgressStore = defineStore('progress', () => {
  const lessons = ref<Record<string, LessonProgress>>({})
  const hydrated = ref(false)

  function ensure(slug: string): LessonProgress {
    lessons.value[slug] ??= { ...EMPTY }

    return lessons.value[slug]
  }

  function load() {
    if (!import.meta.client) return

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        lessons.value = normalizeProgress(parsed)
      }
    } catch {
      // Битые данные не должны ломать курс: начинаем заново.
      lessons.value = {}
    } finally {
      hydrated.value = true
    }
  }

  function save() {
    if (!import.meta.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons.value))
    } catch {
      // Приватный режим или переполнение — прогресс просто не сохранится.
    }
  }

  function toggle(slug: string, field: ProgressField) {
    const entry = ensure(slug)
    entry[field] = !entry[field]
    save()
  }

  function toggleStep(slug: string, index: number) {
    const entry = ensure(slug)
    const key = String(index)
    entry.steps[key] = !entry.steps[key]
    save()
  }

  function mark(slug: string, field: ProgressField, value: boolean) {
    ensure(slug)
    lessons.value[slug] = { ...lessons.value[slug], [field]: value } as LessonProgress
    save()
  }

  function reset() {
    lessons.value = {}
    save()
  }

  function statusOf(slug: string): LessonStatus {
    const entry = lessons.value[slug]
    if (!entry) return 'none'
    if (entry.read && entry.practice) return 'done'
    if (entry.read || entry.practice || entry.rule) return 'partial'

    return 'none'
  }

  /** Счётчики по всему курсу: по ним рисуется полоса прогресса в шапке. */
  const stats = computed(() => {
    const all = Object.values(lessons.value)
    const done = all.filter((entry) => entry.read && entry.practice).length
    const read = all.filter((entry) => entry.read).length
    const practice = all.filter((entry) => entry.practice).length

    return { done, read, practice }
  })

  /** Первый урок, где не закрыто «прочитан»; иначе первый с незакрытой практикой. */
  function nextLesson(lessonsList: LessonSummary[]): LessonSummary | null {
    return (
      lessonsList.find((lesson) => !lessons.value[lesson.slug]?.read) ??
      lessonsList.find((lesson) => !lessons.value[lesson.slug]?.practice) ??
      null
    )
  }

  function exportJson(): string {
    return JSON.stringify({ version: 1, lessons: lessons.value }, null, 2)
  }

  function importJson(raw: string): boolean {
    try {
      const parsed: unknown = JSON.parse(raw)
      const normalized = normalizeProgress(parsed)

      if (Object.keys(normalized).length === 0) return false

      lessons.value = normalized
      save()

      return true
    } catch {
      return false
    }
  }

  return {
    lessons,
    hydrated,
    stats,
    load,
    save,
    toggle,
    toggleStep,
    mark,
    reset,
    statusOf,
    nextLesson,
    exportJson,
    importJson,
  }
})

/** Приведение неизвестного JSON из localStorage к известной форме. */
function normalizeProgress(value: unknown): Record<string, LessonProgress> {
  if (!isRecord(value)) return {}

  const source = isRecord(value.lessons) ? value.lessons : value
  const result: Record<string, LessonProgress> = {}

  for (const [slug, raw] of Object.entries(source)) {
    if (!isRecord(raw)) continue

    result[slug] = {
      read: raw.read === true,
      practice: raw.practice === true,
      rule: raw.rule === true,
      steps: normalizeSteps(raw.steps),
    }
  }

  return result
}

function normalizeSteps(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) return {}

  const steps: Record<string, boolean> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (raw === true) steps[key] = true
  }

  return steps
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

import type { ArcId, PracticeKind } from '#shared/types/lesson'

/** Подписи типов практики — в одном месте: карточка, читалка, фильтры. */
const PRACTICE_LABEL: Record<PracticeKind, string> = {
  'quick-win': 'Quick Win',
  'deep-focus': 'Deep Focus',
  admin: 'Admin',
}

/** Акцент арки: цвет тега и заливки в интерфейсе. */
export type ArcAccent = 'pink' | 'orange' | 'cyan'

const ARC_ACCENT: Record<ArcId, ArcAccent> = {
  1: 'pink',
  2: 'orange',
  3: 'cyan',
}

export function practiceLabel(kind: PracticeKind): string {
  return PRACTICE_LABEL[kind]
}

export function arcAccent(arc: ArcId): ArcAccent {
  return ARC_ACCENT[arc]
}

/** `01` для плашки номера урока. */
export function formatNumber(value: number): string {
  return String(value).padStart(2, '0')
}

/** `15 мин` без «минут» — компактно для карточек. */
export function formatMinutes(minutes: number): string {
  return minutes > 0 ? `${minutes} мин` : 'без практики'
}

/** Время чтения всего курса: `2 ч 45 мин`. */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours === 0) return `${rest} мин`

  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`
}

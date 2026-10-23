/**
 * Контракты синхронизации практики с боевым проектом (`NUXT_PRACTICE_PROJECT_ROOT`).
 * Типы общие: карту проверок читает и сервер (скан), и клиент (подписи в чек-листе).
 */

/** Как проверяется пункт практики. */
export type PracticeCheckKind = 'file' | 'dir' | 'grep' | 'manual'

export interface PracticeCheck {
  /** Стабильный id внутри урока: `student-context`, `zod-schema`. */
  id: string
  title: string
  kind: PracticeCheckKind
  /** Путь относительно корня проекта практики. Для `manual` — пустая строка. */
  path: string
  /**
   * Регулярное выражение для `grep` (строка, чтобы пережить сериализацию в JSON).
   * Отсутствует у `file` / `dir` / `manual`.
   */
  pattern?: string
  /**
   * Чего ждём от `grep`: `present` — совпадение подтверждает пункт,
   * `absent` — совпадение означает нарушение. По умолчанию `present`.
   */
  expect?: 'present' | 'absent'
  /** Пояснение, что именно проверяется и почему машинная проверка может врать. */
  note?: string
}

/** Результат проверки одного пункта на сервере. */
export interface PracticeCheckResult {
  checkId: string
  status: 'done' | 'missing' | 'partial'
  /** Размер файла в байтах, если он есть. */
  bytes?: number
  /** Номера строк, где найдено совпадение по `pattern` (содержимое строк не отдаётся). */
  lines?: number[]
}

export interface LessonAudit {
  slug: string
  root: string
  /** `root` существует и доступен на чтение. */
  available: boolean
  results: PracticeCheckResult[]
  checkedAt: string
}

/** Ответ ручки `GET /api/practice/scan` (есть только в dev). */
export interface PracticeAuditPayload {
  root: string
  /** Корень проекта найден и читается. */
  available: boolean
  checkedAt: string
  audits: LessonAudit[]
}

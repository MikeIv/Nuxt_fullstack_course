/**
 * Контракты курса. Общие для `app/` и `server/` — не тянут ни Vue, ни Nitro.
 * Источник данных — markdown-файлы в `class/`, парсит их `server/utils/lessonParser.ts`.
 */

/** Арка курса: модель → данные → прод. */
export type ArcId = 1 | 2 | 3

/** Тип практики из заголовка «Попробуй · Deep Focus · 15 мин». */
export type PracticeKind = 'quick-win' | 'deep-focus' | 'admin'

export interface TocItem {
  /** Идентификатор якоря внутри страницы урока. */
  id: string
  title: string
  level: 2 | 3
}

export interface LessonSource {
  url: string
  /** Домен и путь без схемы — для подписи ссылки. */
  label: string
  /** URL есть в реестре `sources.json`: страница реально открывалась при подготовке. */
  verified: boolean
}

export interface PracticeStep {
  /** Порядковый номер шага, начиная с 1. */
  index: number
  /** Первая строка шага без markdown-разметки. */
  title: string
  /** Тело шага: код и пояснения, готовый HTML. */
  html: string
}

export interface LessonPractice {
  kind: PracticeKind
  /** Как тип назван в уроке: «Deep Focus», «Quick Win», «Admin». */
  label: string
  minutes: number
  /** Готовый HTML списка шагов. */
  html: string
  steps: PracticeStep[]
}

export type LessonBlock =
  | { type: 'prose'; html: string }
  | { type: 'heading'; id: string; title: string; level: 2 | 3 }
  | { type: 'code'; lang: string; code: string; html: string }
  | { type: 'diagram'; code: string }
  | { type: 'callout'; variant: 'idea' | 'note' | 'warning'; html: string }
  | { type: 'table'; html: string }

export interface LessonSummary {
  /** `two-runtimes` — путь строится как `/lessons/<slug>`. */
  slug: string
  number: number
  title: string
  arc: ArcId
  minutes: number
  practiceKind: PracticeKind
  idea: string[]
  /** Правило урока текстом: для метаданных, поиска и aria. */
  rule: string
  /** То же правило с inline-кодом: для карточек правил. */
  ruleHtml: string
  sourceCount: number
}

export interface LessonDetail extends LessonSummary {
  toc: TocItem[]
  blocks: LessonBlock[]
  practice: LessonPractice
  sources: LessonSource[]
  /** Проверки по проекту практики; наполняются в волне 6. */
  projectChecks: PracticeCheck[]
}

export interface Arc {
  id: ArcId
  title: string
  subtitle: string
  lessons: LessonSummary[]
}

export interface LessonIndex {
  arcs: Arc[]
  lessons: LessonSummary[]
  /** Суммарное время чтения в минутах. */
  totalMinutes: number
}

/** Правило из `class/playbook.md`. */
export interface PlaybookRule {
  number: number
  title: string
  /** Ключ связи с уроком: `01` … `12`. */
  key: string
  rule: string
  /** Правило с inline-кодом — так его показываем на странице playbook. */
  ruleHtml: string
}

export interface Playbook {
  rules: PlaybookRule[]
}

/** Карточка-конспект урока из `class/cards.md`. */
export interface LessonCard {
  number: number
  title: string
  slug: string
  bullets: string[]
  /** Правило урока с inline-кодом. */
  ruleHtml: string
  /** Тип практики и время как в карточке: «Deep Focus · 15 мин». */
  practice: string
}

export interface CardsPayload {
  cards: LessonCard[]
}

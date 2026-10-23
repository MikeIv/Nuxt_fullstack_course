import { parseLesson } from './lessonParser'
import type { ParsedLesson } from './lessonParser'
import { highlightBlocks } from './highlight'
import { createMarkdown, plainText } from './markdown'

import { verifiedSources } from '#shared/data/sources.generated'
import type {
  Arc,
  ArcId,
  LessonDetail,
  LessonIndex,
  LessonSummary,
  Playbook,
  PlaybookRule,
} from '#shared/types/lesson'

interface LessonFile {
  slug: string
  number: number
  /** Путь ключа в storage: `01-two-runtimes:lesson.md`. */
  key: string
}

interface ClassAssets {
  lessons: LessonFile[]
  plan: string
  playbook: string
}

const LESSON_FILE = /^(\d{2})-([a-z0-9-]+)[:/]lesson\.md$/i

/** Кеш разбора на процесс: в dev не используется, чтобы правки уроков были видны сразу. */
let cached: { lessons: ParsedLesson[]; plan: string; playbook: string } | null = null

async function readClassAssets(): Promise<ClassAssets> {
  const storage = useStorage('assets:class')
  const keys = await storage.getKeys()
  const lessons: LessonFile[] = []

  for (const key of keys) {
    const match = LESSON_FILE.exec(key)
    if (!match?.[1] || !match[2]) continue

    lessons.push({ number: Number(match[1]), slug: match[2], key })
  }

  lessons.sort((a, b) => a.number - b.number)

  const [plan, playbook] = await Promise.all([
    storage.getItem<string>('lesson-plan.md'),
    storage.getItem<string>('playbook.md'),
  ])

  return { lessons, plan: plan ?? '', playbook: playbook ?? '' }
}

async function loadAll(): Promise<{ lessons: ParsedLesson[]; plan: string; playbook: string }> {
  if (cached && !import.meta.dev) return cached

  const assets = await readClassAssets()
  const storage = useStorage('assets:class')

  const lessons = await Promise.all(
    assets.lessons.map(async (file) => {
      const source = (await storage.getItem<string>(file.key)) ?? ''

      return parseLesson({
        slug: file.slug,
        number: file.number,
        source,
        verifiedUrls: verifiedSources,
      })
    }),
  )

  cached = { lessons, plan: assets.plan, playbook: assets.playbook }

  return cached
}

function toSummary(lesson: ParsedLesson, arc: ArcId): LessonSummary {
  return {
    slug: lesson.slug,
    number: lesson.number,
    title: lesson.title,
    arc,
    minutes: lesson.minutes,
    practiceKind: lesson.practiceKind,
    idea: lesson.idea,
    rule: lesson.rule,
    ruleHtml: lesson.ruleHtml,
    sourceCount: lesson.sources.length,
  }
}

function arcOf(number: number): ArcId {
  if (number <= 4) return 1
  if (number <= 8) return 2
  return 3
}

const ARC_FALLBACK: Record<ArcId, { title: string; subtitle: string }> = {
  1: {
    title: 'Сервер внутри фреймворка',
    subtitle: 'Модель: два рантайма, event как контракт, ошибки.',
  },
  2: {
    title: 'Данные и доверие',
    subtitle: 'Что живёт на сервере, чему нельзя верить, где сессия.',
  },
  3: { title: 'Прод-поведение', subtitle: 'Кеш, файлы, долгие задачи, деплой.' },
}

/** Названия арок и их модели — из `lesson-plan.md`; при сбое парсинга остаются подписи-заглушки. */
function parseArcs(plan: string): Record<ArcId, { title: string; subtitle: string }> {
  const arcs = { ...ARC_FALLBACK }
  const blocks = plan.split(/^## /m).slice(1)

  for (const block of blocks) {
    const firstLine = block.split('\n', 1)[0] ?? ''
    const match = /^Арка\s+([123])\.\s*(.+)$/.exec(firstLine.trim())
    if (!match?.[1] || !match[2]) continue

    const id = Number(match[1]) as ArcId
    const modelLine = block
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.toLowerCase().startsWith('модель:'))

    arcs[id] = {
      title: match[2].trim(),
      subtitle: modelLine
        ? modelLine.replace(/^модель:\s*/i, '').replace(/\.$/, '')
        : arcs[id].subtitle,
    }
  }

  return arcs
}

/** Каталог курса: арки с уроками, суммарное время. */
export async function getLessonIndex(): Promise<LessonIndex> {
  const { lessons, plan } = await loadAll()
  const arcsMeta = parseArcs(plan)
  const arcs: Arc[] = ([1, 2, 3] as const).map((id) => ({
    id,
    title: arcsMeta[id].title,
    subtitle: arcsMeta[id].subtitle,
    lessons: lessons
      .filter((lesson) => arcOf(lesson.number) === id)
      .map((lesson) => toSummary(lesson, id)),
  }))

  const summaries = arcs.flatMap((arc) => arc.lessons)

  return {
    arcs,
    lessons: summaries,
    totalMinutes: summaries.reduce((total, lesson) => total + lesson.minutes, 0),
  }
}

/** Один урок: данные каталога плюс тело, оглавление, практика и источники. */
export async function getLessonDetail(slug: string): Promise<LessonDetail | null> {
  const { lessons } = await loadAll()
  const lesson = lessons.find((item) => item.slug === slug)
  if (!lesson) return null

  const arc = arcOf(lesson.number)
  const blocks = await highlightBlocks(lesson.blocks)

  return {
    ...toSummary(lesson, arc),
    toc: lesson.toc,
    blocks,
    practice: lesson.practice,
    sources: lesson.sources,
    projectChecks: [],
  }
}

/** Правила курса из `playbook.md` — по одному на урок. */
export async function getPlaybook(): Promise<Playbook> {
  const { playbook } = await loadAll()
  const md = createMarkdown()
  const rules: PlaybookRule[] = []
  const blocks = playbook.split(/^### /m).slice(1)

  for (const block of blocks) {
    const [heading = '', ...rest] = block.split('\n')
    const match = /^(\d{2})\.\s*(.+)$/.exec(heading.trim())
    if (!match?.[1] || !match[2]) continue

    const ruleRaw = rest
      .map((line) => line.replace(/^>\s?/, '').trim())
      .filter(Boolean)
      .join(' ')

    rules.push({
      number: Number(match[1]),
      key: match[1],
      title: match[2].trim(),
      rule: plainText(ruleRaw),
      ruleHtml: md.renderInline(ruleRaw),
    })
  }

  return { rules }
}

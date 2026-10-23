import { createMarkdown, plainText, renderBlocks } from './markdown'
import type { RenderEnv } from './markdown'

import type {
  LessonBlock,
  LessonPractice,
  LessonSource,
  PracticeKind,
  PracticeStep,
  TocItem,
} from '#shared/types/lesson'

/** Всё, что удаётся вытащить из одного `lesson.md` (без проверок проекта практики). */
export interface ParsedLesson {
  slug: string
  number: number
  title: string
  idea: string[]
  /** Правило урока текстом (без разметки) и с inline-кодом. */
  rule: string
  ruleHtml: string
  minutes: number
  practiceKind: PracticeKind
  practiceLabel: string
  practice: LessonPractice
  sources: LessonSource[]
  toc: TocItem[]
  blocks: LessonBlock[]
}

export interface ParseLessonInput {
  /** Каталог урока без числового префикса: `two-runtimes`. */
  slug: string
  /** Числовой префикс каталога: `1`. */
  number: number
  source: string
  /** Реестр проверенных URL (`sources.json`) — для отметки источников. */
  verifiedUrls?: readonly string[]
}

interface Section {
  title: string
  body: string
}

const PRACTICE_HEADING = /^Попробуй\s*·\s*(.+?)\s*·\s*(\d+)\s*мин/i
const RULE_HEADING = /^Правило в playbook$/i
const SOURCES_HEADING = /^Источники$/i

const PRACTICE_KIND: Record<string, PracticeKind> = {
  'quick win': 'quick-win',
  'deep focus': 'deep-focus',
  admin: 'admin',
}

/** Разбор урока целиком. Функция чистая: markdown на входе, данные на выходе. */
export function parseLesson(input: ParseLessonInput): ParsedLesson {
  const md = createMarkdown()
  const env: RenderEnv = { headingSeq: 0, toc: [] }
  const { preamble, sections } = splitSections(input.source)

  const heading = /^#\s+Урок\s+(\d+)\.\s*(.+)$/m.exec(preamble)
  const title = heading ? plainText(heading[2] ?? '') : `Урок ${input.number}`
  const number = heading ? Number(heading[1]) : input.number

  const idea = extractIdea(preamble)
  const blocks: LessonBlock[] = []

  // Лид: H1 уже рисует страница, а карточку «Идея в трёх строках» показываем отдельно.
  const preambleBlocks = renderBlocks(md, preamble.replace(/^#\s+.*$/m, ''), env).filter(
    (block) => !(block.type === 'callout' && /идея в трёх строках/i.test(block.html)),
  )
  blocks.push(...preambleBlocks)

  let ruleRaw = ''
  let sources: LessonSource[] = []
  let practice: LessonPractice = emptyPractice()

  for (const section of sections) {
    const practiceMatch = PRACTICE_HEADING.exec(section.title)

    if (practiceMatch) {
      practice = parsePractice(md, section.body, {
        label: practiceMatch[1] ?? 'Практика',
        minutes: Number(practiceMatch[2] ?? 0),
      })
      continue
    }

    if (RULE_HEADING.test(section.title)) {
      ruleRaw = extractBlockquote(section.body)
      continue
    }

    if (SOURCES_HEADING.test(section.title)) {
      sources = extractSources(section.body, input.verifiedUrls ?? [])
      continue
    }

    blocks.push(...renderBlocks(md, `## ${section.title}\n\n${section.body}`, env))
  }

  return {
    slug: input.slug,
    number,
    title,
    idea,
    rule: plainText(ruleRaw),
    ruleHtml: ruleRaw ? md.renderInline(ruleRaw) : '',
    minutes: practice.minutes,
    practiceKind: practice.kind,
    practiceLabel: practice.label,
    practice,
    sources,
    toc: env.toc,
    blocks,
  }
}

/** Тело до первого `##` и список секций верхнего уровня. */
function splitSections(source: string): { preamble: string; sections: Section[] } {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const preamble: string[] = []
  const sections: Section[] = []
  let current: Section | null = null
  let fenced = false

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) fenced = !fenced

    if (!fenced && line.startsWith('## ')) {
      if (current) sections.push(current)
      current = { title: line.slice(3).trim(), body: '' }
      continue
    }

    if (current) current.body += `${line}\n`
    else preamble.push(line)
  }

  if (current) sections.push(current)

  return {
    preamble: preamble.join('\n'),
    sections: sections.map((section) => ({ ...section, body: section.body.trim() })),
  }
}

/** Пункты «Идеи в трёх строках» из лид-цитаты; продолжения строк склеиваются. */
function extractIdea(preamble: string): string[] {
  const lines = preamble.split('\n')
  const start = lines.findIndex((line) => /идея в трёх строках/i.test(line))
  if (start === -1) return []

  const items: string[] = []
  for (const line of lines.slice(start + 1)) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('>')) break

    const text = trimmed.replace(/^>\s?/, '').trim()
    if (!text) break

    if (text.startsWith('- ')) items.push(text.slice(2).trim())
    else if (items.length > 0) items[items.length - 1] += ` ${text}`
  }

  return items.map((item) => plainText(item)).filter(Boolean)
}

/** Текст цитаты одной строкой: правило урока. */
function extractBlockquote(body: string): string {
  return body
    .split('\n')
    .map((line) => line.replace(/^>\s?/, '').trim())
    .filter(Boolean)
    .join(' ')
}

function extractSources(body: string, verifiedUrls: readonly string[]): LessonSource[] {
  const urls = body.match(/https?:\/\/[^\s)]+/g) ?? []
  const unique = [...new Set(urls.map((url) => url.replace(/[.,;]$/, '')))]

  return unique.map((url) => ({
    url,
    label: url.replace(/^https?:\/\//, ''),
    verified: verifiedUrls.includes(url),
  }))
}

function emptyPractice(): LessonPractice {
  return { kind: 'deep-focus', label: 'Практика', minutes: 0, html: '', steps: [] }
}

function parsePractice(
  md: ReturnType<typeof createMarkdown>,
  body: string,
  meta: { label: string; minutes: number },
): LessonPractice {
  const html = md.render(body)
  const kind = PRACTICE_KIND[meta.label.toLowerCase()] ?? 'deep-focus'

  return {
    kind,
    label: meta.label,
    minutes: meta.minutes,
    html,
    steps: extractSteps(md, body),
  }
}

/** Шаги практики: заголовок для чек-листа и HTML с кодом для чтения. */
function extractSteps(md: ReturnType<typeof createMarkdown>, body: string): PracticeStep[] {
  const tokens = md.parse(body, {})
  const steps: PracticeStep[] = []
  let depth = 0
  let itemStart = -1
  let title = ''
  let titleTaken = false

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!token) continue

    if (token.type === 'ordered_list_open') depth += 1

    if (token.type === 'list_item_open' && depth === 1) {
      itemStart = index
      title = ''
      titleTaken = false
    }

    if (itemStart >= 0 && !titleTaken && token.type === 'inline') {
      title = stepTitle(token.content)
      titleTaken = true
    }

    if (token.type === 'list_item_close' && depth === 1 && itemStart >= 0) {
      const inner = tokens.slice(itemStart + 1, index)
      const html = md.renderer.render(inner, md.options, {}).trim()

      steps.push({
        index: steps.length + 1,
        title: title || `Шаг ${steps.length + 1}`,
        html,
      })

      itemStart = -1
      title = ''
      titleTaken = false
    }

    if (token.type === 'ordered_list_close') depth -= 1
  }

  return steps
}

/** Заголовок шага: первое предложение без разметки, не длиннее 110 символов. */
function stepTitle(value: string): string {
  const text = plainText(value)
  const firstSentence = /^(.{20,}?[.!?])(\s|$)/.exec(text)?.[1] ?? text

  return firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trimEnd()}…` : firstSentence
}

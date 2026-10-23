import MarkdownItCallable from 'markdown-it'

import type { MarkdownIt } from 'markdown-it'

import type { LessonBlock, TocItem } from '#shared/types/lesson'

/** Токен markdown-it, выведенный из типа `parse`, — без ручного импорта внутренних типов. */
export type MdToken = ReturnType<MarkdownIt['parse']>[number]

/** Состояние одного прохода: сквозная нумерация якорей и собранное оглавление. */
export interface RenderEnv {
  headingSeq: number
  toc: TocItem[]
}

/** Инстанс markdown-it для уроков: HTML разрешён (файлы свои), ссылки автолинкуются. */
export function createMarkdown(): MarkdownIt {
  return new MarkdownItCallable({
    html: true,
    linkify: true,
    typographer: false,
  })
}

/** Пустой markdown-инлайн в строку: `**Зачем это.**` → `Зачем это.`. */
export function plainText(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Следующий якорь: `s1`, `s2`, … — стабилен, читается в URL и не зависит от шрифта. */
function nextHeadingId(env: RenderEnv): string {
  env.headingSeq += 1
  return `s${env.headingSeq}`
}

/**
 * Разбор тела секции в блоки для управления на клиенте.
 * Код и схемы остаются отдельными блоками, чтобы страница могла их подсветить,
 * отрисовать и дать кнопку «скопировать»; всё остальное идёт HTML-ом.
 */
export function renderBlocks(md: MarkdownIt, body: string, env: RenderEnv): LessonBlock[] {
  const tokens = md.parse(body, {})
  const blocks: LessonBlock[] = []
  let proseStart = 0

  const flushProse = (end: number) => {
    if (end <= proseStart) return
    const html = renderSlice(md, tokens.slice(proseStart, end)).trim()
    if (html) blocks.push({ type: 'prose', html })
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!token) continue

    if (token.type === 'heading_open') {
      flushProse(index)
      const inline = tokens[index + 1]
      const title = plainText(inline?.content ?? '')
      const level = token.tag === 'h3' ? 3 : 2
      const id = nextHeadingId(env)
      env.toc.push({ id, title, level })
      blocks.push({ type: 'heading', id, title, level })
      index += 2
      proseStart = index + 1
      continue
    }

    if (token.type === 'fence') {
      flushProse(index)
      const lang = (token.info.trim().split(/\s+/)[0] ?? '').toLowerCase()
      const code = token.content.replace(/\n$/, '')

      if (lang === 'mermaid') {
        blocks.push({ type: 'diagram', code })
      } else {
        blocks.push({ type: 'code', lang, code, html: renderSlice(md, [token]) })
      }

      proseStart = index + 1
      continue
    }

    if (token.type === 'table_open') {
      flushProse(index)
      const end = findClosing(tokens, index, 'table_open', 'table_close')
      blocks.push({ type: 'table', html: renderSlice(md, tokens.slice(index, end + 1)) })
      index = end
      proseStart = end + 1
      continue
    }

    if (token.type === 'blockquote_open') {
      flushProse(index)
      const end = findClosing(tokens, index, 'blockquote_open', 'blockquote_close')
      const slice = tokens.slice(index, end + 1)
      const html = renderSlice(md, slice)
      blocks.push({ type: 'callout', variant: calloutVariant(html), html })
      index = end
      proseStart = end + 1
      continue
    }

    if (token.type === 'html_block' && token.content.trimStart().startsWith('<!--')) {
      // Служебные комментарии уроков (`<!-- проверить: … -->`) наружу не отдаём.
      flushProse(index)
      proseStart = index + 1
    }
  }

  flushProse(tokens.length)
  return blocks
}

/** Индекс закрывающего токена с учётом вложенности. */
function findClosing(tokens: MdToken[], from: number, open: string, close: string): number {
  let depth = 0
  for (let index = from; index < tokens.length; index += 1) {
    const type = tokens[index]?.type
    if (type === open) depth += 1
    if (type === close) {
      depth -= 1
      if (depth === 0) return index
    }
  }
  return tokens.length - 1
}

function renderSlice(md: MarkdownIt, tokens: MdToken[]): string {
  return md.renderer.render(tokens, md.options, {})
}

function calloutVariant(html: string): 'idea' | 'note' | 'warning' {
  const text = plainText(html)
  if (/идея в трёх строках/i.test(text)) return 'idea'
  if (/⚠|важно|внимание/i.test(text)) return 'warning'
  return 'note'
}

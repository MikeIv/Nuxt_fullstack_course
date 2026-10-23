import { createMarkdown, plainText } from './markdown'

import type { CardsPayload, LessonCard } from '#shared/types/lesson'

const CARD_HEADING = /^(\d{2})\.\s*(.+)$/
const LESSON_LINK = /\[[^\]]*\]\((\d{2}-[a-z0-9-]+)\/lesson\.md\)/i
const RULE_LINE = /^\*\*Правило:\*\*\s*(.+)$/
const PRACTICE_LINE = /^\*\*Практика:\*\*\s*(.+?)(?:\.\s*\*\*Урок:\*\*|$)/

/**
 * Разбор `class/cards.md` в структуру карточек: идея в трёх строках, правило,
 * тип практики и ссылка на урок. Формат файла фиксированный, поэтому разбор
 * построчный — без полноценного markdown-парсера.
 */
export function parseCards(source: string): CardsPayload {
  const md = createMarkdown()
  const cards: LessonCard[] = []

  // Режем по заголовкам карточек, сам `## ` в блок не попадает.
  const blocks = source.split(/^##\s+(?=\d{2}\.)/m).slice(1)

  for (const block of blocks) {
    const [heading = '', ...rest] = block.split('\n')
    const head = CARD_HEADING.exec(heading.trim())
    if (!head?.[1] || !head[2]) continue

    const bullets: string[] = []
    let ruleRaw = ''
    let practice = ''
    let slug = ''

    for (const line of rest) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Ссылка на урок стоит в конце строки практики — читаем её до разбора правил.
      const linkMatch = LESSON_LINK.exec(trimmed)
      if (linkMatch?.[1]) slug = linkMatch[1].replace(/^\d{2}-/, '')

      if (trimmed.startsWith('- ')) {
        bullets.push(plainText(trimmed.slice(2)))
        continue
      }

      const ruleMatch = RULE_LINE.exec(trimmed)
      if (ruleMatch?.[1]) {
        ruleRaw = ruleMatch[1].trim()
        continue
      }

      const practiceMatch = PRACTICE_LINE.exec(trimmed)
      if (practiceMatch?.[1]) practice = practiceMatch[1].trim()
    }

    if (!slug) continue

    cards.push({
      number: Number(head[1]),
      title: head[2].trim(),
      slug,
      bullets,
      ruleHtml: ruleRaw ? md.renderInline(ruleRaw) : '',
      practice,
    })
  }

  return { cards }
}

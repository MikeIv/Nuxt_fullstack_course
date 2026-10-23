import { describe, expect, it } from 'vitest'

import { parseCards } from '../../server/utils/cards'

const SOURCE = `# Карточки

## 01. Два рантайма

- \`nuxt build\` собирает \`app/\` и \`server/\` отдельно.
- Мост — \`shared/\`.

**Правило:** общий код живёт в \`shared/\`. **Урок:**[01-two-runtimes](01-two-runtimes/lesson.md)
**Практика:** Deep Focus · 15 мин

## 02. Event — это весь запрос

- Обработчик получает один \`event\`.

**Правило:** данные запроса — только из \`event\`. **Урок:**[02-event-contract](02-event-contract/lesson.md)
**Практика:** Quick Win · 10 мин
`

describe('parseCards', () => {
  it('разбирает номер, заголовок и slug урока', () => {
    const { cards } = parseCards(SOURCE)

    expect(cards).toHaveLength(2)
    expect(cards[0]).toMatchObject({ number: 1, title: 'Два рантайма', slug: 'two-runtimes' })
    expect(cards[1]).toMatchObject({ number: 2, slug: 'event-contract' })
  })

  it('снимает markdown с пунктов идеи', () => {
    const [first] = parseCards(SOURCE).cards

    expect(first?.bullets).toEqual([
      'nuxt build собирает app/ и server/ отдельно.',
      'Мост — shared/.',
    ])
  })

  it('рендерит правило с inline-кодом и сохраняет тип практики', () => {
    const [first] = parseCards(SOURCE).cards

    expect(first?.ruleHtml).toContain('<code>shared/</code>')
    expect(first?.practice).toBe('Deep Focus · 15 мин')
  })

  it('пропускает блоки без ссылки на урок', () => {
    const { cards } = parseCards('# Карточки\n\n## 09. Без ссылки\n\n- пункт\n')

    expect(cards).toEqual([])
  })
})

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { parseLesson } from '../../server/utils/lessonParser'
import type { ParsedLesson } from '../../server/utils/lessonParser'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function readLesson(dir: string): string {
  return readFileSync(path.join(root, 'class', dir, 'lesson.md'), 'utf8')
}

function parse(dir: string, number: number, verifiedUrls: readonly string[] = []): ParsedLesson {
  return parseLesson({
    slug: dir.replace(/^\d+-/, ''),
    number,
    source: readLesson(dir),
    verifiedUrls,
  })
}

describe('parseLesson', () => {
  it('разбирает заголовок, идею и практику урока 01', () => {
    const lesson = parse('01-two-runtimes', 1)

    expect(lesson.number).toBe(1)
    expect(lesson.title).toBe('Два рантайма')
    expect(lesson.idea).toHaveLength(3)
    expect(lesson.idea[0]).toContain('два независимых бандла')
    expect(lesson.practiceKind).toBe('deep-focus')
    expect(lesson.practiceLabel).toBe('Deep Focus')
    expect(lesson.minutes).toBe(15)
    expect(lesson.practice.steps.length).toBeGreaterThanOrEqual(2)
  })

  it('выносит правило урока в текст и inline-HTML', () => {
    const lesson = parse('01-two-runtimes', 1)

    expect(lesson.rule).toContain('shared/')
    expect(lesson.ruleHtml).toContain('<code>shared/</code>')
    expect(lesson.ruleHtml).not.toContain('<p>')
  })

  it('строит оглавление без служебных секций', () => {
    const lesson = parse('09-cache-route-rules', 9)
    const titles = lesson.toc.map((item) => item.title)

    expect(titles[0]).toBe('Три уровня, три разных кеша')
    expect(titles).toContain('Где ломается')
    expect(titles.some((title) => /Попробуй/.test(title))).toBe(false)
    expect(titles).not.toContain('Правило в playbook')
    expect(titles).not.toContain('Источники')
    expect(new Set(lesson.toc.map((item) => item.id)).size).toBe(lesson.toc.length)
  })

  it('оставляет схему и таблицу отдельными блоками', () => {
    const lesson = parse('09-cache-route-rules', 9)
    const types = lesson.blocks.map((block) => block.type)

    expect(types).toContain('diagram')
    expect(types).toContain('table')
    expect(types).toContain('code')
  })

  it('помечает источники по реестру и отдаёт их без служебных пометок', () => {
    const source = readLesson('04-error-contract')
    const url = 'https://nuxt.com/docs/4.x/api/utils/create-error'
    const lesson = parseLesson({
      slug: 'error-contract',
      number: 4,
      source,
      verifiedUrls: [url],
    })

    expect(lesson.sources.length).toBeGreaterThan(0)
    expect(lesson.sources.every((item) => item.url.startsWith('https://'))).toBe(true)
    const matched = lesson.sources.find((item) => item.url === url)
    expect(matched?.verified).toBe(true)
    expect(lesson.sources.some((item) => item.verified === false)).toBe(true)
  })

  it('не отдаёт наружу служебные комментарии уроков', () => {
    const lesson = parse('04-error-contract', 4)
    const html = JSON.stringify(lesson.blocks)

    expect(html).not.toContain('<!--')
  })

  it('разбирает все двенадцать уроков курса', () => {
    const dirs = readdirSync(path.join(root, 'class'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()

    expect(dirs).toHaveLength(12)

    for (const dir of dirs) {
      const lesson = parse(dir, Number(dir.slice(0, 2)))

      expect(lesson.idea, `${dir}: идея в трёх строках`).toHaveLength(3)
      expect(lesson.practice.steps.length, `${dir}: шаги практики`).toBeGreaterThan(0)
      expect(lesson.rule, `${dir}: правило в playbook`).not.toBe('')
      expect(lesson.sources.length, `${dir}: источники`).toBeGreaterThan(0)
    }
  })

  it('не падает на минимальном markdown без практики и правила', () => {
    const lesson = parseLesson({ slug: 'empty', number: 13, source: '# Урок 13. Пустой\n\nАбзац.' })

    expect(lesson.title).toBe('Пустой')
    expect(lesson.number).toBe(13)
    expect(lesson.idea).toEqual([])
    expect(lesson.rule).toBe('')
    expect(lesson.practice.steps).toEqual([])
    expect(lesson.blocks).toHaveLength(1)
  })
})

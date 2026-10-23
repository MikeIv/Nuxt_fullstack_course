import type { Highlighter } from 'shiki'

import type { LessonBlock } from '#shared/types/lesson'

/** Тема подсветки: тёмный блок кода читается на светлой странице как «терминал». */
const THEME = 'github-dark'

/** Языки, которые встречаются в уроках; остальные отдаются как обычный `<pre>`. */
const LANGS = [
  'ts',
  'vue',
  'js',
  'json',
  'bash',
  'sh',
  'html',
  'css',
  'scss',
  'yaml',
  'diff',
  'sql',
] as const

let highlighterPromise: Promise<Highlighter | null> | null = null

/**
 * Ленивый синглтон shiki. Тяжёлый импорт и инициализация — один раз на процесс,
 * при ошибке возвращается `null` и страница урока остаётся с подсветкой markdown-it.
 */
async function getHighlighter(): Promise<Highlighter | null> {
  highlighterPromise ??= (async () => {
    try {
      const { createHighlighter } = await import('shiki')

      return await createHighlighter({ themes: [THEME], langs: [...LANGS] })
    } catch (error) {
      console.error('[highlight] shiki недоступен, код рендерится без подсветки', error)

      return null
    }
  })()

  return highlighterPromise
}

function isSupportedLang(lang: string): boolean {
  return (LANGS as readonly string[]).includes(lang)
}

/** Подсветка одного блока; `null` — оставить HTML markdown-it. */
export async function highlightCode(code: string, lang: string): Promise<string | null> {
  if (!lang || !isSupportedLang(lang)) return null

  const highlighter = await getHighlighter()
  if (!highlighter) return null

  try {
    return highlighter.codeToHtml(code, { lang, theme: THEME })
  } catch (error) {
    console.error(`[highlight] не удалось подсветить ${lang}`, error)

    return null
  }
}

/** Замена HTML у блоков кода на подсвеченный вариант (остальные блоки не трогаются). */
export async function highlightBlocks(blocks: LessonBlock[]): Promise<LessonBlock[]> {
  return Promise.all(
    blocks.map(async (block) => {
      if (block.type !== 'code') return block

      const html = await highlightCode(block.code, block.lang)

      return html ? { ...block, html } : block
    }),
  )
}

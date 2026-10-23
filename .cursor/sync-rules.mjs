#!/usr/bin/env node
/**
 * Сборка правил Cursor (.cursor/rules/*.mdc) в форматы, которые читает DS Harness.
 *
 * Cursor читает `.cursor/rules` нативно. DS Harness — нет: он понимает только
 * `AGENTS.md` / `CLAUDE.md` (+ оверлеи `*.local.md`) и проектные скиллы в
 * `.dsh/skills`. Поэтому:
 *
 *   alwaysApply: true      -> AGENTS.md            (в контексте каждого запроса)
 *   requestable или globs  -> .dsh/skills/<id>/    (подгружается по требованию)
 *
 * Так сохраняется экономия контекста: always-набор остаётся маленьким, а правила
 * фаз (`01`–`06`) в DS Harness доступны как скиллы, а не висят в каждом запросе.
 *
 * Запуск:   node .cursor/sync-rules.mjs [путь-к-проекту]
 * Проверка: node .cursor/check-rules.mjs [путь-к-проекту]
 *
 * ВАЖНО: модуль экспортирует помощников (их использует check-rules.mjs) и
 * выполняет запись ТОЛЬКО при запуске как entry point — иначе проверка
 * пересобирала бы файлы и всегда проходила.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Разбор frontmatter формата .mdc: плоские пары ключ: значение. */
export function parseRule(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  const fm = {}
  let body = raw
  if (m) {
    body = raw.slice(m[0].length)
    for (const line of m[1].split(/\r?\n/)) {
      const kv = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line)
      if (kv) fm[kv[1]] = kv[2].trim()
    }
  }
  return { fm, body: body.trim() }
}

/** Описание скилла: по путям для globs-правил, по фазе для process-правил. */
export function skillDescription(rule) {
  const own = (rule.fm.description ?? rule.id).trim().replace(/[.;,]\s*$/, '')
  const tail = rule.globs
    ? `Применять при работе с файлами: ${rule.globs}.`
    : 'Правило процесса — загружай, когда задача доходит до этой фазы или темы.'
  return [own ? `${own}.` : '', tail].filter(Boolean).join(' ')
}

/** Классификация правил каталога: always (в AGENTS.md) и остальные (в скиллы). */
export function classifyRules(rulesDir) {
  const files = fs
    .readdirSync(rulesDir)
    .filter((f) => f.endsWith('.mdc'))
    .sort()
  const always = []
  const conditional = []
  for (const f of files) {
    const { fm, body } = parseRule(path.join(rulesDir, f))
    if (!body) continue
    const id = f.replace(/\.mdc$/, '')
    const globs = fm.globs ?? ''
    const rule = { id, file: f, fm, body, globs, size: Buffer.byteLength(body) }
    // alwaysApply главнее globs: правило с обоими флагами всё равно всегда активно.
    if (String(fm.alwaysApply).toLowerCase() === 'true') always.push(rule)
    else conditional.push(rule)
  }
  return { always, conditional }
}

/** Собрать AGENTS.md и скиллы для проекта `root`. */
export function syncRules(root) {
  const rulesDir = path.join(root, '.cursor', 'rules')
  const outFile = path.join(root, 'AGENTS.md')
  const skillsDir = path.join(root, '.dsh', 'skills')

  if (!fs.existsSync(rulesDir)) throw new Error(`не найден каталог правил ${rulesDir}`)
  const { always, conditional } = classifyRules(rulesDir)

  // ── 1. Скиллы для requestable и globs-правил ─────────────────────────────
  fs.mkdirSync(skillsDir, { recursive: true })
  const written = []
  for (const r of conditional) {
    const dir = path.join(skillsDir, r.id)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      path.join(dir, 'SKILL.md'),
      [
        '---',
        `name: ${r.id}`,
        `description: ${skillDescription(r)}`,
        '---',
        '',
        `<!-- Сгенерировано из .cursor/rules/${r.file} скриптом .cursor/sync-rules.mjs -->`,
        '',
        r.body,
        '',
      ].join('\n'),
      'utf8',
    )
    written.push(r.id)
  }

  // ── 2. AGENTS.md из always-правил ────────────────────────────────────────
  const total = always.reduce((n, r) => n + r.size, 0)
  const header = [
    '<!-- ФАЙЛ СГЕНЕРИРОВАН: .cursor/sync-rules.mjs — не редактируй вручную. -->',
    '<!-- Источник правил: .cursor/rules/*.mdc. Обновить: node .cursor/sync-rules.mjs -->',
    `<!-- Включены правила с alwaysApply: true — ${always.length} шт., ${total} байт. -->`,
    conditional.length
      ? `<!-- Остальные правила лежат скиллами в .dsh/skills и подгружаются по требованию: ${conditional
          .map((c) => `${c.id} (${c.globs || 'процесс'})`)
          .join('; ')}. -->`
      : null,
    conditional.length
      ? '<!-- Если задача касается этих путей или фазы — загрузи скилл до работы. -->'
      : null,
    '',
  ].filter((x) => x !== null)

  const parts = [...header]
  for (const r of always) parts.push(r.body, '')
  fs.writeFileSync(outFile, parts.join('\n').replace(/\n{3,}/g, '\n\n'), 'utf8')

  // ── 3. Отчёт ─────────────────────────────────────────────────────────────
  console.log(`AGENTS.md (${always.length} правил, ${total} б):`)
  for (const r of always) console.log(`  + ${r.id.padEnd(26)} ${String(r.size).padStart(5)} б`)
  if (written.length) {
    console.log('скиллы .dsh/skills/:')
    for (const id of written) console.log(`  + ${id}`)
  }
  return { always, conditional }
}

const entry = process.argv[1] === undefined ? '' : path.resolve(process.argv[1])
if (entry === fileURLToPath(import.meta.url)) {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(here, '..')
  try {
    syncRules(root)
  } catch (error) {
    console.error(`sync-rules: ${error.message}`)
    process.exit(1)
  }
}

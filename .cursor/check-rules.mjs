#!/usr/bin/env node
/**
 * Проверка, что AGENTS.md и .dsh/skills соответствуют .cursor/rules/*.mdc.
 *
 * Без зависимостей: годится и для CI, и для быстрой проверки руками.
 * Код возврата 1 — рассинхрон, нужно прогнать `node .cursor/sync-rules.mjs`.
 *
 * Запуск: node .cursor/check-rules.mjs [путь-к-проекту]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseRule, skillDescription } from './sync-rules.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(here, '..')
const rulesDir = path.join(root, '.cursor', 'rules')
const agentsFile = path.join(root, 'AGENTS.md')
const skillsDir = path.join(root, '.dsh', 'skills')

/** Та же нормализация, что и в сборке AGENTS.md. */
export const normalizeSyncedText = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
    .replace(/\n{3,}/g, '\n\n')

if (!fs.existsSync(rulesDir)) {
  console.log('check-rules: .cursor/rules отсутствует — проверять нечего (пропуск)')
  process.exit(0)
}
if (!fs.existsSync(agentsFile)) {
  console.error('check-rules: нет AGENTS.md — прогоните node .cursor/sync-rules.mjs')
  process.exit(1)
}

const agents = normalizeSyncedText(fs.readFileSync(agentsFile, 'utf8'))
const problems = []
let alwaysCount = 0
let skillCount = 0

for (const file of fs
  .readdirSync(rulesDir)
  .filter((f) => f.endsWith('.mdc'))
  .sort()) {
  const { fm, body } = parseRule(path.join(rulesDir, file))
  if (!body) continue
  const id = file.replace(/\.mdc$/, '')
  const globs = fm.globs ?? ''
  const rule = { id, file, fm, globs }

  if (String(fm.alwaysApply).toLowerCase() === 'true') {
    alwaysCount++
    if (!agents.includes(normalizeSyncedText(body))) {
      problems.push(`AGENTS.md не содержит тело правила ${file}`)
    }
    continue
  }

  const skillFile = path.join(skillsDir, id, 'SKILL.md')
  if (!fs.existsSync(skillFile)) {
    problems.push(`нет скилла .dsh/skills/${id}/SKILL.md для правила ${file}`)
    continue
  }
  skillCount++
  const skill = fs.readFileSync(skillFile, 'utf8')
  if (!skill.includes(`name: ${id}`)) problems.push(`скилл ${id} без строки name: ${id}`)
  if (!skill.includes(skillDescription(rule)))
    problems.push(`скилл ${id}: описание не совпадает с правилом`)
  if (!normalizeSyncedText(skill).includes(normalizeSyncedText(body))) {
    problems.push(`скилл ${id} не содержит тело правила ${file}`)
  }
}

console.log(`check-rules: always-правил ${alwaysCount}, скиллов ${skillCount}`)
if (problems.length === 0) {
  console.log('check-rules: OK — AGENTS.md и скиллы соответствуют правилам')
  process.exit(0)
}
console.error('check-rules: рассинхрон — прогоните node .cursor/sync-rules.mjs')
for (const p of problems) console.error(`  - ${p}`)
process.exit(1)

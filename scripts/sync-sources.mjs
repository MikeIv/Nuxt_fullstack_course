#!/usr/bin/env node
/**
 * Реестр источников курса → типизированный модуль для приложения.
 *
 * `sources.json` лежит в корне и остаётся единственным источником истины, но ни клиент,
 * ни `shared/` не могут прочитать его с диска. Поэтому реестр разворачивается в маленький
 * TS-модуль рядом с общими типами. Файл генерируется, в git не попадает.
 *
 * Запуск: node scripts/sync-sources.mjs
 * Вызывается из `postinstall` и `prebuild`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const registryFile = path.join(root, 'sources.json')
const outDir = path.join(root, 'shared', 'data')
const outFile = path.join(outDir, 'sources.generated.ts')

if (!fs.existsSync(registryFile)) {
  console.error(`sync-sources: нет ${registryFile}`)
  process.exit(1)
}

/** @type {{verified?: unknown}} */
let registry
try {
  registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'))
} catch (error) {
  console.error(`sync-sources: sources.json не читается как JSON — ${error.message}`)
  process.exit(1)
}

const verified = Array.isArray(registry.verified)
  ? registry.verified.filter((url) => typeof url === 'string' && url.trim() !== '')
  : []

if (verified.length === 0) {
  console.error('sync-sources: в sources.json нет массива verified — нечего собрать')
  process.exit(1)
}

const lines = [
  '/**',
  ' * СГЕНЕРИРОВАНО: scripts/sync-sources.mjs из sources.json — не редактируй вручную.',
  ' * Реестр URL, которые были реально открыты при подготовке курса.',
  ' */',
  'export const verifiedSources: readonly string[] = [',
  ...verified.map((url) => `  ${JSON.stringify(url)},`),
  ']',
  '',
]

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(outFile, lines.join('\n'), 'utf8')
console.log(`sync-sources: ${verified.length} URL → ${path.relative(root, outFile)}`)

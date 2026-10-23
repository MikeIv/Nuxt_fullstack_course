/**
 * Figma REST — чтение макета без MCP.
 *
 * Ключ файла: `--key=<fileKey>` | `FIGMA_FILE_KEY` | строка `fileKey` в `.cursor/rules`.
 * Токен: `FIGMA_TOKEN` | `~/.dsh/figma-pat.txt`.
 * Запись — только в `.planning/figma/`.
 *
 *   node scripts/figma.mjs meta [fileKey...]
 *   node scripts/figma.mjs nodes <nodeId> [--json]
 *   node scripts/figma.mjs png <nodeId> [--scale=2]
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(root, '.planning', 'figma')
const RULES_DIR = join(root, '.cursor', 'rules')
const TOKEN_FILE = join(homedir(), '.dsh', 'figma-pat.txt')
const API = 'https://api.figma.com/v1'

const MAX_TREE = 60
const MAX_TREE_DEPTH = 3
const MAX_TEXTS = 25

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR
const paint = (code, s) => (useColor ? `\u001b[${code}m${s}\u001b[0m` : s)
const bold = (s) => paint(1, s)
const dim = (s) => paint(2, s)
const red = (s) => paint(31, s)
const green = (s) => paint(32, s)

/** Печать ошибки и выход с кодом 1. */
function fail(message, hint) {
  console.error(`${red('✗')} ${message}`)
  if (hint) console.error(dim(`  ${hint}`))
  process.exit(1)
}

function usage() {
  return [
    `${bold('figma.mjs')} — чтение макета Figma по REST (без MCP)`,
    '',
    '  node scripts/figma.mjs meta [fileKey...]',
    '  node scripts/figma.mjs nodes <nodeId> [--json] [--paths]',
    '  node scripts/figma.mjs png <nodeId> [--scale=2]',
    '',
    '  --paths — добавить геометрию путей; --json станет в разы тяжелее.',
    'Ключ файла: --key=<fileKey> | FIGMA_FILE_KEY | строка `fileKey` в .cursor/rules.',
    `Токен: FIGMA_TOKEN | ${TOKEN_FILE}`,
    'Запись — только в .planning/figma/.',
  ].join('\n')
}

function parseArgs(argv) {
  const flags = {}
  const positional = []
  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      positional.push(arg)
      continue
    }
    const [name, value] = arg.slice(2).split('=')
    flags[name] = value ?? true
  }
  return { flags, positional }
}

function readTokenFile() {
  try {
    return readFileSync(TOKEN_FILE, 'utf8')
      .trim()
      .replace(/^["']|["']$/g, '')
  } catch {
    return ''
  }
}

function readToken() {
  const fromEnv = process.env.FIGMA_TOKEN?.trim()
  if (fromEnv) return fromEnv

  const raw = readTokenFile()
  if (!raw) {
    fail('Не найден токен Figma.', `Экспортируй FIGMA_TOKEN или положи PAT в ${TOKEN_FILE}`)
  }
  return raw
}

function listRuleFiles() {
  try {
    return readdirSync(RULES_DIR)
      .filter((name) => name.endsWith('.mdc'))
      .sort()
  } catch {
    return []
  }
}

function readRuleFile(name) {
  try {
    return readFileSync(join(RULES_DIR, name), 'utf8')
  } catch {
    return ''
  }
}

/** fileKey из правил проекта: строка вида `- **fileKey:** \`...\``. */
function keyFromRules() {
  for (const name of listRuleFiles()) {
    const match = readRuleFile(name).match(
      /^[ \t]*-[ \t]*\*\*fileKey:\*\*[ \t]*`([A-Za-z0-9]{10,})`/m,
    )
    if (match) return match[1]
  }
  return ''
}

function resolveKey(flags) {
  const key = flags.key || process.env.FIGMA_FILE_KEY || keyFromRules()
  if (!key) {
    fail(
      'Не задан fileKey.',
      'Укажи --key=<fileKey>, FIGMA_FILE_KEY или строку `fileKey` в .cursor/rules',
    )
  }
  return key
}

async function figmaJson(path, token, search = {}) {
  const url = new URL(`${API}${path}`)
  for (const [name, value] of Object.entries(search)) url.searchParams.set(name, String(value))

  const response = await fetch(url, { headers: { 'X-Figma-Token': token } })
  if (!response.ok) {
    const hints = {
      400: 'Figma не приняла параметры запроса',
      403: 'токен не даёт доступа к файлу или не хватает скоупа',
      404: 'файл или узел не найден — проверь fileKey и node-id',
      429: 'лимит запросов Figma — повтори через минуту, без циклов',
    }
    fail(`Figma API ${response.status}`, hints[response.status] ?? `неожиданный ответ на ${path}`)
  }
  return response.json()
}

function walk(node, depth, lines) {
  if (!node.children || depth > MAX_TREE_DEPTH) return
  for (const child of node.children) {
    if (lines.length >= MAX_TREE) return
    const box = child.absoluteBoundingBox
    const size = box ? `${Math.round(box.width)}×${Math.round(box.height)}` : '—'
    lines.push(`${'  '.repeat(depth)}- ${child.name} [${child.type}] ${size}`)
    walk(child, depth + 1, lines)
  }
}

function collectTexts(node, out) {
  if (!node.children) return
  for (const child of node.children) {
    if (out.length >= MAX_TEXTS) return
    if (child.type === 'TEXT') {
      const style = child.style ?? {}
      const size = style.fontSize ? Math.round(style.fontSize) : '—'
      out.push(`«${child.characters}» [${size}px ${style.fontFamily ?? '—'}]`)
    }
    collectTexts(child, out)
  }
}

async function commandMeta(keys, token) {
  for (const key of keys) {
    const file = await figmaJson(`/files/${key}`, token, { depth: 1 })
    const pages = file.document?.children?.length ?? 0
    console.log(`${bold(file.name)}  ${dim(key)}`)
    console.log(`  правка: ${file.lastModified}  ·  страниц: ${pages}`)
  }
}

async function commandNodes(nodeId, flags, token) {
  const key = resolveKey(flags)
  const query = flags.paths ? { ids: nodeId, geometry: 'paths' } : { ids: nodeId }
  const nodes = await figmaJson(`/files/${key}/nodes`, token, query)
  const node = nodes.nodes?.[nodeId]?.document
  if (!node) {
    fail(`Узел ${nodeId} не найден`, 'Из ссылки Figma: ?node-id=971-62163 → 971:62163')
  }

  const box = node.absoluteBoundingBox
  const size = box ? `${Math.round(box.width)}×${Math.round(box.height)}` : '—'
  console.log(`${bold(node.name)} [${node.type}] ${size}`)
  console.log(dim(`fileKey ${key} · node ${nodeId} · детей: ${node.children?.length ?? 0}`))

  const lines = []
  walk(node, 1, lines)
  if (lines.length) {
    console.log(`\n${bold('Дерево')} ${dim(`до ${MAX_TREE_DEPTH} уровней`)}\n${lines.join('\n')}`)
  }

  const texts = []
  collectTexts(node, texts)
  if (texts.length) console.log(`\n${bold('Тексты')}\n${texts.join('\n')}`)

  if (flags.json) {
    mkdirSync(OUT_DIR, { recursive: true })
    const file = join(OUT_DIR, `${nodeId.replace(':', '-')}.json`)
    writeFileSync(file, `${JSON.stringify(nodes, null, 2)}\n`)
    console.log(dim(`\nJSON: ${file}`))
  }
}

async function commandPng(nodeId, flags, token) {
  const key = resolveKey(flags)
  const scale = Number(flags.scale ?? 2)
  const images = await figmaJson(`/images/${key}`, token, { ids: nodeId, format: 'png', scale })
  const url = images.images?.[nodeId]
  if (!url) fail('Figma не вернула ссылку на рендер', JSON.stringify(images.err ?? images))

  const response = await fetch(url)
  if (!response.ok) fail(`Не удалось скачать рендер: HTTP ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())

  mkdirSync(OUT_DIR, { recursive: true })
  const file = join(OUT_DIR, `${nodeId.replace(':', '-')}@${scale}x.png`)
  writeFileSync(file, bytes)
  console.log(`${green('✓')} ${file} ${dim(`${Math.round(bytes.byteLength / 1024)} КБ`)}`)
}

const { flags, positional } = parseArgs(process.argv.slice(2))
const [command, ...rest] = positional

if (!command || command === 'help' || flags.help) {
  console.log(usage())
  process.exit(command ? 0 : 1)
}

const token = readToken()

if (command === 'meta') {
  await commandMeta(rest.length ? rest : [resolveKey(flags)], token)
} else if (command === 'nodes') {
  if (!rest[0]) fail('Не указан node-id', 'node scripts/figma.mjs nodes 971:62163')
  await commandNodes(rest[0], flags, token)
} else if (command === 'png') {
  if (!rest[0]) fail('Не указан node-id', 'node scripts/figma.mjs png 971:62163')
  await commandPng(rest[0], flags, token)
} else {
  fail(`Неизвестная команда: ${command}`, 'Доступны: meta, nodes, png')
}

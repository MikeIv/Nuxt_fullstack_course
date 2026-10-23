/**
 * Обёртка Husky: баннер, lint-staged, итог с временем.
 * Цвета: FORCE_COLOR=1 (выставляется в .husky/pre-commit).
 */
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
process.chdir(root)

function getPackageDisplayName() {
  try {
    const raw = readFileSync(join(root, 'package.json'), 'utf8')
    const name = JSON.parse(raw)?.name
    return typeof name === 'string' && name.trim() ? name.trim() : 'nuxt-app'
  } catch {
    return 'nuxt-app'
  }
}

function getStagedFiles() {
  try {
    return execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf8',
      cwd: root,
    })
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

const LINT_STAGED_EXT = /\.(vue|css|scss|mjs|cjs|js|ts|json|md|yml|yaml)$/i

const esc = (code, s) => `\u001b[${code}m${s}\u001b[0m`
const bold = (s) => esc(1, s)
const dim = (s) => esc(2, s)
const red = (s) => esc(31, s)
const green = (s) => esc(32, s)
const yellow = (s) => esc(33, s)
const cyan = (s) => esc(36, s)

const W = 62
const inner = W - 4
const h = dim('━'.repeat(W - 2))
const top = dim('╭') + h + dim('╮')
const bot = dim('╰') + h + dim('╯')
const pipe = dim('│')

/** Длина строки без ESC-последовательностей (ANSI). */
function visibleLen(s) {
  const escRe = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')
  return s.replace(escRe, '').length
}

function row(content) {
  const pad = Math.max(0, inner - visibleLen(content))
  console.log(pipe + '  ' + content + ' '.repeat(pad) + pipe)
}

const sep = dim('─'.repeat(inner))

console.log()
console.log(top)
row('')
row(`${bold(cyan(getPackageDisplayName()))}${dim('  ·  ')}${bold(yellow('pre-commit'))}`)
row(dim('lint-staged → Prettier · правила → AGENTS.md/.dsh'))
row('')
console.log(bot)
console.log()

const t0 = Date.now()
const envClean = { ...process.env }
delete envClean.NO_COLOR
const spawnEnv = { ...envClean, FORCE_COLOR: '1' }

/** Рассинхрон правил и сгенерированных AGENTS.md / скиллов — стоп до коммита. */
function checkRules() {
  if (!existsSync(join(root, '.cursor', 'check-rules.mjs'))) return 0
  const r = spawnSync('node', ['.cursor/check-rules.mjs'], {
    cwd: root,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: spawnEnv,
  })
  return r.status ?? (r.signal ? 1 : 0)
}

const rulesStatus = checkRules()

if (rulesStatus !== 0) {
  console.log(dim(`  ${sep}`))
  console.log(
    `  ${red('✗')}  ${bold('Pre-commit остановлен')}  ${dim('·  правила разошлись с AGENTS.md/.dsh')}`,
  )
  console.log(dim(`  ${sep}`))
  console.log(dim('  Пересоберите:'), yellow('node .cursor/sync-rules.mjs'))
  console.log()
  process.exit(rulesStatus)
}

const staged = getStagedFiles()

if (staged.length === 0) {
  console.log(dim(`  ${sep}`))
  console.log(dim('  Нет staged-файлов · пропуск проверок.'))
  console.log(dim(`  ${sep}`))
  console.log()
  process.exit(0)
}

const lintable = staged.filter((f) => LINT_STAGED_EXT.test(f))

if (lintable.length === 0) {
  console.log(dim(`  ${sep}`))
  console.log(dim('  В индексе нет файлов для ESLint / Prettier / Stylelint · задачи пропущены.'))
  console.log(dim(`  ${sep}`))
  console.log()
  process.exit(0)
}

const r = spawnSync('pnpm', ['exec', 'lint-staged', '--concurrent', 'false'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: spawnEnv,
})

let status = r.status ?? (r.signal ? 1 : 0)

/** Как `pnpm lint:all`: staged-файлы могут не включать .md, обновлённые отдельно. */
if (status === 0) {
  const rPrettier = spawnSync('pnpm', ['format:check'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: spawnEnv,
  })
  status = rPrettier.status ?? (rPrettier.signal ? 1 : 0)
}

const sec = ((Date.now() - t0) / 1000).toFixed(2)

console.log()
if (status === 0) {
  console.log(dim(`  ${sep}`))
  console.log(`  ${green('✓')}  ${bold('Проверки пройдены')}  ${dim(`·  ${sec}s`)}`)
  console.log(dim(`  ${sep}`))
  console.log(dim('  Можно коммитить.'))
} else {
  console.log(dim(`  ${sep}`))
  console.log(`  ${red('✗')}  ${bold('Pre-commit остановлен')}  ${dim(`·  ${sec}s`)}`)
  console.log(dim(`  ${sep}`))
  console.log(
    dim('  Исправьте замечания линтеров. Отключить проверку (осторожно): '),
    yellow('git commit --no-verify'),
  )
}
console.log()

process.exit(status)

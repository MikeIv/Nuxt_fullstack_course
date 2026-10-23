/**
 * Обёртка Husky pre-push: быстрые проверки перед отправкой.
 * Полный протокол L+ (`pnpm verify`, `pnpm build`) запускает автор — правило `04`.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)

if (!existsSync(join(root, 'node_modules'))) {
  console.log('  pre-push: node_modules нет — проверки пропущены (сначала pnpm install).')
  process.exit(0)
}

console.log('  pre-push: pnpm lint:all (ESLint + Prettier + Stylelint)')

const envClean = { ...process.env }
delete envClean.NO_COLOR

const r = spawnSync('pnpm', ['lint:all'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...envClean, FORCE_COLOR: '1' },
})

const status = r.status ?? (r.signal ? 1 : 0)

if (status === 0) {
  console.log('  pre-push: OK')
} else {
  console.log('  pre-push: проверки упали — исправьте или `git push --no-verify` (осознанно).')
}

process.exit(status)

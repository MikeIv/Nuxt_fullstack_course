import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

import { PRACTICE_MAP } from '#shared/data/practiceMap'
import type {
  LessonAudit,
  PracticeAuditPayload,
  PracticeCheck,
  PracticeCheckResult,
} from '#shared/types/practice'

/** Больше этого файл не читаем: в проекте практики хватает обычных исходников. */
const MAX_FILE_BYTES = 512 * 1024

/** Каталоги, которые в аудите не нужны и дорого обходить. */
const SKIP_DIRS = new Set(['node_modules', '.git', '.nuxt', '.output', '.nitro', 'dist', '.cache'])

/** Сколько совпадений показываем на файл: этого хватает, чтобы подтвердить наличие. */
const MAX_MATCHES = 20

/** Сколько файлов обходим в одной папке: защита от гигантских деревьев. */
const MAX_FILES = 400

/**
 * Кеш одного скана. Пять проверок-`grep` смотрят в те же каталоги, поэтому обход
 * дерева и чтение файлов делаются один раз за запрос, а не на каждую проверку.
 * Живёт только внутри `scanPractice`: между запросами данные не устаревают.
 */
interface ScanCache {
  lists: Map<string, Promise<string[]>>
  contents: Map<string, Promise<string | null>>
  sizes: Map<string, number>
}

function createCache(): ScanCache {
  return { lists: new Map(), contents: new Map(), sizes: new Map() }
}

async function isDirectory(target: string): Promise<boolean> {
  try {
    const info = await stat(target)

    return info.isDirectory()
  } catch {
    return false
  }
}

async function isFile(target: string): Promise<boolean> {
  try {
    const info = await stat(target)

    return info.isFile()
  } catch {
    return false
  }
}

/** Путь из карты проверок, приведённый к абсолютному и запертый внутри корня проекта. */
function resolveInsideRoot(root: string, relative: string): string | null {
  const normalizedRoot = path.resolve(root)
  const target = path.resolve(normalizedRoot, relative)

  if (target !== normalizedRoot && !target.startsWith(normalizedRoot + path.sep)) return null

  return target
}

/** Все файлы каталога (рекурсивно), с кешем на скан. */
function listFiles(dir: string, cache: ScanCache): Promise<string[]> {
  const cached = cache.lists.get(dir)
  if (cached) return cached

  const pending = (async () => {
    const collected: string[] = []

    const walk = async (current: string): Promise<void> => {
      if (collected.length >= MAX_FILES) return

      let entries
      try {
        entries = await readdir(current, { withFileTypes: true })
      } catch {
        return
      }

      for (const entry of entries) {
        if (collected.length >= MAX_FILES) return

        const full = path.join(current, entry.name)

        if (entry.isDirectory()) {
          if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
          await walk(full)
          continue
        }

        if (entry.isFile()) collected.push(full)
      }
    }

    await walk(dir)

    return collected
  })()

  cache.lists.set(dir, pending)

  return pending
}

/** Содержимое файла с кешем на скан; `null` — файл не читается или слишком большой. */
function readCached(file: string, cache: ScanCache): Promise<string | null> {
  const cached = cache.contents.get(file)
  if (cached) return cached

  const pending = (async () => {
    try {
      const info = await stat(file)
      cache.sizes.set(file, info.size)

      if (info.size > MAX_FILE_BYTES) return null

      return await readFile(file, 'utf8')
    } catch {
      return null
    }
  })()

  cache.contents.set(file, pending)

  return pending
}

/** Номера строк файла, где сработала регулярка (без содержимого строк). */
async function matchLines(file: string, pattern: RegExp, cache: ScanCache): Promise<number[]> {
  const content = await readCached(file, cache)
  if (!content) return []

  const lines: number[] = []
  const rows = content.split('\n')

  for (let index = 0; index < rows.length; index += 1) {
    if (pattern.test(rows[index] ?? '')) {
      lines.push(index + 1)
      if (lines.length >= MAX_MATCHES) break
    }
  }

  return lines
}

/** Одна проверка: существование файла/папки или поиск по регулярке. */
async function runCheck(
  root: string,
  check: PracticeCheck,
  cache: ScanCache,
): Promise<PracticeCheckResult | null> {
  if (check.kind === 'manual') return null

  const target = resolveInsideRoot(root, check.path)
  if (!target) return { checkId: check.id, status: 'missing' }

  if (check.kind === 'dir') {
    return { checkId: check.id, status: (await isDirectory(target)) ? 'done' : 'missing' }
  }

  if (check.kind === 'file') {
    return { checkId: check.id, status: (await isFile(target)) ? 'done' : 'missing' }
  }

  const pattern = new RegExp(check.pattern ?? '.', 'm')
  const expectAbsent = check.expect === 'absent'

  let files: string[]
  if (await isDirectory(target)) {
    files = await listFiles(target, cache)
  } else if (await isFile(target)) {
    files = [target]
  } else {
    // Пути нет — для проверки на отсутствие это как раз хорошо.
    return { checkId: check.id, status: expectAbsent ? 'done' : 'missing' }
  }

  const found: number[] = []
  let bytes = 0

  for (const file of files) {
    const lines = await matchLines(file, pattern, cache)
    bytes += cache.sizes.get(file) ?? 0

    if (lines.length === 0) continue

    found.push(...lines)

    // Нарушение найдено — дальше искать не нужно, ответ уже «есть нарушения».
    if (expectAbsent) break
    if (found.length >= MAX_MATCHES) break
  }

  const matched = found.length > 0
  const satisfied = expectAbsent ? !matched : matched

  return {
    checkId: check.id,
    status: satisfied ? 'done' : expectAbsent ? 'partial' : 'missing',
    bytes,
    lines: matched ? found.slice(0, MAX_MATCHES) : undefined,
  }
}

/**
 * Скан проекта практики по карте проверок. Возвращает только факты:
 * есть файл или нет, размеры и номера строк совпадений — без содержимого файлов.
 */
export async function scanPractice(root: string): Promise<PracticeAuditPayload> {
  const checkedAt = new Date().toISOString()

  if (!root || !(await isDirectory(root))) {
    return { root, available: false, checkedAt, audits: [] }
  }

  const cache = createCache()
  const audits: LessonAudit[] = []

  for (const [slug, checks] of Object.entries(PRACTICE_MAP)) {
    const results: PracticeCheckResult[] = []

    for (const check of checks) {
      const result = await runCheck(root, check, cache)
      if (result) results.push(result)
    }

    audits.push({ slug, root, available: true, results, checkedAt })
  }

  return { root, available: true, checkedAt, audits }
}

import { describe, expect, it } from 'vitest'

import { PRACTICE_MAP, practiceChecksFor } from '../../shared/data/practiceMap'
import { checkStatusLabel, checkStatusTone } from '../../shared/utils/practiceCheck'

const LESSON_SLUGS = [
  'two-runtimes',
  'event-contract',
  'fetch-layers',
  'error-contract',
  'state-server-vs-client',
  'validation-boundary',
  'database-from-nitro',
  'auth-session',
  'cache-route-rules',
  'storage-layer',
  'long-tasks',
  'deploy-secrets',
]

describe('practiceMap', () => {
  it('покрывает все двенадцать уроков', () => {
    expect(Object.keys(PRACTICE_MAP)).toEqual(LESSON_SLUGS)
  })

  it('не содержит абсолютных путей и выхода из корня проекта', () => {
    for (const checks of Object.values(PRACTICE_MAP)) {
      for (const check of checks) {
        expect(check.path.startsWith('/')).toBe(false)
        expect(check.path.includes('..')).toBe(false)
      }
    }
  })

  it('держит уникальные id внутри урока и компилируемые регулярки', () => {
    for (const [slug, checks] of Object.entries(PRACTICE_MAP)) {
      const ids = checks.map((check) => check.id)

      expect(new Set(ids).size, `уникальные id в ${slug}`).toBe(ids.length)

      for (const check of checks) {
        if (check.kind !== 'grep') continue

        expect(check.pattern, `${slug}/${check.id}: нужен pattern`).toBeTruthy()
        expect(() => new RegExp(check.pattern ?? '', 'm')).not.toThrow()
      }
    }
  })

  it('отдаёт пустой список для неизвестного урока', () => {
    expect(practiceChecksFor('unknown')).toEqual([])
  })
})

describe('checkStatusLabel', () => {
  const present = { id: 'a', title: 'a', kind: 'file' as const, path: 'a.ts' }
  const absent = { ...present, expect: 'absent' as const }

  it('для позитивной проверки: есть / нет', () => {
    expect(checkStatusLabel(present, 'done')).toBe('есть')
    expect(checkStatusLabel(present, 'missing')).toBe('нет')
  })

  it('для проверки на отсутствие: чисто / нарушения', () => {
    expect(checkStatusLabel(absent, 'done')).toBe('чисто')
    expect(checkStatusLabel(absent, 'partial')).toBe('нарушения')
    expect(checkStatusTone(absent, 'partial')).toBe('partial')
  })

  it('без результата пишет «не проверено»', () => {
    expect(checkStatusLabel(present, undefined)).toBe('не проверено')
  })
})

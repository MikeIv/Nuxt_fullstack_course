import type { PracticeAuditPayload } from '#shared/types/practice'

/**
 * Аудит проекта практики. Состояние общее для всех страниц (`useState`), поэтому
 * читалка урока и страница `/project` не сканируют проект дважды.
 *
 * Ручка есть только в dev: в проде запрос вернёт 404, и `failed` просто скроет блок.
 */
export function usePracticeAudit() {
  const payload = useState<PracticeAuditPayload | null>('practice-audit', () => null)
  const pending = useState<boolean>('practice-audit-pending', () => false)
  const failed = useState<boolean>('practice-audit-failed', () => false)
  const api = useApi()

  async function refresh() {
    if (pending.value) return

    pending.value = true
    failed.value = false

    try {
      payload.value = await api<PracticeAuditPayload>('/api/practice/scan')
    } catch {
      payload.value = null
      failed.value = true
    } finally {
      pending.value = false
    }
  }

  return { payload, pending, failed, refresh }
}

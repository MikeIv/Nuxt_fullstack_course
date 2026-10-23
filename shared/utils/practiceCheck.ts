import type { PracticeCheck, PracticeCheckResult } from '#shared/types/practice'

export type CheckStatus = PracticeCheckResult['status']

/** Подпись статуса проверки: машинный факт, а не оценка. */
export function checkStatusLabel(check: PracticeCheck, status: CheckStatus | undefined): string {
  if (!status) return 'не проверено'
  if (check.expect === 'absent') return status === 'done' ? 'чисто' : 'нарушения'

  return status === 'done' ? 'есть' : 'нет'
}

/** Статус для точки-индикатора: у негативных проверок «ничего не найдено» — это успех. */
export function checkStatusTone(
  check: PracticeCheck,
  status: CheckStatus | undefined,
): CheckStatus {
  if (!status) return 'missing'
  if (check.expect === 'absent' && status !== 'done') return 'partial'

  return status
}

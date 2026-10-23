<script setup lang="ts">
import type { LessonStatus } from '~/stores/progress'

withDefaults(
  defineProps<{
    status: LessonStatus | 'missing'
    /** Короткий текст статуса; по умолчанию — по коду. */
    label?: string
  }>(),
  { label: '' },
)

const DEFAULT_LABEL: Record<LessonStatus | 'missing', string> = {
  done: 'готово',
  partial: 'в работе',
  none: 'не начат',
  missing: 'нет в проекте',
}
</script>

<template>
  <span :class="$style.pill" :data-status="status">
    <span :class="$style.dot" aria-hidden="true" />
    {{ label || DEFAULT_LABEL[status] }}
  </span>
</template>

<style module lang="scss">
@use 'tools' as *;

.pill {
  display: inline-flex;
  gap: rem(6);
  align-items: center;
  border-radius: var(--fs-radius-pill);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  @include fs-text-xs;

  &[data-status='done'] {
    color: var(--fs-color-status-done);
  }

  &[data-status='partial'] {
    color: var(--fs-color-status-partial);
  }

  &[data-status='none'],
  &[data-status='missing'] {
    color: var(--fs-color-status-missing);
  }
}

.dot {
  width: rem(7);
  height: rem(7);
  border-radius: 50%;
  background-color: currentcolor;
}
</style>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    max: number
    /** Подпись для скринридера: «Прочитано 4 из 12». */
    label?: string
    /** Тёмный вариант для чёрных блоков. */
    variant?: 'light' | 'dark'
  }>(),
  { label: '', variant: 'light' },
)

const percent = computed(() => {
  if (props.max <= 0) return 0

  return Math.min(100, Math.round((props.value / props.max) * 100))
})
</script>

<template>
  <div
    :class="[$style.track, $style[variant]]"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="value"
    :aria-label="label || `Прогресс: ${value} из ${max}`"
  >
    <div :class="$style.fill" :style="{ width: `${percent}%` }" />
  </div>
</template>

<style module lang="scss">
@use 'tools' as *;

.track {
  position: relative;
  width: 100%;
  height: rem(4);
  border-radius: var(--fs-radius-pill);
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.light {
  background-color: var(--fs-color-line);

  .fill {
    background-color: var(--fs-color-black);
  }
}

.dark {
  background-color: rgb(255 255 255 / 24%);

  .fill {
    background-color: var(--fs-color-beige);
  }
}
</style>

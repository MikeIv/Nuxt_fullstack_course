<script setup lang="ts">
import { iconPath } from '~/utils/icons'
import type { IconName } from '~/utils/icons'

const props = withDefaults(
  defineProps<{
    name: IconName
    /** Размер в rem-единицах: 16 по умолчанию, 20 — в кнопках покрупнее. */
    size?: number
    /** Толщина линии — визуальный вес иконки. */
    stroke?: number
    label?: string
  }>(),
  { size: 16, stroke: 1.8, label: '' },
)

const path = computed(() => iconPath(props.name))
</script>

<template>
  <svg
    :class="$style.icon"
    :width="`${size / 16}rem`"
    :height="`${size / 16}rem`"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="stroke"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    :aria-hidden="label ? undefined : 'true'"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
  >
    <path :d="path" />
  </svg>
</template>

<style module lang="scss">
.icon {
  display: block;
  flex-shrink: 0;
}
</style>

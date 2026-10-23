<script setup lang="ts">
import { formatNumber, practiceLabel } from '~/utils/course'
import type { LessonSummary } from '#shared/types/lesson'

defineProps<{
  prev: LessonSummary | null
  next: LessonSummary | null
}>()
</script>

<template>
  <nav :class="$style.nav" aria-label="Соседние уроки">
    <NuxtLink v-if="prev" :to="`/lessons/${prev.slug}`" :class="[$style.card, $style.prev]">
      <span :class="$style.dir">
        <UiAppIcon name="arrow-left" :size="14" />
        Предыдущий
      </span>
      <span :class="$style.title">{{ formatNumber(prev.number) }} · {{ prev.title }}</span>
      <span :class="$style.meta">{{ practiceLabel(prev.practiceKind) }}</span>
    </NuxtLink>
    <span v-else :class="[$style.card, $style.empty]">
      <span :class="$style.dir">Начало курса</span>
    </span>

    <NuxtLink v-if="next" :to="`/lessons/${next.slug}`" :class="[$style.card, $style.next]">
      <span :class="$style.dir">
        Следующий
        <UiAppIcon name="arrow-right" :size="14" />
      </span>
      <span :class="$style.title">{{ formatNumber(next.number) }} · {{ next.title }}</span>
      <span :class="$style.meta">{{ practiceLabel(next.practiceKind) }}</span>
    </NuxtLink>
    <span v-else :class="[$style.card, $style.empty]">
      <span :class="$style.dir">Конец курса</span>
    </span>
  </nav>
</template>

<style module lang="scss">
@use 'tools' as *;

.nav {
  display: grid;
  gap: var(--fs-space-2);
  margin-top: var(--fs-space-4);

  @include from-tablet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.card {
  display: flex;
  flex-direction: column;
  gap: rem(4);
  padding: var(--fs-space-2);
  border: rem(1) solid var(--fs-color-line);
  border-radius: var(--fs-radius-xl);
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  @media (hover: hover) {
    &:hover {
      border-color: var(--fs-color-black);
    }
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.next {
  align-items: flex-end;
  text-align: right;
}

.empty {
  border-style: dashed;
  color: var(--fs-color-gray);
}

.dir {
  display: inline-flex;
  gap: rem(6);
  align-items: center;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  @include fs-text-xs;
}

.title {
  @include fs-text-sm;
  font-weight: 500;
}

.meta {
  @include fs-text-xs;
  color: var(--fs-color-gray);
}
</style>

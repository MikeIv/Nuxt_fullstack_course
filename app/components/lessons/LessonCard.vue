<script setup lang="ts">
import { arcAccent, formatMinutes, formatNumber, practiceLabel } from '~/utils/course'
import type { LessonStatus } from '~/stores/progress'
import type { LessonSummary } from '#shared/types/lesson'

const props = withDefaults(
  defineProps<{
    lesson: LessonSummary
    status?: LessonStatus
    /** Компактный вариант — для списков внутри арок. */
    compact?: boolean
  }>(),
  { status: 'none', compact: false },
)

const accent = computed(() => arcAccent(props.lesson.arc))
const to = computed(() => `/lessons/${props.lesson.slug}`)
const lead = computed(() => props.lesson.idea[0] ?? '')
</script>

<template>
  <NuxtLink :to="to" :class="[$style.card, { [$style.compact]: compact }]">
    <div :class="$style.head">
      <span :class="$style.number">{{ formatNumber(lesson.number) }}</span>
      <UiAppTag :accent="accent" size="sm">{{ practiceLabel(lesson.practiceKind) }}</UiAppTag>
    </div>

    <h3 :class="$style.title">{{ lesson.title }}</h3>

    <p v-if="compact && lead" :class="[$style.lead, $style.compactLead]">{{ lead }}</p>
    <p v-else-if="lead && !compact" :class="$style.lead">{{ lead }}</p>

    <div :class="$style.foot">
      <span :class="$style.meta">{{ formatMinutes(lesson.minutes) }}</span>
      <span v-if="lesson.sourceCount" :class="$style.meta">{{ lesson.sourceCount }} источника</span>
      <StatusPill :status="status" />
    </div>
  </NuxtLink>
</template>

<style module lang="scss">
@use 'tools' as *;

.card {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  height: 100%;
  padding: var(--fs-space-3);
  border: rem(1) solid var(--fs-color-line);
  border-radius: var(--fs-radius-2xl);
  background-color: var(--fs-color-white);
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  @media (hover: hover) {
    &:hover {
      border-color: var(--fs-color-black);
      transform: translateY(rem(-2));
    }
  }

  &:focus-visible {
    @include fs-focus-ring;
  }

  @include from-desktop {
    padding: var(--fs-space-4);
  }
}

.compact {
  padding: var(--fs-space-2) 0;
  border: 0;
  border-bottom: rem(1) solid var(--fs-color-line);
  border-radius: 0;

  &:last-child {
    border-bottom: 0;
  }

  @media (hover: hover) {
    &:hover {
      border-color: var(--fs-color-line);
      transform: none;
    }
  }
}

.head {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
  justify-content: space-between;
}

.number {
  font-family: var(--fs-font-display);
  font-size: rem(24);
  line-height: 1;
  color: var(--fs-color-gray);
}

.title {
  margin: 0;
  @include fs-h3;
  font-size: rem(21);

  @include from-desktop {
    font-size: rem(24);
  }
}

.lead {
  margin: 0;
  @include fs-text-sm;
  font-weight: 400;
  line-height: 1.5;
  color: var(--fs-color-gray);
  @include fs-line-clamp(3);
}

.compactLead {
  @include fs-line-clamp(2);
}

.foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  align-items: center;
  margin-top: auto;
  padding-top: var(--fs-space-1);

  .compact & {
    padding-top: 0;
  }
}

.meta {
  @include fs-text-xs;
  color: var(--fs-color-gray);
  white-space: nowrap;
}
</style>
